import { Command } from "commander";
import { existsSync, rmdirSync } from "fs";
import path from "path";
import * as os from "os";
import * as fs from "fs";
import { WebSocket } from "ws";

interface ProxyUndeployOpts {
    domain: string;
    baseDomain: string;
}

/**
 * Validates and parses the provided options for Proxy undeployment.
 * 
 * @param {any} opts - The options object potentially containing the deploy domain
 * @returns {ProxyDeployOpts} Validated and parsed options.
 */
function validateProxyUndeployOpts(opts: any): ProxyUndeployOpts {
    if (!opts.domain || typeof opts.domain !== 'string') {
        throw new Error("domain must be a string and is required");
    }

    const domainParts = opts.domain.split(".");

    if (domainParts.length !== 2 && domainParts.length !== 3) {
        throw new Error("domain must be a string and is required (either full domain, or domain suffix)");
    }

    return {
        domain: opts.domain,
        baseDomain: domainParts.slice(-2).join(".")
    };
}

async function proxyUndeploy(opts: any) {
    console.log("Proxy Undeploy");

    const validatedOpts = validateProxyUndeployOpts(opts);
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

        async function handleClient() {
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
                    method: "proxy-undeploy",
                    domain: validatedOpts.domain
                })
            );

            const response2 = await nextMessage();
            if (response2 !== "true") {
                throw new Error("Proxy undeploy failed, received: " + response2);
            }

            console.log("Proxy undeploy successful!");
        }

        handleClient()
            .then(() => ws.close())
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
 * 1. Make sure that undeploy only takes a single domain asa option
 * 2. Connect over websocket and proxy undeploy command
 * HINT: Look at Proxy DEPLOY for reference
 */
export function useCommandProxyUndeploy(
    parentCommand: Command
): void {
    const proxyCommand = parentCommand.commands.find((command) => command.name() === "proxy")
        ?? parentCommand.command("proxy");
    const undeployCommand = proxyCommand.command("undeploy");
    undeployCommand.description("Undeploys a proxy");
    undeployCommand.option("-d, --domain <domain>", "Domain name");
    undeployCommand.action(proxyUndeploy);
}
