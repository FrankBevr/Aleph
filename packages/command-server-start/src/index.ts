import { Command } from "commander";
import express from "express";
import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import {
    WebSocketServer,
    WebSocket
} from "ws";
import JSZip from "jszip";

/** This interface is essential for ensuring that all necessary configurations are provided and valid for the server to start properly. Each property is carefully validated within the checkOpts function to ensure the server starts with correct and sensible settings. */
interface CheckedStartOpts {
    /**
     * The port number for the HTTP server. This is the port on which the HTTP server
     * will listen for incoming requests. The default value is set to 80, which is the
     * standard port for HTTP traffic.
     */
    httpPort: number;

    /**
     * The port number for the HTTPS server. This is the port on which the HTTPS server
     * will listen for secure incoming requests. The default value is set to 443, which is
     * the standard port for HTTPS traffic.
     */
    httpsPort: number;

    /**
     * The port number for the WebSocket server. This is the port on which the WebSocket
     * server will listen for incoming WebSocket connections. The default value is set to 8080.
     */
    wsPort: number;

    /**
     * The file path to the TLS (Transport Layer Security) key file. This is used to secure
     * the HTTPS connections. The file contains the private key necessary for TLS encryption.
     * If not provided, the value is an empty string.
     */
    tlsKeyFile: string;

    /**
     * The file path to the TLS certificate file. This certificate is used in conjunction with
     * the TLS key for establishing a secure HTTPS connection. If not provided, the value is
     * an empty string.
     */
    tlsCertFile: string;

    /**
     * The password for the TLS key file, if any. This is required if the TLS key file is encrypted.
     * If not provided, the value is an empty string.
     */
    tlsKeyPass: string;

    /**
     * The directory path where the server's configuration and other related files are stored.
     * This path is used to access various server configurations and is essential for the server's
     * operation. The value must not be empty.
     */
    serverDir: string;

    /**
     * The domain name of the server. This is used for various server operations and configurations.
     * The value must not be empty, indicating the server's domain.
     */
    serverDomain: string;
}


/**
 * Validates and parses the provided options for starting the server.
 * It ensures that all required options are present and correctly formatted.
 * If any validation fails, an error is thrown with a descriptive message.
 * 
 * @param {any} opts - The options object containing configuration settings.
 *   This object may contain properties for httpPort, httpsPort, wsPort,
 *   tlsKeyFile, tlsCertFile, tlsKeyPass, serverDir, and serverDomain.
 * @returns {CheckedStartOpts} An object of type CheckedStartOpts with
 *   validated and parsed server start options.
 */
function checkOpts(opts: any): CheckedStartOpts {
    // Parse and validate the port numbers. Default values are provided for each port.
    const httpPort = parseInt(`${opts.httpPort ?? 80}`);
    const httpsPort = parseInt(`${opts.httpsPort ?? 443}`);
    const wsPort = parseInt(`${opts.wsPort ?? 3000}`);

    // Validate that the parsed port numbers are indeed numbers.
    if (isNaN(httpPort)) throw new Error("httpPort must be a number");
    if (isNaN(httpsPort)) throw new Error("httpsPort must be a number");
    if (isNaN(wsPort)) throw new Error("wsPort must be a number");

    // Ensure that the HTTP, HTTPS, and WebSocket ports are not the same.
    if (httpPort === httpsPort) throw new Error("httpPort and httpsPort must be different");
    if (httpPort === wsPort) throw new Error("httpPort and wsPort must be different");
    if (httpsPort === wsPort) throw new Error("httpsPort and wsPort must be different");

    // Extract file paths and server details, providing default empty strings where necessary.
    const tlsKeyFile = opts.tlsKeyFile ?? "";
    const tlsCertFile = opts.tlsCertFile ?? "";
    const tlsKeyPass = opts.tlsKeyPass ?? "";
    const serverDir = opts.serverDir ?? "";
    const serverDomain = opts.serverDomain ?? "";

    // Validate that the file paths and server details are strings.
    // Further validation for file paths being non-empty can be added if required.
    if (typeof tlsKeyFile !== "string") throw new Error("tlsKeyFile must be a string");
    if (typeof tlsCertFile !== "string") throw new Error("tlsCertFile must be a string");
    if (typeof tlsKeyPass !== "string") throw new Error("tlsKeyPass must be a string");
    if (typeof serverDir !== "string") throw new Error("serverDir must be a string");
    if (typeof serverDomain !== "string") throw new Error("serverDomain must be a string");

    // Ensure that the server directory and domain are not empty.
    if (serverDir === "") throw new Error("serverDir must not be empty");
    if (serverDomain === "") throw new Error("serverDomain must not be empty");

    // Return the validated and parsed options.
    return {
        httpPort,
        httpsPort,
        wsPort,
        tlsKeyFile,
        tlsCertFile,
        tlsKeyPass,
        serverDir,
        serverDomain,
    };
}


