import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, UserRole } from "@/lib/auth";

// ── GET: Fetch the user's watchlist ─────────────────────────
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const [rows] = await pool.query(
      `SELECT symbol, UNIX_TIMESTAMP(added_at) * 1000 as addedAt
       FROM user_watchlists 
       WHERE user_id = ?
       ORDER BY added_at ASC`,
      [payload.userId]
    );

    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error("Watchlist GET error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── POST: Add a symbol to watchlist ─────────────────────────
export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const upperSymbol = symbol.toUpperCase().trim();

    try {
      await pool.query(
        `INSERT INTO user_watchlists (user_id, symbol) VALUES (?, ?)`,
        [payload.userId, upperSymbol]
      );
    } catch (dbErr: any) {
      // Ignore duplicate entry errors
      if (dbErr.code !== 'ER_DUP_ENTRY') {
        throw dbErr;
      }
    }

    return NextResponse.json({ success: true, symbol: upperSymbol });
  } catch (err) {
    console.error("Watchlist POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── DELETE: Remove a symbol from watchlist ──────────────────
export async function DELETE(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const upperSymbol = symbol.toUpperCase().trim();

    await pool.query(
      `DELETE FROM user_watchlists WHERE user_id = ? AND symbol = ?`,
      [payload.userId, upperSymbol]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Watchlist DELETE error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
