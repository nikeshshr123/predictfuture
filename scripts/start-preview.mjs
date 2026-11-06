import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const cli = fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url));
const envFile = path.resolve(".dev.vars");
const result = spawnSync(process.execPath, [cli, "dev", "--config", "dist/server/wrangler.json", "--local",
  "--persist-to", ".wrangler/state", "--ip", "127.0.0.1", "--inspector-port", "0",
  ...(existsSync(envFile) ? ["--env-file", envFile] : []), ...process.argv.slice(2)], {stdio:"inherit"});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
