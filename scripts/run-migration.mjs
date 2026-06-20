#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  scripts/run-migration.mjs
//  รัน SQL migration เพื่อเพิ่ม role column ใน users table
//
//  Usage: node scripts/run-migration.mjs
//  หรือใส่ password: MYSQL_PASSWORD=xxx node scripts/run-migration.mjs
// ─────────────────────────────────────────────────────────────

import { createConnection } from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  console.log("🔧 Running role system migration...\n");

  const conn = await createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "pixeltrade",
    multipleStatements: true,
  });

  try {
    const sql = readFileSync(
      join(__dirname, "db-migration-roles.sql"),
      "utf-8"
    );

    // กรอง comment-only lines ออก
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
        if (err.code === "ER_DUP_FIELDNAME") {
          console.log("  ↳ Column 'role' already exists — skipped");
        } else if (err.code === "ER_DUP_KEYNAME") {
          console.log("  ↳ Index already exists — skipped");
        } else {
          console.warn("  ⚠ " + err.message);
        }
      }
    }

    console.log("\n✅ Migration complete!\n");

    // แสดงโครงสร้างปัจจุบัน
    const [cols] = await conn.execute("DESCRIBE users");
    console.log("📋 users table structure:");
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
