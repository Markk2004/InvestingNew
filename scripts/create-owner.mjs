import { createConnection } from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import bcrypt from "bcryptjs";

function loadEnv() {
  const envPath = join(process.cwd(), ".env.local");
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

async function createOwner() {
  console.log("🚀 Starting DB script to create owner user: admin001...");
  const env = loadEnv();

  const host = env.MYSQL_HOST || "localhost";
  const port = parseInt(env.MYSQL_PORT || "3306");
  const user = env.MYSQL_USER || "root";
  const password = env.MYSQL_PASSWORD || "";
  const database = env.MYSQL_DATABASE || "pixeltrade";

  let conn;
  try {
    conn = await createConnection({ host, port, user, password, database });
    console.log("✅ Database connected successfully!");

    // Check if table users exists, if not recreate using db-init.sql style
    const [tables] = await conn.execute("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log("⚠️ Table 'users' does not exist. Creating schema...");
      // Recreate using clean structure (no email, no display_name)
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id            INT AUTO_INCREMENT PRIMARY KEY,
          username      VARCHAR(50)   UNIQUE NOT NULL COMMENT 'Unique display name',
          password_hash VARCHAR(255)  NOT NULL        COMMENT 'bcrypt hashed password',
          avatar_style  VARCHAR(50)   DEFAULT 'default',
          xp            INT           DEFAULT 0       COMMENT 'Experience points for gamification',
          tier          ENUM('FREE', 'PLUS', 'SUPER', 'ULTRA') DEFAULT 'FREE',
          role          ENUM('member', 'owner') NOT NULL DEFAULT 'member',
          is_active     TINYINT(1)    DEFAULT 1,
          created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
          last_login    DATETIME      DEFAULT NULL,
          updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("✅ Table 'users' created successfully.");
    } else {
      // If table exists, make sure columns display_name and email are dropped
      const [columns] = await conn.execute("DESCRIBE users");
      const hasDisplayName = columns.some(c => c.Field === 'display_name');
      const hasEmail = columns.some(c => c.Field === 'email');

      if (hasDisplayName) {
        console.log("🗑️ Column 'display_name' is present. Dropping it...");
        await conn.query("ALTER TABLE users DROP COLUMN display_name");
        console.log("✅ Column 'display_name' dropped.");
      }
      if (hasEmail) {
        console.log("🗑️ Column 'email' is present. Dropping it...");
        try {
          await conn.query("ALTER TABLE users DROP INDEX idx_email");
        } catch (e) {
          // index might not exist
        }
        await conn.query("ALTER TABLE users DROP COLUMN email");
        console.log("✅ Column 'email' dropped.");
      }
    }

    // Hash password for admin001
    const username = "admin001";
    const plainPassword = "100admin";
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    // Check if admin001 already exists
    const [existing] = await conn.execute("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (existing.length > 0) {
      console.log(`⚠️ User '${username}' already exists. Updating role to owner and password...`);
      await conn.execute(
        "UPDATE users SET password_hash = ?, role = 'owner', tier = 'ULTRA' WHERE username = ?",
        [passwordHash, username]
      );
      console.log(`✅ User '${username}' updated successfully!`);
    } else {
      console.log(`➕ Inserting new owner user '${username}'...`);
      await conn.execute(
        "INSERT INTO users (username, password_hash, role, tier, last_login) VALUES (?, ?, 'owner', 'ULTRA', NOW())",
        [username, passwordHash]
      );
      console.log(`✅ User '${username}' created successfully!`);
    }

    // Verify list of users
    const [usersList] = await conn.execute("SELECT id, username, role, tier FROM users");
    console.log("\n📋 Current users list in database:");
    console.table(usersList);

  } catch (err) {
    console.error("❌ Operations failed!");
    console.error(err);
  } finally {
    if (conn) await conn.end();
  }
}

createOwner();