/** Defines the structure for the TLS (Transport Layer Security) options after they have been checked and verified. */
interface CheckedTlsOpts {
    /**
     * Indicates whether TLS is enabled or not. If both the TLS key and certificate
     * files are provided and exist, this will be true, otherwise false.
     */
    tlsEnabled: boolean;

    /**
     * The content of the TLS key file as a string. This key is used for setting up
     * HTTPS connections. If TLS is not enabled, this will be an empty string.
     */
    tlsKey: string;

    /**
     * The content of the TLS certificate file as a string. This certificate, along
     * with the TLS key, is used for securing HTTPS connections. If TLS is not
     * enabled, this will be an empty string.
     */
    tlsCert: string;

    /**
     * The password for the TLS key file, if any. This is required if the TLS key
     * file is encrypted. If TLS is not enabled, or no password is required, this
     * will be an empty string.
     */
    tlsKeyPass: string;
}


/**
 * Validates the TLS options based on the provided start options. It checks
 * whether the TLS key and certificate files exist and reads their content.
 * If the files do not exist, TLS is considered not enabled.
 * 
 * @param {CheckedStartOpts} opts - The validated start options containing
 *   paths to the TLS key and certificate files and the key password.
 * @returns {CheckedTlsOpts} An object of type CheckedTlsOpts containing
 *   the TLS configuration details.
 */
function checkTlsOpts(opts: CheckedStartOpts): CheckedTlsOpts {
    // Check if TLS key file and certificate file paths are provided.
    if (!opts.tlsKeyFile || !opts.tlsCertFile) {
        return {
            tlsEnabled: false,
            tlsKey: "",
            tlsCert: "",
            tlsKeyPass: "",
        };
    }

    // Verify the existence of the TLS key file.
    if (!fs.existsSync(opts.tlsKeyFile)) {
        console.log("TLS key file does not exist: ", opts.tlsKeyFile);
        return {
            tlsEnabled: false,
            tlsKey: "",
            tlsCert: "",
            tlsKeyPass: "",
        }
    }

    // Verify the existence of the TLS certificate file.
    if (!fs.existsSync(opts.tlsCertFile)) {
        console.log("TLS cert file does not exist: ", opts.tlsCertFile);
        return {
            tlsEnabled: false,
            tlsKey: "",
            tlsCert: "",
            tlsKeyPass: "",
        }
    }

    // Read the content of the TLS key and certificate files.
    const tlsKey = fs.readFileSync(opts.tlsKeyFile).toString("utf-8");
    const tlsCert = fs.readFileSync(opts.tlsCertFile).toString("utf-8");

    // Return the TLS configuration with the file contents.
    return {
        tlsEnabled: true,
        tlsKey,
        tlsCert,
        tlsKeyPass: opts.tlsKeyPass,
    };
}

/** Defines the structure for the server directory information after it has been checked and validated. */
interface CheckedServerDir {
    /**
     * The absolute path to the server directory. This directory contains essential
     * server files and configurations. It is validated to exist in the file system.
     */
    path: string;

