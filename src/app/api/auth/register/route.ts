// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register
//  รับ: { username, email, password, displayName? }
//  ส่ง: { token, user } หรือ { error }
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, displayName } = body;

    // ── Validation ──────────────────────────────────────────
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "กรุณากรอก username, email และ password" },
        { status: 400 }
      );
    }
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: "Username ต้องมีความยาว 3-50 ตัวอักษร" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password ต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "รูปแบบ email ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ── Check duplicate ──────────────────────────────────────
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      [email.toLowerCase(), username]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email หรือ Username นี้ถูกใช้ไปแล้ว" },
        { status: 409 }
      );
    }

    // ── Hash password ────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Insert user ──────────────────────────────────────────
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (username, email, password_hash, display_name, last_login)
       VALUES (?, ?, ?, ?, NOW())`,
      [username, email.toLowerCase(), passwordHash, displayName || username]
    );

    const userId = result.insertId;

    // ── Issue JWT ────────────────────────────────────────────
    const token = signToken({
      userId,
      username,
      email: email.toLowerCase(),
      tier: "FREE",
    });

    return NextResponse.json(
      {
        token,
        user: {
          userId,
          username,
          email: email.toLowerCase(),
          displayName: displayName || username,
          tier: "FREE",
          xp: 0,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
