// ─────────────────────────────────────────────────────────────
//  Next.js Middleware — src/middleware.ts
//  Route protection ด้วย JWT + Role-based access control
//
//  Protected routes:
//    /dashboard/*  → ต้อง login (member + owner)
//    /member/*     → ต้องเป็น owner เท่านั้น
//
//  Public routes:
//    /             → Landing page (redirect ถ้า logged in)
//    /api/auth/*   → Auth endpoints (ไม่ต้อง token)
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes ที่ต้องการ authentication
const PROTECTED_ROUTES = ["/dashboard", "/member", "/overview", "/news", "/charts", "/watchlist"];

// Routes เฉพาะ owner เท่านั้น
const OWNER_ONLY_ROUTES = ["/member"];

// Routes ที่ bypass middleware ทั้งหมด
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/clear",
];

function getTokenFromRequest(req: NextRequest): string | null {
  // 1. Authorization header (Bearer token)
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // 2. Cookie (fallback สำหรับ SSR)
  const cookieToken = req.cookies.get("dh_auth_token")?.value;
  if (cookieToken) return cookieToken;

  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Skip public API routes ───────────────────────────────────
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ── Check if route needs protection ─────────────────────────
  const needsAuth = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (!needsAuth) return NextResponse.next();

  // ── Extract and verify token ─────────────────────────────────
  const token = getTokenFromRequest(req);
  if (!token) {
    // Redirect ไป Landing page ถ้าไม่มี token
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    // Token ไม่ valid หรือหมดอายุ — ล้าง cookie แล้ว redirect ไป login
    const loginUrl = new URL("/", req.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear the bad cookie
    response.cookies.set("dh_auth_token", "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return response;
  }

  // ── Role check สำหรับ owner-only routes ─────────────────────
  const needsOwner = OWNER_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (needsOwner && payload.role !== "owner") {
    // Redirect member ที่พยายามเข้า /member ไป dashboard แทน
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ── Pass user info ผ่าน request headers ─────────────────────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-tier", payload.tier);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)).*)",
  ],
};
