// ─────────────────────────────────────────────────────────────
//  Auth Helpers — src/lib/auth.ts
//  JWT sign / verify utilities (server + client side helpers)
// ─────────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret";
const JWT_EXPIRES_IN = "7d"; // 7 วัน

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  tier: string;
}

// ─── Server-side ──────────────────────────────────────────────

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ─── Client-side helpers ──────────────────────────────────────

const TOKEN_KEY = "dh_auth_token";
const USER_KEY = "dh_user";

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  displayName?: string;
  tier: string;
  xp: number;
}

export function saveAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const token = getToken();
  if (!token) return false;
  // Quick client-side expiry check (parse JWT payload without verify)
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