    /**
     * The absolute path to the server's configuration directory. This subdirectory
     * within the server directory holds configuration files. It is validated to exist.
     */
    configPath: string;

    /**
     * The absolute path to the server's virtual hosts directory. This subdirectory
     * within the server directory is used for storing virtual host configurations.
     * It is validated to exist in the file system.
     */
    vhostsPath: string;
}


/**
 * Validates the server directory based on the provided start options. It checks
 * the existence of the server directory and its essential subdirectories like
 * 'config' and 'vhosts'. Absolute paths for these directories are constructed and returned.
 *
 * @param {CheckedStartOpts} opts - The validated start options containing
 *   the path to the server directory.
 * @returns {CheckedServerDir} An object of type CheckedServerDir containing
 *   the paths to the server directory and its essential subdirectories.
 */
function checkServerDir(opts: CheckedStartOpts): CheckedServerDir {
    // Validate the existence of the main server directory.
    if (!fs.existsSync(opts.serverDir)) {
        throw new Error(`Server directory does not exist: ${opts.serverDir}`);
    }

    // Construct the absolute paths for the server directory and its subdirectories.
    const serverDir = path.resolve(opts.serverDir);
    const configPath = path.resolve(serverDir, "config");
    const vhostsPath = path.resolve(serverDir, "vhosts");

    // Validate the existence of the 'config' subdirectory.
    if (!fs.existsSync(configPath)) {
        throw new Error(`Server config directory does not exist: ${configPath}`);
    }

    // Validate the existence of the 'vhosts' subdirectory.
    if (!fs.existsSync(vhostsPath)) {
        throw new Error(`Server vhosts directory does not exist: ${vhostsPath}`);
    }

    // Return the validated paths for the server directory and its subdirectories.
    return {
        path: serverDir,
        configPath,
        vhostsPath,
    };
}


/**
 * Handles HTTP requests for a CDN virtual host. It serves static files
 * from the specified vhost directory. The function sets appropriate
 * headers for CORS (Cross-Origin Resource Sharing) and handles 'OPTIONS'
 * requests. If the requested file does not exist, it responds with a
 * 404 error.
 * 
 * @param {string} vhostDirectory - The directory path for the virtual host.
 *   This directory contains the static files to be served.
 * @param {express.Request} req - The HTTP request object from Express.js.
 *   This contains information about the client's request.
 * @param {express.Response} res - The HTTP response object from Express.js.
 *   This is used to send back the response to the client.
 */
async function handleCdnVhostRequest(
    vhostDirectory: string,
    req: express.Request,
    res: express.Response,
) {
    // Set CORS headers to allow requests from any origin.
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Accept, Content-Type, Origin, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");

    // Handle pre-flight OPTIONS request.
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
        return;
    }

    // Determine the requested file. Default to "index.html" if the root is requested.
    const requestFile = req.path === "/" ? "index.html" : req.path.substring(1);

    // Resolve the path to the requested file within the vhost directory.
    const fileInVhostPath = path.resolve(vhostDirectory, requestFile);

    // Check if the requested file exists.
    const fileInVhostExists = fs.existsSync(fileInVhostPath);

    // If the file does not exist, respond with a 404 error.
    if (!fileInVhostExists) {
        res.status(404).send("Not found: " + req.path);
        return;
    }

    // Serve the requested file.
    res.sendFile(fileInVhostPath);
}

