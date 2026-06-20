// GET /api/auth/clear
// ล้าง cookie dh_auth_token และ redirect กลับไปหน้าแรก
// ใช้สำหรับแก้ปัญหา token เสีย / session เก่า

import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );

  // Clear auth cookie
  response.cookies.set("dh_auth_token", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}
