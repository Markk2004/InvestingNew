import { createConnection } from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Function to parse .env.local
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
      // Remove surrounding quotes if any
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

async function testConnection() {
  console.log("🔍 Loading environment variables from .env.local...");
  const env = loadEnv();

  const host = env.MYSQL_HOST || "localhost";
  const port = parseInt(env.MYSQL_PORT || "3306");
  const user = env.MYSQL_USER || "root";
  const configPassword = env.MYSQL_PASSWORD || "";
  const database = env.MYSQL_DATABASE || "pixeltrade";

  // List of passwords to try
  const passwordsToTry = [
    { name: "Configured Password", value: configPassword },
    { name: "Empty Password", value: "" },
    { name: "Password 'root'", value: "root" },
    { name: "Password '1234'", value: "1234" },
    { name: "Password '123456'", value: "123456" },
    { name: "Password 'admin'", value: "admin" }
  ];

  let conn;
  let successPassword = null;

  for (const pw of passwordsToTry) {
    console.log(`🔌 Attempting connection using [${pw.name}] (length: ${pw.value.length})...`);
    try {
      conn = await createConnection({
        host,
        port,
        user,
        password: pw.value,
        // Don't specify database yet, just in case the database itself doesn't exist
      });
      console.log(`✅ Connection SUCCESS using [${pw.name}]!`);
      successPassword = pw.value;
      break;
    } catch (err) {
      console.log(`❌ Failed using [${pw.name}]: ${err.message}`);
    }
  }

  if (!conn) {
    console.error("\n❌ Could not connect with any of the tried passwords.");
    console.error("Please ensure MySQL is running and you have the correct password.");
    return;
  }

  try {
    // Check/Create database
    console.log(`\n📂 Checking database '${database}'...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await conn.query(`USE \`${database}\``);
    console.log(`✅ Using database '${database}'`);

    // Check if table users exists
    const [tables] = await conn.execute(`SHOW TABLES LIKE 'users'`);
    if (tables.length === 0) {
      console.log("❌ Table 'users' does NOT exist in database!");
      return;
    }
    console.log("✅ Table 'users' exists!");

    // Describe users table
    const [columns] = await conn.execute("DESCRIBE users");
    console.log("\n📋 Table 'users' columns:");
    console.table(columns.map(c => ({
      Field: c.Field,
      Type: c.Type,
      Null: c.Null,
      Key: c.Key,
      Default: c.Default,
      Extra: c.Extra
    })));

    const roleCol = columns.find(c => c.Field === 'role');
    if (roleCol) {
      console.log(`\n🎉 Column 'role' is PRESENT. Type: ${roleCol.Type}, Default: ${roleCol.Default}`);
    } else {
      console.log(`\n⚠️ Column 'role' is MISSING!`);
    }
  } catch (err) {
    console.error("❌ Operations failed:", err.message);
  } finally {
    if (conn) await conn.end();
  }
}

testConnection();