/** Used to represent a HTTP request that is being proxied through the server. It captures essential details of an incoming HTTP request. */
type ProxiedRequest = {
    /**
     * The HTTP method of the request, e.g., 'GET', 'POST', 'PUT', etc.
     */
    method: string;

    /**
     * The path of the request. This does not include the domain, but includes
     * the URI and any query parameters.
     */
    path: string;

    /**
     * A record of the request headers. Each header is represented as a key-value pair,
     * where the key is the header name and the value is the header content.
     */
    headers: Record<string, string | string[]>;

    /**
     * The body of the request, represented as a string. This is typically used for methods
     * like POST or PUT where data is sent in the request body.
     */
    body: string;
}
/** Used to represent a HTTP response that is being sent back from the proxy server to the client. */
type ProxiedResponse = {
    /**
     * The status code of the response, e.g., 200 for success, 404 for not found, etc.
     */
    statusCode: number;

    /**
     * A record of the response headers. Each header is represented as a key-value pair.
     */
    headers: Record<string, string | string[]>;

    /**
     * The body of the response, represented as a string.
     */
    body: string;
}
/** A function type used for handling proxied requests. */
type ProxyListener = (
    /**
     * The incoming proxied request.
     */
    request: ProxiedRequest
) => Promise<ProxiedResponse>;
/** Used to represent a client that has connected to the WebSocket server. It holds information about the connection status and the WebSocket instance. */
type ConnectedWebSocketClient = {
    /**
     * Represents the connection status of the WebSocket client.
     * 'connected' means the client has established a connection.
     * 'authenticated' means the client has successfully authenticated.
     */
    status: 'connected' | 'authenticated';

    /**
     * The WebSocket instance associated with the client.
     */
    ws: WebSocket;
}

/**
 * The IngressServer class represents a server capable of handling HTTP/HTTPS requests,
 * WebSocket connections, and proxying requests. It maintains configurations and states
 * necessary for these functionalities.
 */
class IngressServer {
    // A collection of proxy listeners keyed by domain. These listeners are used to handle
    // proxy requests for different domains.
    private _proxyListeners: Record<string, ProxyListener> = {};

    // The deploy key used for authentication purposes.
    private _deployKey: string = "";

    // An array of connected WebSocket clients. Each client is tracked with its
    // status (connected or authenticated) and the WebSocket object.
    private _connectedWebSocketClients: Array<ConnectedWebSocketClient> = [];

    /**
     * Constructs an IngressServer instance.
     * 
     * @param {CheckedServerDir} _serverDir - The checked server directory configuration.
     * @param {string} _serverDomain - The server's domain.
     * @throws {Error} If the server domain is empty.
     */
    constructor(
        private _serverDir: CheckedServerDir,
        private _serverDomain: string,
    ) {
        if (_serverDomain === "") {
            throw new Error("serverDomain must not be empty");
        }

        console.log("Loading deploy key ...");
        const deployKeyPath = path.resolve(this._serverDir.configPath, "domains", _serverDomain, "deploy-key");
        if (!fs.existsSync(deployKeyPath)) {
            throw new Error(`Deploy key file does not exist: ${deployKeyPath}! Use the 'server setup' command to generate a deploy key.`);
        }
        this._deployKey = fs.readFileSync(deployKeyPath).toString("utf-8");
        console.log("Loaded deploy key.");
    }

    /**
     * Gets the deploy key.
     * @returns {string} The deploy key.
     */
    public get deployKey(): string {
        return this._deployKey;
    }

    /**
     * Gets the server directory configuration.
     * @returns {CheckedServerDir} The server directory configuration.
     */
    public get serverDir(): CheckedServerDir {
        return this._serverDir;
    }

    /**
     * Adds a proxy listener for a specific domain.
     * @param {string} domain - The domain to add the listener for.
     * @param {ProxyListener} listener - The listener to handle proxy requests for the domain.
     */
    public addProxyListener(
        domain: string,
        listener: ProxyListener,
    ): void {
        this._proxyListeners[domain] = listener;
    }

    /**
     * Removes a proxy listener for a specific domain.
     * @param {string} domain - The domain to remove the listener for.
     */
    public removeProxyListener(
        domain: string,
    ): void {
        delete this._proxyListeners[domain];
    }

    /**
     * Retrieves a proxy listener for a specific domain.
     * @param {string} domain - The domain to retrieve the listener for.
     * @returns {ProxyListener | null} The proxy listener for the domain or null if not found.
     */
    public getProxyListener(
        domain: string,
    ): ProxyListener | null {
        return this._proxyListeners[domain] ?? null;
    }

