// ─────────────────────────────────────────────────────────────
//  POST /api/auth/logout
//  Clear session (client จะลบ token เอง แต่ route นี้ไว้สำหรับ
//  future: revoke token in sessions table)
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: true, message: "Logged out" });
}
