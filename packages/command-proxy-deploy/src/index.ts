import { Command } from "commander";
import { existsSync, rmdirSync } from "fs";
import path from "path";
import * as os from "os";
import * as fs from "fs";
import { WebSocket } from "ws";

interface ProxyDeployOpts {
    domain: string;
    baseDomain: string;
}

/**
 * Validates and parses the provided options for Proxy deployment.
 * 
 * @param {any} opts - The options object potentially containing the deploy domain
 * @returns {ProxyDeployOpts} Validated and parsed options.
 */
function validateProxyDeployOpts(opts: any): ProxyDeployOpts {
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

async function proxyDeploy(opts: any) {
    console.log("Proxy Deploy");

    const validatedOpts = validateProxyDeployOpts(opts);
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
                    method: "proxy-deploy",
                    domain: validatedOpts.domain
                })
            );

            const response2 = await nextMessage();
            if (response2 !== "true") {
                throw new Error("Proxy deploy failed, received: " + response2);
            }

            console.log("Proxy deploy successful!");
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
 * 1. Make sure that deploy only takes a single domain asa option
 * 2. Connect over websocket and proxy deploy command
 * HINT: Look at Proxy DEPLOY for reference
 */
export function useCommandProxyDeploy(
    parentCommand: Command
): void {
    const proxyCommand = parentCommand.commands.find((command) => command.name() === "proxy")
        ?? parentCommand.command("proxy");
    const deployCommand = proxyCommand.command("deploy");
    deployCommand.description("Deploys a proxy");
    deployCommand.option("-d, --domain <domain>", "Domain name");
    deployCommand.action(proxyDeploy);
}
