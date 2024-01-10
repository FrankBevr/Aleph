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
/**
 * Validates and parses the provided options for Proxy deployment.
 *
 * @param {any} opts - The options object potentially containing the deploy domain
 * @returns {ProxyDeployOpts} Validated and parsed options.
 */
function validateProxyDeployOpts(opts) {
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
function proxyDeploy(opts) {
    return __awaiter(this, void 0, void 0, function* () {
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
            function handleClient() {
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
                        method: "proxy-deploy",
                        domain: validatedOpts.domain
                    }));
                    const response2 = yield nextMessage();
                    if (response2 !== "true") {
                        throw new Error("Proxy deploy failed, received: " + response2);
                    }
                    console.log("Proxy deploy successful!");
                });
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
    });
}
/* TODO
 * 1. Make sure that deploy only takes a single domain asa option
 * 2. Connect over websocket and proxy deploy command
 * HINT: Look at Proxy DEPLOY for reference
 */
export function useCommandProxyDeploy(parentCommand) {
    var _a;
    const proxyCommand = (_a = parentCommand.commands.find((command) => command.name() === "proxy")) !== null && _a !== void 0 ? _a : parentCommand.command("proxy");
    const deployCommand = proxyCommand.command("deploy");
    deployCommand.description("Deploys a proxy");
    deployCommand.option("-d, --domain <domain>", "Domain name");
    deployCommand.action(proxyDeploy);
}
