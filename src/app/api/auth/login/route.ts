// ─────────────────────────────────────────────────────────────
//  POST /api/auth/login
//  รับ: { email, password }
//  ส่ง: { token, user } หรือ { error }
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, UserRole } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  avatar_style: string;
  xp: number;
  tier: string;
  role: UserRole;
  is_active: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // ── Validation ──────────────────────────────────────────
    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณากรอก username และ password" },
        { status: 400 }
      );
    }

    // ── Find user ────────────────────────────────────────────
    const [rows] = await pool.query<UserRow[]>(
      `SELECT id, username, password_hash, avatar_style, xp, tier, role, is_active
       FROM users WHERE username = ? LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Username หรือ Password ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // ── Check active ─────────────────────────────────────────
    if (!user.is_active) {
      return NextResponse.json(
        { error: "บัญชีนี้ถูกระงับการใช้งาน" },
        { status: 403 }
      );
    }

    // ── Verify password ──────────────────────────────────────
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Username หรือ Password ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // ── Update last_login ────────────────────────────────────
    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    // ── Issue JWT (includes role) ─────────────────────────────
    const token = signToken({
      userId: user.id,
      username: user.username,
      tier: user.tier,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        userId: user.id,
        username: user.username,
        avatarStyle: user.avatar_style,
        tier: user.tier,
        role: user.role,
        xp: user.xp,
      },
    });
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
