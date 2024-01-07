import { Command } from "commander";
import * as fs from "fs";
import JSZip from "jszip";
import * as os from "os";
import * as path from "path";
import { WebSocket } from "ws";
// TODO: Import additional libraries needed for ZIP creation and Base64 encoding.

interface CdnDeployOpts {
    deployDir: string;
    deployDomain: string;
    deployBaseDomain: string;
}

/**
 * Validates and parses the provided options for CDN deployment.
 * 
 * @param {any} opts - The options object potentially containing the deploy directory
 *   and deploy domain.
 * @returns {CdnDeployOpts} Validated and parsed options.
 */
function validateCdnDeployOpts(opts: any): CdnDeployOpts {
    if (!opts.deployDir || typeof opts.deployDir !== 'string') {
        throw new Error("deployDir must be a string and is required");
    }

    let deployDomain = opts.deployDomain;
    if (!deployDomain || typeof deployDomain !== 'string') {
        throw new Error("deployDomain must be a string and is required (either full domain, or domain suffix)");
    }

    let deployDomainParts = deployDomain.split(".");

    if (deployDomainParts.length !== 2 && deployDomainParts.length !== 3) {
        throw new Error("deployDomain must be a string and is required (either full domain, or domain suffix)");
    }

    if (deployDomainParts.length === 2) {
        deployDomainParts = [
            Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            ...deployDomainParts,
        ];
        deployDomain = deployDomainParts.join(".");
        console.log(`Generated domain: ${deployDomain}`);
    }

    return {
        deployDir: opts.deployDir,
        deployDomain,
        deployBaseDomain: deployDomainParts.slice(-2).join(".")
    };
}

async function createDeploymentZipBase64(
    directory: string
): Promise<string> {

    const zip = new JSZip();

    function addDirectoryToZip(
        toAdd: string,
    ): void {
        const toAddFullPath = path.join(directory, toAdd);
        const files = fs.readdirSync(toAddFullPath);
        for (const file of files) {
            const fullPath = path.join(directory, toAdd, file);
            const relPath = path.relative(directory, fullPath);
            if (fs.lstatSync(fullPath).isDirectory()) {
                addDirectoryToZip(relPath);
            } else {
                zip.file(relPath, fs.readFileSync(fullPath));
            }
        }
    }

    addDirectoryToZip("");

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipBase64 = zipBuffer.toString("base64");

    return zipBase64;

}

/**
 * Deploys a static app to the CDN using the provided options.
 * 
 * @param {any} opts - The options object containing the deploy directory
 *   and deploy domain.
 */
async function cdnDeploy(opts: any) {
    console.log("CDN deploy");

    const validatedOpts = validateCdnDeployOpts(opts);

    // Check for deploy key.
    const deployKeyPath = path.join(os.homedir(), ".alephhack2024", "domains", validatedOpts.deployBaseDomain, "deploy-key");
    const wsPortPath = path.join(os.homedir(), ".alephhack2024", "domains", validatedOpts.deployBaseDomain, "ws-port");

    if (!fs.existsSync(deployKeyPath)) {
        throw new Error(`Deploy key not found for domain: ${validatedOpts.deployDomain}`);
    }
    if (!fs.existsSync(wsPortPath)) {
        throw new Error(`WebSocket port not found for domain: ${validatedOpts.deployDomain}`);
    }

    const wsPort = parseInt(fs.readFileSync(wsPortPath, { encoding: "utf-8" }));
    if (isNaN(wsPort)) {
        throw new Error(`WebSocket port is not a number for domain: ${validatedOpts.deployDomain}`);
    }

    const deployKey = fs.readFileSync(deployKeyPath, { encoding: "utf-8" });
    if (deployKey === "") {
        throw new Error(`Deploy key is empty for domain: ${validatedOpts.deployDomain}`);
    }


    const zipBase64 = await createDeploymentZipBase64(validatedOpts.deployDir);

    // Establish a WebSocket connection and authenticate.
    // TODO: Replace with actual WebSocket URL.
    const ws = new WebSocket(`wss://${validatedOpts.deployBaseDomain}:${wsPort}`);

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
                    method: "cdn-deploy",
                    domain: validatedOpts.deployDomain,
                    cdnContentZipBase64: zipBase64
                })
            );

            const response2 = await nextMessage();
            if (response2 !== "true") {
                throw new Error("CDN deploy failed, received: " + response2);
            }

            console.log("CDN deploy successful!");
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

/**
 * Adds the CDN deploy command to the parent command.
 * 
 * @param {Command} parentCommand - The parent commander Command object.
 */
export function useCommandCdnDeploy(
    parentCommand: Command
): void {

    const cdnCommand = parentCommand.commands.find((command) => command.name() === "cdn")
        ?? parentCommand.command("cdn");
    const cdnDeployCommand = cdnCommand.command("deploy");
    cdnDeployCommand.description("Deploy a static app to the CDN");
    cdnDeployCommand.option("--deploy-dir <deployDir>", "The directory to deploy");
    cdnDeployCommand.option("--deploy-domain <deployDomain>", "The domain to deploy under");
    cdnDeployCommand.action(cdnDeploy);
}
