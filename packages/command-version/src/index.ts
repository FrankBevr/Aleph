import { Command } from "commander";
import { readFileSync } from "fs";

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

/* DONE 
* 1. read version from cli folder
* 2. get version from package.json
* 3. return current version 
*/
function getVersion(): string {
    const rootPackageJsonPath = "../../../package.json";
    const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, "utf-8"));
    return rootPackageJson.version;
}
