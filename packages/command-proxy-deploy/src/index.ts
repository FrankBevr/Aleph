import { Command } from "commander";

export function useCommandProxyDeploy(
    parentCommand: Command
): void {
    const proxyCommand = parentCommand.commands.find((command) => command.name() === "cdn")
        ?? parentCommand.command("proxy");
    const proxyDeployCommand = proxyCommand.command("deploy");
    proxyDeployCommand.description("Does proxy deploy");
    proxyDeployCommand.action(() => {
        console.log("Do proxy Deploy - w.i.p");
    });
}

