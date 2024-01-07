import { program } from "commander";
import { useCommandVersion } from "@alephhack/command-version";
import { useCommandServerStart } from "@alephhack/command-server-start";
import { useCommandServerSetup } from "@alephhack/command-server-setup";
import { useCommandServerConnect } from "@alephhack/command-server-connect";
import { useCommandCdnDeploy } from "@alephhack/command-cdn-deploy";

useCommandVersion(program);
useCommandServerStart(program);
useCommandServerSetup(program);
useCommandServerConnect(program);
useCommandCdnDeploy(program);

program.parse(process.argv);
