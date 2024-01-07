import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";

interface CheckedSetupOpts {
    serverDir: string;
    serverDomain: string;
}

function checkOpts(opts: any): CheckedSetupOpts {

    const serverDir = opts.serverDir ?? "";
    const serverDomain = opts.serverDomain ?? "";

    if (serverDir === "") {
        throw new Error("serverDir must not be empty");
    }
    if (serverDomain === "") {
        throw new Error("serverDomain must not be empty");
    }

    return {
        serverDir,
        serverDomain
    };

}

async function serverSetup(opts: any) {

    const checkedOpts = checkOpts(opts);

    console.log("Server setup");
    console.log(`serverDir: ${checkedOpts.serverDir}`);
    console.log(`serverDomain: ${checkedOpts.serverDomain}`);

    if (!fs.existsSync(checkedOpts.serverDir)) {
        fs.mkdirSync(checkedOpts.serverDir, { recursive: true });
    }

    fs.mkdirSync(path.join(checkedOpts.serverDir, "config"), { recursive: true });
    fs.mkdirSync(path.join(checkedOpts.serverDir, "vhosts"), { recursive: true });

    // Generate the deploy key, random 64 character string
    const deployKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    // Create directory at server/config/domains/<domain>
    fs.mkdirSync(path.join(checkedOpts.serverDir, "config", "domains", checkedOpts.serverDomain), { recursive: true });
    // Write deploy key to server/config/domains/<domain>/deploy-key
    fs.writeFileSync(path.join(checkedOpts.serverDir, "config", "domains", checkedOpts.serverDomain, "deploy-key"), deployKey);

    console.log("Deploy key for domain ", checkedOpts.serverDomain, " is ", deployKey);

    // Setup complete!
    console.log("Setup complete!");

}

export function useCommandServerSetup(
    parentCommand: Command
): void {

    const serverCommand = parentCommand.commands.find((command) => command.name() === "server")
        ?? parentCommand.command("server");
    const serverSetupCommand = serverCommand.command("setup");
    serverSetupCommand.description("Sets up the server");
    serverSetupCommand.option("--server-dir <serverDir>", "The path to the server directory")
    serverSetupCommand.option("--server-domain <serverDomain>", "The domain of the server")
    serverSetupCommand.action(serverSetup);

}
