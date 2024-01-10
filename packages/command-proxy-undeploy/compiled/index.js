export function useCommandProxyUndeploy(parentCommand) {
    var _a;
    const proxyCommand = (_a = parentCommand.commands.find((command) => command.name() === "cdn")) !== null && _a !== void 0 ? _a : parentCommand.command("proxy");
    const proxyDeployCommand = proxyCommand.command("undeploy");
    proxyDeployCommand.description("Does proxy undeploy");
    proxyDeployCommand.action(() => {
        console.log("Do proxy undeploy - w.i.p");
    });
}
