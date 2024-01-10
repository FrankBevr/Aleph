import { Command } from "commander";

export function useCommandProxyUneploy(
    parentCommand: Command
): void {
    const proxyCommand = parentCommand.commands.find((command) => command.name() === "cdn")
        ?? parentCommand.command("proxy");
    const proxyDeployCommand = proxyCommand.command("undeploy");
    proxyDeployCommand.description("Does proxy undeploy");
    proxyDeployCommand.action(() => {
        console.log("Do proxy undeploy - w.i.p");
    });
}

