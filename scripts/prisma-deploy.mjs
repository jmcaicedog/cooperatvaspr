import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";
import { spawnSync } from "node:child_process";
import { getMigrationUrl } from "./lib/migration-url.mjs";

if (existsSync(".env")) {
  loadEnvFile(".env");
}

const require = createRequire(import.meta.url);
const databaseUrl = getMigrationUrl(process.env.DATABASE_URL, process.env.DIRECT_URL);
const prismaCli = join(dirname(require.resolve("prisma/package.json")), "build", "index.js");
const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

if (result.signal) {
  throw new Error(`El proceso de migracion termino por la senal ${result.signal}.`);
}

process.exitCode = result.status ?? 1;
