import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseDotEnv(filePath) {
  const content = readFileSync(filePath, "utf8");
  const result = {};

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^"|"$/g, "");
    result[key] = value;
  }

  return result;
}

function getDbName(databaseUrl) {
  if (!databaseUrl) {
    return "neondb";
  }

  try {
    const parsed = new URL(databaseUrl);
    return parsed.pathname.replace(/^\//, "") || "neondb";
  } catch {
    return "neondb";
  }
}

async function main() {
  const [, , emailArg, passwordArg, nameArg] = process.argv;

  if (!emailArg || !passwordArg || !nameArg) {
    console.error("Uso: npm run neon-auth:create-user -- <email> <password> <nombre>");
    process.exit(1);
  }

  const envPath = resolve(process.cwd(), ".env");
  const env = parseDotEnv(envPath);

  const base = env.NEON_AUTH_BASE_URL;
  const appBase = env.APP_BASE_URL || "http://localhost:3000";
  const dbName = getDbName(env.DATABASE_URL);

  if (!base) {
    console.error("Falta NEON_AUTH_BASE_URL en .env");
    process.exit(1);
  }

  const origin = new URL(base).origin;
  const endpoint = `${origin}/${dbName}/auth/sign-up/email`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: appBase,
    },
    body: JSON.stringify({
      email: emailArg.trim().toLowerCase(),
      password: passwordArg,
      name: nameArg,
      callbackURL: `${appBase}/login`,
    }),
  });

  const payload = await response.text();

  if (!response.ok) {
    console.error("Neon Auth respondió con error:");
    console.error(payload);
    process.exit(1);
  }

  console.info("Usuario creado en Neon Auth:");
  console.info(payload);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});