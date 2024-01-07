import { Command } from "commander";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { WebSocket } from "ws";

interface ServerConnectOpts {
    serverDomain: string;
    deployKey: string;
    serverWsPort: number;
}

/**
 * Validates the provided options for connecting to the server.
 * 
 * @param {any} opts - The options object potentially containing the server domain,
 *   deploy key, and server WebSocket port.
 * @returns {ServerConnectOpts} Validated and parsed options.
 */
function validateServerConnectOpts(opts: any): ServerConnectOpts {
    if (!opts.serverDomain || typeof opts.serverDomain !== 'string') {
        throw new Error("serverDomain must be a string and is required");
    }

    if (!opts.deployKey || typeof opts.deployKey !== 'string') {
        throw new Error("deployKey must be a string and is required");
    }

    const serverWsPort = parseInt(opts.serverWsPort);
    if (isNaN(serverWsPort)) {
        throw new Error("serverWsPort must be a number");
    }

    return {
        serverDomain: opts.serverDomain,
        deployKey: opts.deployKey,
        serverWsPort
    };
}

/**
 * Connects to the server using the provided options.
 * 
 * @param {any} opts - The options object containing the server domain,
 *   deploy key, and server WebSocket port.
 */
async function serverConnect(opts: any) {
    console.log("Server connect");

    const validatedOpts = validateServerConnectOpts(opts);

    // Construct the path to save the deploy key.
    const userHomeDir = os.homedir();
    const deployKeyDir = path.join(userHomeDir, ".alephhack2024", "domains", validatedOpts.serverDomain);
    const deployKeyPath = path.join(deployKeyDir, "deploy-key");
    const wsPortPath = path.join(deployKeyDir, "ws-port");

    // Establish a WebSocket connection.
    const ws = new WebSocket(`wss://${validatedOpts.serverDomain}:${validatedOpts.serverWsPort}`);

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
                    key: validatedOpts.deployKey
                })
            );
            const response = await nextMessage();

            if (response !== "true") {
                throw new Error("Authentication failed, received: " + response);
            }

            // Create directories if they don't exist.
            if (!fs.existsSync(deployKeyDir)) {
                fs.mkdirSync(deployKeyDir, { recursive: true });
            }

            // Save the deploy key to the specified path.
            fs.writeFileSync(deployKeyPath, validatedOpts.deployKey);

            // Save the server ws port to the specified path.
            fs.writeFileSync(wsPortPath, validatedOpts.serverWsPort.toString());

            console.log("Connected to server successfully!");
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
        // TODO: Handle any cleanup or finalization after closing the connection.
    });

    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
        // TODO: Handle WebSocket errors.
    });
}

/**
 * Adds the server connect command to the parent command.
 * 
 * @param {Command} parentCommand - The parent commander Command object.
 */
export function useCommandServerConnect(
    parentCommand: Command
): void {

    const serverCommand = parentCommand.commands.find((command) => command.name() === "server")
        ?? parentCommand.command("server");
    const serverConnectCommand = serverCommand.command("connect");
    serverConnectCommand.description("Connects to the server");
    serverConnectCommand.option("--server-domain <serverDomain>", "The domain of the server");
    serverConnectCommand.option("--deploy-key <deployKey>", "The deploy key of the server");
    serverConnectCommand.option("--server-ws-port <serverWsPort>", "The port of the server websocket");
    serverConnectCommand.action(serverConnect);
}
