export function useCommandVersion(parentCommand) {
    const version = getVersion();
    const versionCommand = parentCommand.command("version");
    versionCommand.description("Prints the version of the CLI");
    versionCommand.action(() => {
        console.log(version);
    });
}
function getVersion() {
    return "0.1.0";
}