    /**
     * Adds a WebSocket client to the list of connected clients.
     * @param {WebSocket} ws - The WebSocket connection of the client.
     * @returns {ConnectedWebSocketClient} The newly added WebSocket client.
     */
    public addWebSocketClient(
        ws: WebSocket,
    ): ConnectedWebSocketClient {
        const newClient: ConnectedWebSocketClient = {
            status: 'connected',
            ws,
        };
        this._connectedWebSocketClients.push(newClient);
        return newClient;
    }

    /**
     * Removes a WebSocket client from the list of connected clients.
     * @param {WebSocket} ws - The WebSocket connection of the client to remove.
     */
    public removeWebSocketClient(
        ws: WebSocket,
    ): void {
        this._connectedWebSocketClients = this._connectedWebSocketClients.filter((client) => {
            return client.ws !== ws;
        });
    }
}


/* TODO
 * Error Handling
 * 1. If there is not active proxy listener, then return 503 server unavailable
 * 2. If proxy timesout, then return 504 gateway timeout
 * 3. Add ErrorPages
 */
function createVhostMiddleware(
    server: IngressServer
): express.Handler {
    return async (req, res, next) => {
        console.log("Vhost middleware");

        const vhost = req.hostname;
        const matchAgainst = [
            vhost,
            `www.${vhost}`,
        ];

        const vhostDirectories = fs.readdirSync(server.serverDir.vhostsPath);
        const actualVhostDirectories = vhostDirectories.filter((vhostDirectory) => {
            return fs.existsSync(path.resolve(server.serverDir.vhostsPath, vhostDirectory, "vhost.json"));
        });
        const matchedVhostDirectories = actualVhostDirectories.filter((vhostDirectory) => {
            return matchAgainst.includes(vhostDirectory);
        });

        if (matchedVhostDirectories.length === 0) {
            console.log("No vhost found");
            next();
            return;
        }

        const vhostDirectory = matchedVhostDirectories[0];
        const vhostConfigPath = path.resolve(server.serverDir.vhostsPath, vhostDirectory, "vhost.json");
        const vhostConfig = JSON.parse(fs.readFileSync(vhostConfigPath).toString("utf-8"));

        if (vhostConfig.type === "cdn") {
            await handleCdnVhostRequest(
                path.resolve(server.serverDir.vhostsPath, vhostDirectory),
                req,
                res,
            );
            return;
        } else if (vhostConfig.type === "proxy") {
            const proxyListener = server.getProxyListener(vhost);
            if (!proxyListener) {
                console.log("No proxy listener found");
                next();
                return;
            }
            const proxiedRequest: ProxiedRequest = {
                method: req.method,
                path: req.path,
                headers: {},
                body: "",
            };
            for (const [key, value] of Object.entries(req.headers)) {
                proxiedRequest.headers[key] = value!;
            }
            if (typeof req.body === "string") {
                proxiedRequest.body = req.body;
            } else {
                proxiedRequest.body = JSON.stringify(req.body);
            }
            const proxiedResponse = await proxyListener(proxiedRequest);
            res.status(proxiedResponse.statusCode);
            for (const [key, value] of Object.entries(proxiedResponse.headers)) {
                res.header(key, value);
            }
            res.send(proxiedResponse.body);
            return;
        } else {
            console.log("Unknown vhost type: ", vhostConfig.type);
        }

        next();
    }
}

/**
 * Deploys content for a CDN vhost. It takes a Base64-encoded ZIP file containing
 * the CDN content, extracts it, and saves it to the specified domain's directory
 * in the server's vhosts path. If the vhost directory already exists, it's first
 * removed to ensure a clean deployment.
 * 
 * @param {IngressServer} server - The IngressServer instance used for the deployment.
 * @param {string} domain - The domain name for which the CDN content is being deployed.
 * @param {string} cdnContentZipBase64 - A Base64-encoded string of the ZIP file that
 *   contains the CDN content to be deployed.
 * @returns {Promise<void>} A promise that resolves when the deployment process is complete.
 */
