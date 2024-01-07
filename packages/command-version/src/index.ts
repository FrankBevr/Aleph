import { Command } from "commander";

export function useCommandVersion(
    parentCommand: Command
): void {

    const versionCommand = parentCommand.command("version");
    versionCommand.description("Prints the version of the CLI");
    versionCommand.action(() => {
        console.log("Version !UNKNOWN!");
    });

}
