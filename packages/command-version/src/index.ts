import { Command } from "commander";

export function useCommandVersion(
    parentCommand: Command
): void {
    const version = getVersion()
    const versionCommand = parentCommand.command("version");
    versionCommand.description("Prints the version of the CLI");
    versionCommand.action(() => {
        console.log(version);
    });
}

function getVersion(): String {
    return "0.1.0"
}