async function cdnDeploy(
    server: IngressServer,
    domain: string,
    cdnContentZipBase64: string,
): Promise<void> {
    console.log("CDN deploy");

    // Resolve the path for the domain's vhost directory.
    const vhostDirectory = path.resolve(server.serverDir.vhostsPath, domain);
    const vhostConfigPath = path.resolve(vhostDirectory, "vhost.json");
    const vhostConfig = { type: "cdn" };

    // Remove the existing CDN directory if it exists to ensure a clean deployment.
    if (fs.existsSync(vhostDirectory)) {
        fs.rmSync(vhostDirectory, { recursive: true });
    }

    // Create the new CDN directory.
    fs.mkdirSync(vhostDirectory);

    // Create or overwrite the vhost.json file with CDN type configuration.
    fs.writeFileSync(vhostConfigPath, JSON.stringify(vhostConfig));

    // Decode the Base64-encoded ZIP file data and initialize a new JSZip instance.
    const cdnContentZipData = Buffer.from(cdnContentZipBase64, "base64");
    const cdnContentZip = new JSZip();

    // Load the ZIP file data asynchronously.
    await cdnContentZip.loadAsync(cdnContentZipData);

    // An array to hold promises for writing files.
    const fileWritePromises: Array<Promise<void>> = [];

    // Iterate over each entry in the ZIP file.
    cdnContentZip.forEach(
        (relativePath, file) => {
            // Resolve the full path for the file within the vhost directory.
            const filePath = path.resolve(vhostDirectory, relativePath);
            // Create directories as needed.
            if (file.dir) {
                fs.mkdirSync(filePath, { recursive: true });
            } else {
                // Read the file content and write it to the corresponding path.
                const fileContent = file.nodeStream("nodebuffer");
                const fileContentData: Array<Buffer> = [];
                fileContent.on("data", (chunk) => {
                    fileContentData.push(chunk);
                });
                const fileWritePromise = new Promise<void>((resolve, reject) => {
                    fileContent.on("end", () => {
                        const fileContentBuffer = Buffer.concat(fileContentData);
                        fs.writeFileSync(filePath, fileContentBuffer);
                        resolve();
                    });
                    fileContent.on("error", (err) => {
                        reject(err);
                    });
                });
                fileWritePromises.push(fileWritePromise);
            }
        }
    );
    // Wait for all file write operations to complete.
    await Promise.all(fileWritePromises);
}


/**
 * Removes the CDN configuration for a specified domain. This function deletes
 * the directory associated with the domain's CDN deployment, effectively
 * undeploying the CDN content for that domain.
 * 
 * @param {IngressServer} server - An instance of IngressServer which manages
 *   the server configurations and state.
 * @param {string} domain - The domain for which the CDN deployment should be
 *   undeployed. This is the identifier for the CDN configuration to remove.
 * @returns {Promise<void>} A promise that resolves when the undeployment process
 *   is complete. If there's an issue with the undeployment, the promise may reject.
 */
async function cdnUndeploy(
    server: IngressServer,
    domain: string,
): Promise<void> {
    console.log("CDN undeploy");

    // Resolve the path to the vhost directory for the specified domain.
    const vhostDirectory = path.resolve(server.serverDir.vhostsPath, domain);

    // Check if the CDN directory for the domain exists.
    if (fs.existsSync(vhostDirectory)) {
        // If the directory exists, remove it recursively.
        // This includes all files and subdirectories in the CDN deployment.
        fs.rmSync(vhostDirectory, { recursive: true });
    }
}
/*TODO
 * 1. Proxy Deploy
 * 1.1 only takes a domain
 * 1.2 creates a vhost.json in ../../cli/server/vhosts/domain/vhost.json
 * 1.3 clear the director 
 * 1.4 it should be a single json object that has the following `{"type": "proxy"}`
 */

