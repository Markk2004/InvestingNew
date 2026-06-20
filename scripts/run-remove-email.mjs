#!/usr/bin/env node
import { createConnection } from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local not found!");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf8");
  const env = {};
  content.split("\n").forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      env[key] = value;
    }
  });
  return env;
}

async function runMigration() {
  console.log("🔧 Running migration to remove email column and index...\n");

  const env = loadEnv();
  const host = env.MYSQL_HOST || "localhost";
  const port = parseInt(env.MYSQL_PORT || "3306");
  const user = env.MYSQL_USER || "root";
  const password = env.MYSQL_PASSWORD || "";
  const database = env.MYSQL_DATABASE || "pixeltrade";

  const conn = await createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
  });

  try {
    const sqlPath = join(__dirname, "db-migration-remove-email.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith("--") && !s.startsWith("/*"));

    for (const stmt of statements) {
      if (!stmt) continue;
      try {
        await conn.execute(stmt);
        console.log("  ✓ " + stmt.slice(0, 60).replace(/\s+/g, " ") + "...");
      } catch (err) {
        console.warn("  ⚠ " + err.message);
      }
    }

    console.log("\n✅ Migration complete!\n");

    const [cols] = await conn.execute("DESCRIBE users");
    console.log("📋 Current users table structure:");
    console.table(
      cols.map((c) => ({
        Field: c.Field,
        Type: c.Type,
        Default: c.Default,
        Null: c.Null,
      }))
    );
  } finally {
    await conn.end();
  }
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
