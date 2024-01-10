export function useCommandProxyDeploy(parentCommand) {
    var _a;
    const proxyCommand = (_a = parentCommand.commands.find((command) => command.name() === "cdn")) !== null && _a !== void 0 ? _a : parentCommand.command("proxy");
    const proxyDeployCommand = proxyCommand.command("deploy");
    proxyDeployCommand.description("Does proxy deploy");
    proxyDeployCommand.action(() => {
        console.log("Do proxy Deploy - w.i.p");
    });
}
