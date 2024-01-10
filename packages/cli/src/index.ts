import { program } from "commander";
import { useCommandVersion } from "@alephhack/command-version";
import { useCommandServerStart } from "@alephhack/command-server-start";
import { useCommandServerSetup } from "@alephhack/command-server-setup";
import { useCommandServerConnect } from "@alephhack/command-server-connect";
import { useCommandCdnDeploy } from "@alephhack/command-cdn-deploy";
import { useCommandCdnUndeploy } from "@alephhack/command-cdn-undeploy";
import { useCommandProxyDeploy } from "@alephhack/command-proxy-deploy";
import { useCommandProxyUndeploy } from "@alephhack/command-proxy-undeploy";

useCommandVersion(program);
useCommandServerStart(program);
useCommandServerSetup(program);
useCommandServerConnect(program);
useCommandCdnDeploy(program);
useCommandCdnUndeploy(program);
useCommandProxyDeploy(program);
useCommandProxyUndeploy(program);
/*TODO
 * Add Command CdnUndeploy (removes folder from vhosts)
 * Add Command ProxyDeploy (only setup)
 * Add Command ProxyUnDeploy (only setup)
 * Add Command ProxyServe
 */
program.parse(process.argv);