/*TODO
 * 1. Write proxy deploy cli command
 * 2. Create new package `command-proxy-deploy`
 * 3. Open websocket connect, send proxy deploy to the server
 * 4. see cdn deploy for reference
 */

type AuthenticatedMessage = {
    method: "cdn-deploy" | "cdn-undeploy" | "proxy-deploy" | "proxy-undeploy" | "proxy-serve";
    domain: string;

    cdnContentZipBase64?: string;
}

function onWebSocketConnection(
    server: IngressServer,
    ws: WebSocket,
): void {
    console.log("WS connection");
    const client = server.addWebSocketClient(ws);
    ws.on("message", (message) => {

        if (client.status === "connected") {
            // Only accept message {"method": "authenticate", "key": "..."}
            try {
                const parsedMessage = JSON.parse(message.toString("utf-8"));
                if (parsedMessage.method === "authenticate" && parsedMessage.key === server.deployKey) {
                    client.status = "authenticated";
                    console.log("WS client authenticated");
                    ws.send(JSON.stringify(true));
                } else {
                    console.log("WS client authentication failed");
                    ws.close();
                }
            } catch (err) {
                console.log("WS client authentication failed");
                ws.close();
            }
        } else if (client.status === "authenticated") {
            // Parse the message into authenticatedMessage
            let authenticatedMessage: AuthenticatedMessage;
            try {
                authenticatedMessage = JSON.parse(message.toString("utf-8"));
            } catch (err) {
                console.log("WS client sent invalid message");
                ws.close();
                return;
            }

            // Check that the message is valid
            if (!authenticatedMessage.method) {
                console.log("WS client sent invalid message");
                ws.close();
                return;
            }

            // Handle the message
            if (authenticatedMessage.method === "cdn-deploy") {
                console.log("WS client sent cdn-deploy message");
                if (!authenticatedMessage.domain) {
                    console.log("WS client sent invalid message");
                    ws.close();
                    return;
                }

                if (!authenticatedMessage.cdnContentZipBase64) {
                    console.log("WS client sent invalid message");
                    ws.close();
                    return;
                }

                cdnDeploy(
                    server,
                    authenticatedMessage.domain,
                    authenticatedMessage.cdnContentZipBase64,
                ).then(() => {
                    ws.send(JSON.stringify(true));
                }).catch((err) => {
                    console.log("CDN deploy failed: ", err);
                    ws.send(JSON.stringify(false));
                });
            } else if (authenticatedMessage.method === "cdn-undeploy") {
                console.log("WS client sent cdn-undeploy message");
                if (!authenticatedMessage.domain) {
                    console.log("WS client sent invalid message");
                    ws.close();
                    return;
                }

                cdnUndeploy(
                    server,
                    authenticatedMessage.domain,
                ).then(() => {
                    ws.send(JSON.stringify(true));
                }).catch((err) => {
                    console.log("CDN undeploy failed: ", err);
                    ws.send(JSON.stringify(false));
                });
            } else if (authenticatedMessage.method === "proxy-deploy") {
                console.log("WS client sent proxy-deploy message");
                ws.send(JSON.stringify(false));
            } else if (authenticatedMessage.method === "proxy-undeploy") {
                console.log("WS client sent proxy-undeploy message");
                ws.send(JSON.stringify(false));
            } else if (authenticatedMessage.method === "proxy-serve") {
                console.log("WS client sent proxy-serve message");
                ws.send(JSON.stringify(false));
            } else {
                console.log("WS client sent invalid message");
                ws.close();
                return;
            }
        }
    });
    ws.on("close", () => {
        console.log("WS close");
        server.removeWebSocketClient(ws);
    });
}

