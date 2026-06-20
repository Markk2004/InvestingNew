// ─────────────────────────────────────────────────────────────
//  Auth Helpers — src/lib/auth.ts
//  JWT sign / verify utilities (server + client side helpers)
//  Role system: 'member' | 'owner'
// ─────────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret";
const JWT_EXPIRES_IN = "7d"; // 7 วัน

export type UserRole = "member" | "owner";

export interface JwtPayload {
  userId: number;
  username: string;
  tier: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

// ─── Server-side ──────────────────────────────────────────────

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

function base64urlToBytes(str: string): Uint8Array {
  const binary = base64urlDecode(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(JWT_SECRET);
    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const dataBytes = encoder.encode(`${headerB64}.${payloadB64}`);
    const signatureBytes = base64urlToBytes(signatureB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as any,
      dataBytes as any
    );

    if (!isValid) {
      console.error("[verifyToken] Signature verification failed");
      return null;
    }

    const payloadJson = base64urlDecode(payloadB64);
    const payload = JSON.parse(payloadJson) as JwtPayload;

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.error("[verifyToken] Token expired");
      return null;
    }

    return payload;
  } catch (err) {
    console.error("[verifyToken] Error during verification:", err);
    return null;
  }
}

// ─── Role helpers (server-side) ───────────────────────────────

export function isOwner(payload: JwtPayload): boolean {
  return payload.role === "owner";
}

export function isMember(payload: JwtPayload): boolean {
  return payload.role === "member" || payload.role === "owner";
}

// ─── Client-side helpers ──────────────────────────────────────

const TOKEN_KEY = "dh_auth_token";
const USER_KEY = "dh_user";

export interface AuthUser {
  userId: number;
  username: string;
  tier: string;
  role: UserRole;
  xp: number;
}

export function saveAuth(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const localToken = localStorage.getItem(TOKEN_KEY);
  const cookieToken = getCookie(TOKEN_KEY);

  // If local storage has a token, but the cookie is missing or mismatched,
  // we treat the session as invalid and clear the local storage.
  if (localToken && (!cookieToken || cookieToken !== localToken)) {
    clearAuth();
    return null;
  }

  return localToken;
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
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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

// ─── Client-side role helpers ─────────────────────────────────

export function getUserRole(): UserRole | null {
  const user = getUser();
  return user?.role ?? null;
}

export function isUserOwner(): boolean {
  return getUserRole() === "owner";
}

export function isUserMember(): boolean {
  const role = getUserRole();
  return role === "member" || role === "owner";
}
