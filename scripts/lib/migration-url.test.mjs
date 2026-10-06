import assert from "node:assert/strict";
import test from "node:test";
import { getMigrationUrl } from "./migration-url.mjs";

test("Neon migrations use the direct endpoint and retain connection options", () => {
  const source =
    "postgresql://user:password@ep-example-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true";
  const result = new URL(getMigrationUrl(source));
  assert.equal(result.hostname, "ep-example.c-7.us-east-1.aws.neon.tech");
  assert.equal(result.username, "user");
  assert.equal(result.password, "password");
  assert.equal(result.pathname, "/neondb");
  assert.equal(result.searchParams.get("sslmode"), "require");
  assert.equal(result.searchParams.has("pgbouncer"), false);
  assert.equal(new URL(source).hostname, "ep-example-pooler.c-7.us-east-1.aws.neon.tech");
});

test("DIRECT_URL takes precedence", () => {
  const direct = "postgresql://user:password@ep-example.us-east-1.aws.neon.tech/neondb";
  assert.equal(getMigrationUrl("postgresql://localhost/db", direct), direct);
});

test("DIRECT_URL cannot point at the Neon pooler", () => {
  assert.throws(
    () => getMigrationUrl(undefined, "postgresql://ep-example-pooler.us-east-1.aws.neon.tech/db"),
    /DIRECT_URL/,
  );
});

test("Non-Neon connections and direct Neon connections are unchanged", () => {
  for (const url of [
    "postgresql://localhost:5432/db",
    "postgres://user:password@other-pooler.example.com/db",
    "postgresql://ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ]) {
    assert.equal(getMigrationUrl(url), url);
  }
});

test("Missing and invalid connection strings fail without revealing the input", () => {
  assert.throws(() => getMigrationUrl(), /Configura DATABASE_URL/);
  assert.throws(() => getMigrationUrl("not-a-url"), /URL PostgreSQL/);
  assert.throws(() => getMigrationUrl("https://example.com"), /postgres/);
});
