import { createConnection } from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

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

async function dropColumn() {
  console.log("🔥 Starting DB Column Drop...");
  const env = loadEnv();

  const host = env.MYSQL_HOST || "localhost";
  const port = parseInt(env.MYSQL_PORT || "3306");
  const user = env.MYSQL_USER || "root";
  const password = env.MYSQL_PASSWORD || "";
  const database = env.MYSQL_DATABASE || "pixeltrade";

  let conn;
  try {
    conn = await createConnection({ host, port, user, password, database });
    console.log("✅ Connected successfully!");

    // check if column display_name exists
    const [columns] = await conn.execute("DESCRIBE users");
    const hasDisplayName = columns.some(c => c.Field === 'display_name');

    if (!hasDisplayName) {
      console.log("ℹ️ Column 'display_name' is already absent or dropped.");
    } else {
      console.log("🗑️ Dropping column 'display_name' from 'users' table...");
      await conn.query("ALTER TABLE users DROP COLUMN display_name");
      console.log("✅ Column 'display_name' dropped successfully!");
    }

    // Verify structure
    const [newCols] = await conn.execute("DESCRIBE users");
    console.log("\n📋 Current users table structure:");
    console.table(newCols.map(c => ({
      Field: c.Field,
      Type: c.Type,
      Null: c.Null,
      Key: c.Key,
      Default: c.Default,
      Extra: c.Extra
    })));
  } catch (err) {
    console.error("❌ Drop column operation failed!");
    console.error(err);
  } finally {
    if (conn) await conn.end();
  }
}

dropColumn();
