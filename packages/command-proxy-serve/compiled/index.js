var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import * as os from "os";
import * as fs from "fs";
import { WebSocket } from "ws";
import * as http from "http";
/**
 * Validates and parses the provided options for Proxy serving.
 *
 * @param {any} opts - The options object potentially containing the deploy domain
 * @returns {ProxyDeployOpts} Validated and parsed options.
 */
function validateProxyServeOpts(opts) {
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
function sendProxiedRequest(opts, proxiedRequest) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const httpPromise = new Promise((resolve, reject) => {
            const rewrittenHeaders = Object.assign({}, proxiedRequest.headers);
            rewrittenHeaders["host"] = opts.host;
            try {
                const req = http.request({
                    method: proxiedRequest.method,
                    path: proxiedRequest.path,
                    headers: proxiedRequest.headers,
                    host: opts.host,
                    port: opts.port
                }, (res) => {
                    resolve(res);
                });
                req.write(proxiedRequest.body);
                req.end();
            }
            catch (err) {
                reject(err);
            }
        });
        const res = yield httpPromise;
        const proxiedResponse = {
            id: proxiedRequest.id,
            statusCode: (_a = res.statusCode) !== null && _a !== void 0 ? _a : 500,
            headers: Object.keys(res.headers).reduce((headers, headerName) => {
                headers[headerName] = res.headers[headerName];
                return headers;
            }, {}),
            body: ""
        };
        const bodyPromise = new Promise((resolve, reject) => {
            try {
                let body = "";
                res.on("data", (chunk) => {
                    body += chunk.toString("utf-8");
                });
                res.on("end", () => {
                    resolve(body);
                });
            }
            catch (err) {
                reject(err);
            }
        });
        proxiedResponse.body = yield bodyPromise;
        return proxiedResponse;
    });
}
function proxyServe(opts) {
    return __awaiter(this, void 0, void 0, function* () {
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
            function nextMessage() {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise((resolve, reject) => {
                        ws.once('message', (data) => {
                            resolve(data.toString("utf-8"));
                        });
                        ws.once('close', (code, reason) => {
                            reject(new Error(`WebSocket closed unexpectedly: ${code} ${reason}`));
                        });
                    });
                });
            }
            function handleClientRequest(message) {
                return __awaiter(this, void 0, void 0, function* () {
                    const messageData = JSON.parse(message.toString("utf-8"));
                    console.log("Received request:", messageData);
                    try {
                        const responseData = yield sendProxiedRequest(validatedOpts, messageData);
                        console.log("Sending response:", responseData);
                        const responseMethodCall = Object.assign({ method: "proxy-response" }, responseData);
                        ws.send(JSON.stringify(responseMethodCall));
                    }
                    catch (err) {
                        console.error(`Error sending proxied request: ${err}`);
                    }
                });
            }
            function handleClientAuth() {
                return __awaiter(this, void 0, void 0, function* () {
                    ws.send(JSON.stringify({
                        method: "authenticate",
                        key: deployKey
                    }));
                    const response = yield nextMessage();
                    if (response !== "true") {
                        throw new Error("Authentication failed, received: " + response);
                    }
                    ws.send(JSON.stringify({
                        method: "proxy-serve",
                        domain: validatedOpts.domain
                    }));
                    const response2 = yield nextMessage();
                    if (response2 !== "true") {
                        throw new Error("Proxy serve failed, received: " + response2);
                    }
                    console.log("Now listening for requests...");
                    ws.on("message", handleClientRequest);
                });
            }
            handleClientAuth()
                .then(() => {
                console.log("Handshake complete.");
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
    });
}
/* TODO
 * 1. Make sure that serve only takes a single domain asa option
 * 2. Connect over websocket and proxy serve command
 * HINT: Look at Proxy DEPLOY for reference
 */
export function useCommandProxyServe(parentCommand) {
    var _a;
    const proxyCommand = (_a = parentCommand.commands.find((command) => command.name() === "proxy")) !== null && _a !== void 0 ? _a : parentCommand.command("proxy");
    const serveCommand = proxyCommand.command("serve");
    serveCommand.description("Serves a proxy");
    serveCommand.option("-d, --domain <domain>", "Domain name");
    serveCommand.option("-h, --host <host>", "Host name to proxy to");
    serveCommand.option("-p, --port <port>", "Port to proxy to");
    serveCommand.action(proxyServe);
}
