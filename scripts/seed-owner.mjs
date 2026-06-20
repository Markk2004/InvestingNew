#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  scripts/seed-owner.mjs
//  สร้าง owner account แรกในระบบ (ถ้ายังไม่มี)
//
//  Usage:
//    node scripts/seed-owner.mjs
//
//  หรือกำหนด credentials:
//    OWNER_USERNAME=Mxrk OWNER_EMAIL=you@email.com OWNER_PASSWORD=secret \
//    node scripts/seed-owner.mjs
// ─────────────────────────────────────────────────────────────

import { createConnection } from "mysql2/promise";
import { createHash } from "crypto";

// bcrypt pure-JS (ใช้ฟังก์ชัน hash แบบง่าย — แนะนำใช้ bcrypt จริงในโปรด)
// เราใช้ dynamic import เพื่อโหลด bcryptjs
const { default: bcrypt } = await import("bcryptjs");

const OWNER = {
  username: process.env.OWNER_USERNAME || "Mxrk",
  password: process.env.OWNER_PASSWORD || "ChangeMe2025!",
};

async function seedOwner() {
  console.log("🌱 Seeding owner account...\n");

  const conn = await createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "pixeltrade",
  });

  try {
    // ตรวจว่ามี owner อยู่แล้วหรือไม่
    const [existing] = await conn.execute(
      "SELECT id, username, role FROM users WHERE role = 'owner' LIMIT 1"
    );

    if (existing.length > 0) {
      const o = existing[0];
      console.log(
        `⚠  Owner already exists: ${o.username} — ID: ${o.id}`
      );
      console.log("   ไม่มีการเปลี่ยนแปลง\n");
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(OWNER.password, 12);

    // Insert owner
    const [result] = await conn.execute(
      `INSERT INTO users (username, password_hash, role, tier, last_login)
       VALUES (?, ?, 'owner', 'ULTRA', NOW())`,
      [OWNER.username, passwordHash]
    );

    console.log("✅ Owner account created successfully!\n");
    console.log(`   ID:       #${result.insertId}`);
    console.log(`   Username: ${OWNER.username}`);
    console.log(`   Password: ${OWNER.password}`);
    console.log(`   Role:     OWNER`);
    console.log(`   Tier:     ULTRA\n`);
    console.log("⚠  กรุณาเปลี่ยน password หลังจาก login ครั้งแรก!\n");
  } finally {
    await conn.end();
  }
}

seedOwner().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
