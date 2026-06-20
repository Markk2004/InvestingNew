// ─────────────────────────────────────────────────────────────
//  GET /api/auth/me
//  ตรวจสอบ JWT token และคืนข้อมูล user ปัจจุบัน
//  Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar_style: string;
  xp: number;
  tier: string;
  created_at: Date;
  last_login: Date | null;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token หมดอายุหรือไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const [rows] = await pool.query<UserRow[]>(
      `SELECT id, username, email, display_name, avatar_style, xp, tier, created_at, last_login
       FROM users WHERE id = ? AND is_active = 1 LIMIT 1`,
      [payload.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json({
      userId: user.id,
      username: user.username,
      email: user.email,
      displayName: user.display_name || user.username,
      avatarStyle: user.avatar_style,
      tier: user.tier,
      xp: user.xp,
      createdAt: user.created_at,
      lastLogin: user.last_login,
    });
  } catch (err) {
    console.error("[me] error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
