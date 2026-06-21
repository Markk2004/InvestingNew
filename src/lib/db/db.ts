// ─────────────────────────────────────────────────────────────
//  MySQL Connection Pool — src/lib/db.ts
//  Singleton pattern สำหรับ Next.js (prevent hot-reload issues)
// ─────────────────────────────────────────────────────────────

import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    port: parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "pixeltrade",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: "+00:00",
    charset: "utf8mb4",
  });
}

// Singleton — reuse pool across hot-reloads in development
const pool: mysql.Pool =
  process.env.NODE_ENV === "development"
    ? (global._mysqlPool ?? (global._mysqlPool = createPool()))
    : createPool();

export default pool;

// ─────────────────────────────────────────────────────────────
//  Helper: test connection (ใช้ใน startup / health check)
// ─────────────────────────────────────────────────────────────
export async function testConnection(): Promise<boolean> {
  try {
    const connectionPromise = pool.getConnection();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 2000)
    );
    const conn = await Promise.race([connectionPromise, timeoutPromise]);
    await conn.ping();
    conn.release();
    return true;
  } catch {
    return false;
  }
}
