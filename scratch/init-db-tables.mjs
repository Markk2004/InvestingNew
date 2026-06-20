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

async function runInit() {
  console.log("⚙️ Starting Database Initialization...");
  const env = loadEnv();

  const host = env.MYSQL_HOST || "localhost";
  const port = parseInt(env.MYSQL_PORT || "3306");
  const user = env.MYSQL_USER || "root";
  const password = env.MYSQL_PASSWORD || "";
  const database = env.MYSQL_DATABASE || "pixeltrade";

  console.log(`🔌 Connecting to MySQL Server...`);
  console.log(`   Host: ${host}, Port: ${port}, User: ${user}`);

  let conn;
  try {
    // Connect without database first (in case it doesn't exist)
    conn = await createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });
    console.log("✅ Connected successfully!");

    // Read db-init.sql
    const initSqlPath = join(process.cwd(), "scripts", "db-init.sql");
    if (!existsSync(initSqlPath)) {
      console.error(`❌ init script not found at: ${initSqlPath}`);
      return;
    }

    console.log(`📖 Reading ${initSqlPath}...`);
    const sqlContent = readFileSync(initSqlPath, "utf8");

    console.log(`🚀 Executing database initialization schema...`);
    // Split SQL by statements to execute them safely or run all at once since multipleStatements is true
    // Running all at once is supported by mysql2 when multipleStatements: true is set
    await conn.query(sqlContent);
    console.log("✅ Schema executed successfully!");

    // Verify structures
    await conn.query(`USE \`${database}\``);
    const [columns] = await conn.execute("DESCRIBE users");
    console.log("\n📋 Current users table structure:");
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
      console.log(`\n🎉 Column 'role' successfully created! (Type: ${roleCol.Type})`);
    } else {
      console.log("\n❌ Column 'role' is missing in the created table users!");
    }

  } catch (err) {
    console.error("❌ Database initialization failed!");
    console.error("Error details:", err);
  } finally {
    if (conn) await conn.end();
  }
}

runInit();