async function serverStart(opts: any) {
    console.log("Server start");

    const checkedOpts = checkOpts(opts);

    console.log("httpPort", checkedOpts.httpPort);
    console.log("httpsPort", checkedOpts.httpsPort);
    console.log("wsPort", checkedOpts.wsPort);
    console.log("tlsKeyFile", checkedOpts.tlsKeyFile);
    console.log("tlsCertFile", checkedOpts.tlsCertFile);
    console.log("tlsKeyPass", checkedOpts.tlsKeyPass);
    console.log("serverDir", checkedOpts.serverDir);
    console.log("serverDomain", checkedOpts.serverDomain);

    const checkedTlsOpts = checkTlsOpts(checkedOpts);
    const checkedServerDir = checkServerDir(checkedOpts);

    const server = new IngressServer(checkedServerDir, checkedOpts.serverDomain);

    const app = express();
    const httpToHttpsRedirect = express();

    httpToHttpsRedirect.use(
        (req, res, next) => {
            if (req.secure) {
                next();
            } else {
                res.redirect(`https://${req.hostname}:${checkedOpts.httpsPort}${req.url}`);
            }
        }
    );

    app.use(
        createVhostMiddleware(server)
    );

    app.get("/healthcheck", async (req, res) => {
        res.send("OK");
    });

    const servers = {
        http: http.createServer(
            checkedTlsOpts.tlsEnabled
                ? httpToHttpsRedirect
                : app
        ),
        https: checkedTlsOpts.tlsEnabled ? https.createServer({
            key: checkedTlsOpts.tlsKey,
            cert: checkedTlsOpts.tlsCert,
            passphrase: checkedTlsOpts.tlsKeyPass,
        }, app) : null,
        ws: checkedTlsOpts.tlsEnabled ? https.createServer({
            key: checkedTlsOpts.tlsKey,
            cert: checkedTlsOpts.tlsCert,
            passphrase: checkedTlsOpts.tlsKeyPass,
        }) : http.createServer(),
    };

    const listeningPromises = [];

    if (servers.http) {
        const listeningPromise = new Promise((resolve, reject) => {
            servers.http.listen(checkedOpts.httpPort, () => {
                console.log(`HTTP server listening on port ${checkedOpts.httpPort}`);
                resolve(null);
            });
        });
        listeningPromises.push(listeningPromise);
    }

    if (servers.https) {
        const listeningPromise = new Promise((resolve, reject) => {
            servers.https!.listen(checkedOpts.httpsPort, () => {
                console.log(`HTTPS server listening on port ${checkedOpts.httpsPort}`);
                resolve(null);
            });
        });
        listeningPromises.push(listeningPromise);
    }

    if (servers.ws) {
        const listeningPromise = new Promise((resolve, reject) => {
            const wss = new WebSocketServer({ server: servers.ws });
            wss.on("connection", (ws) => {
                onWebSocketConnection(server, ws);
            });
            servers.ws.listen(checkedOpts.wsPort, () => {
                console.log(`WS server listening on port ${checkedOpts.wsPort}`);
                resolve(null);
            });
        });
        listeningPromises.push(listeningPromise);
    }

    const listeningPromise = Promise.all(listeningPromises);

    await listeningPromise;

}

export function useCommandServerStart(
    parentCommand: Command
): void {

    const serverCommand = parentCommand.commands.find((command) => command.name() === "server")
        ?? parentCommand.command("server");
    const serverStartCommand = serverCommand.command("start");
    serverStartCommand.description("Starts the server");
    serverStartCommand.option("--http-port <httpPort>", "The port to listen on for HTTP requests")
    serverStartCommand.option("--https-port <httpsPort>", "The port to listen on for HTTPS requests")
    serverStartCommand.option("--ws-port <wsPort>", "The port to listen on for WebSocket requests")
    serverStartCommand.option("--tls-key-file <tlsKeyFile>", "The path to the TLS key file")
    serverStartCommand.option("--tls-cert-file <tlsCertFile>", "The path to the TLS cert file")
    serverStartCommand.option("--tls-key-pass <tlsKeyPass>", "The password for the TLS key file")
    serverStartCommand.option("--server-dir <serverDir>", "The path to the server directory")
    serverStartCommand.option("--server-domain <serverDomain>", "The domain of the server")
    serverStartCommand.action(serverStart);

}
