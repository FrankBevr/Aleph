import { Command } from "commander";
import { existsSync, rmdirSync } from "fs";
import path from "path";

/* TODO
 * 1. Make sure that undeploy only takes a single domain asa option
 * 2. Connect over websocket and cdn undeploy command
 * HINT: Look at CDN DEPLOY for reference
 */
export function useCommandCdnUndeploy(
    parentCommand: Command
): void {
    const cdnCommand = parentCommand.commands.find((command) => command.name() === "cdn")
        ?? parentCommand.command("cdn");
    const undeployCommand = cdnCommand.command("undeploy");
    undeployCommand.description("Undeploys website");
    undeployCommand.option("-d, --domain <domain>", "Domain name");
    undeployCommand.option("-p, --path <path>", "Directory path of vHosts");
    undeployCommand.action((options) => {
        const { domain, path } = options;
        deleteVhostDir(domain, path);
    });
}
function deleteVhostDir(domainName: string, directory: string): void {
    const folderPath = path.join(directory, domainName);
    if (existsSync(folderPath)) {
        rmdirSync(folderPath, { recursive: true });
        console.log(`Domain '${domainName}' deleted successfully.`);
    } else {
        console.log(`Domain '${domainName}' does not exist.`);
    }
}
