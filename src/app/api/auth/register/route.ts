// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register
//  รับ: { username, email, password, displayName? }
//  ส่ง: { token, user } หรือ { error }
//  Role: ผู้สมัครแรก → 'owner', คนถัดไป → 'member'
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signToken, UserRole } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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
    // ── Check duplicate ──────────────────────────────────────
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Username นี้ถูกใช้ไปแล้ว" },
        { status: 409 }
      );
    }

    // ── Determine role ───────────────────────────────────────
    // ผู้สมัครคนแรกในระบบจะได้รับ role 'owner' โดยอัตโนมัติ
    const [countRows] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM users"
    );
    const isFirstUser = countRows[0].total === 0;
    const role: UserRole = isFirstUser ? "owner" : "member";

    // ── Hash password ────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Insert user ──────────────────────────────────────────
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (username, password_hash, role, last_login)
       VALUES (?, ?, ?, NOW())`,
      [username, passwordHash, role]
    );

    const userId = result.insertId;

    // ── Issue JWT ────────────────────────────────────────────
    const token = signToken({
      userId,
      username,
      tier: "FREE",
      role,
    });

    return NextResponse.json(
      {
        token,
        user: {
          userId,
          username,
          tier: "FREE",
          role,
          xp: 0,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[register] error:", err);
    const isDbError = err && (
      err.code === "ECONNREFUSED" ||
      err.code === "ETIMEDOUT" ||
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      (err.message && (
        err.message.toLowerCase().includes("connect") ||
        err.message.toLowerCase().includes("mysql")
      ))
    );
    if (isDbError) {
      return NextResponse.json(
        { error: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบว่าได้เปิด MySQL ใน XAMPP Control Panel แล้ว" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่" },
      { status: 500 }
    );
  }
}
