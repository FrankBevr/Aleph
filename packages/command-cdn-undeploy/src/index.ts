import { Command } from "commander";

interface CdnDeployOpts {
    deployDir: string;
    deployDomain: string;
    deployBaseDomain: string;
}

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
    const versionCommand = parentCommand.command("undeploy");
    versionCommand.description("Undeploys website");
    versionCommand.action(() => {
    });
}

// export function useCommandCdnDeploy(
//     parentCommand: Command
// ): void {
//
//     const cdnCommand = parentCommand.commands.find((command) => command.name() === "cdn")
//         ?? parentCommand.command("cdn");
//     const cdnDeployCommand = cdnCommand.command("deploy");
//     cdnDeployCommand.description("Deploy a static app to the CDN");
//     cdnDeployCommand.option("--deploy-dir <deployDir>", "The directory to deploy");
//     cdnDeployCommand.option("--deploy-domain <deployDomain>", "The domain to deploy under");
//     cdnDeployCommand.action(cdnDeploy);
// }
