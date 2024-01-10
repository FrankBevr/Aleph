import { Command } from "commander";
import { existsSync, rmdirSync } from "fs";
import path from "path";
import * as os from "os";
import * as fs from "fs";
import { WebSocket } from "ws";
import * as http from "http";
import * as https from "https";

interface ProxyServeOpts {
    domain: string;
    host: string;
    port: number;
    baseDomain: string;
}

/**
 * Validates and parses the provided options for Proxy serving.
 * 
 * @param {any} opts - The options object potentially containing the deploy domain
 * @returns {ProxyDeployOpts} Validated and parsed options.
 */
function validateProxyServeOpts(opts: any): ProxyServeOpts {
    if (!opts.domain || typeof opts.domain !== 'string') {
        throw new Error("domain must be a string and is required");
    }

    const domainParts = opts.domain.split(".");

    if (domainParts.length !== 3) {
        throw new Error("domain must be a string and is required as a full domain");
    }

    if (!opts.host || typeof opts.host !== 'string') {
        throw new Error("host must be a string and is required");
    }

    if (!opts.port) {
        throw new Error("port must be a number and is required");
    }

    return {
        domain: opts.domain,
        host: opts.host,
        port: parseInt(`${opts.port}`),
        baseDomain: domainParts.slice(-2).join(".")
    };
}

interface ProxiedRequest {
    id: string;
    method: string;
    path: string;
    headers: Record<string, string>;
    body: string;
}

interface ProxiedResponse {
    id: string;
    statusCode: number;
    headers: Record<string, string>;
    body: string;
}

async function sendProxiedRequest(
    opts: ProxyServeOpts,
    proxiedRequest: ProxiedRequest
): Promise<ProxiedResponse> {
    const httpPromise: Promise<http.IncomingMessage> = new Promise((resolve, reject) => {

        const rewrittenHeaders: any = {
            ...proxiedRequest.headers,
        };
        rewrittenHeaders["host"] = opts.host;

        try {
            const req = http.request(
                {
                    method: proxiedRequest.method,
                    path: proxiedRequest.path,
                    headers: proxiedRequest.headers,
                    host: opts.host,
                    port: opts.port
                },
                (res) => {
                    resolve(res);
                }
            );
            req.write(proxiedRequest.body);
            req.end();
        } catch (err) {
            reject(err);
        }
    });

    const res = await httpPromise;

    const proxiedResponse: ProxiedResponse = {
        id: proxiedRequest.id,
        statusCode: res.statusCode ?? 500,
        headers: Object.keys(
            res.headers
        ).reduce((headers, headerName) => {
            headers[headerName] = res.headers[headerName];
            return headers;
        }, {} as any),
        body: ""
    };

    const bodyPromise: Promise<string> = new Promise((resolve, reject) => {
        try {
            let body = "";
            res.on("data", (chunk: Buffer) => {
                body += chunk.toString("utf-8");
            });
            res.on("end", () => {
                resolve(body);
            });
        } catch (err) {
            reject(err);
        }
    });

    proxiedResponse.body = await bodyPromise;

    return proxiedResponse;
}

async function proxyServe(opts: any) {
    console.log("Proxy Serve");

    const validatedOpts = validateProxyServeOpts(opts);
    const deployKeyPath = path.join(os.homedir(), ".alephhack2024", "domains", validatedOpts.baseDomain, "deploy-key");
    const wsPortPath = path.join(os.homedir(), ".alephhack2024", "domains", validatedOpts.baseDomain, "ws-port");

    if (!fs.existsSync(deployKeyPath)) {
        throw new Error(`Deploy key not found for domain: ${validatedOpts.domain}`);
    }
    if (!fs.existsSync(wsPortPath)) {
        throw new Error(`WebSocket port not found for domain: ${validatedOpts.domain}`);
    }

    const wsPort = parseInt(fs.readFileSync(wsPortPath, { encoding: "utf-8" }));
    if (isNaN(wsPort)) {
        throw new Error(`WebSocket port is not a number for domain: ${validatedOpts.domain}`);
    }

    const deployKey = fs.readFileSync(deployKeyPath, { encoding: "utf-8" });
    if (deployKey === "") {
        throw new Error(`Deploy key is empty for domain: ${validatedOpts.domain}`);
    }


    // Establish a WebSocket connection and authenticate.
    // TODO: Replace with actual WebSocket URL.
    const ws = new WebSocket(`wss://${validatedOpts.baseDomain}:${wsPort}`);

    ws.on('open', function open() {
        console.log('WebSocket connection established.');

        async function nextMessage() {
            return new Promise((resolve, reject) => {
                ws.once('message', (data) => {
                    resolve(data.toString("utf-8"));
                });
                ws.once('close', (code, reason) => {
                    reject(new Error(`WebSocket closed unexpectedly: ${code} ${reason}`));
                });
            });
        }

        async function handleClientRequest(message: Buffer) {
            const messageData = JSON.parse(message.toString("utf-8")) as ProxiedRequest;
            console.log("Received request:", messageData);
            try {
                const responseData = await sendProxiedRequest(validatedOpts, messageData);
                console.log("Sending response:", responseData);
                const responseMethodCall = {
                    method: "proxy-response",
                    ...responseData
                };
                ws.send(JSON.stringify(responseMethodCall));
            } catch (err) {
                console.error(`Error sending proxied request: ${err}`);
            }
        }

        async function handleClientAuth() {
            ws.send(
                JSON.stringify({
                    method: "authenticate",
                    key: deployKey
                })
            );

            const response = await nextMessage();
            if (response !== "true") {
                throw new Error("Authentication failed, received: " + response);
            }

            ws.send(
                JSON.stringify({
                    method: "proxy-serve",
                    domain: validatedOpts.domain
                })
            );

            const response2 = await nextMessage();
            if (response2 !== "true") {
                throw new Error("Proxy serve failed, received: " + response2);
            }

            console.log("Now listening for requests...");

            ws.on("message", handleClientRequest);
        }

        handleClientAuth()
            .then(() => {
                console.log("Handshake complete.")
            })
            .catch((err) => {
                console.error(err);
                ws.close();
            });
    });

    ws.on('close', function close() {
        console.log('WebSocket connection closed.');
        // TODO: Test GET request to https://<name>.<domain>.
    });

    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
        // TODO: Handle WebSocket errors.
    });
}

/* TODO
 * 1. Make sure that serve only takes a single domain asa option
 * 2. Connect over websocket and proxy serve command
 * HINT: Look at Proxy DEPLOY for reference
 */
export function useCommandProxyServe(
    parentCommand: Command
): void {
    const proxyCommand = parentCommand.commands.find((command) => command.name() === "proxy")
        ?? parentCommand.command("proxy");
    const serveCommand = proxyCommand.command("serve");
    serveCommand.description("Serves a proxy");
    serveCommand.option("-d, --domain <domain>", "Domain name");
    serveCommand.option("-h, --host <host>", "Host name to proxy to");
    serveCommand.option("-p, --port <port>", "Port to proxy to");
    serveCommand.action(proxyServe);
}
