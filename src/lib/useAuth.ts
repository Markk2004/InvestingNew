"use client";
// ─────────────────────────────────────────────────────────────
//  useAuth — Centralized Authentication Hook
//  ใช้ตรวจสอบ auth state, role และ user info ทั่วทั้ง app
//
//  Usage:
//    const { user, isOwner, isMember, logout, loading } = useAuth();
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  getUser,
  getToken,
  clearAuth,
  isLoggedIn,
  saveAuth,
} from "@/lib/auth";

interface UseAuthReturn {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  isMember: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // โหลด user จาก localStorage
  useEffect(() => {
    const currentUser = getUser();
    const currentToken = getToken();
    if (isLoggedIn() && currentUser && currentToken) {
      setUser(currentUser);
      setToken(currentToken);
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  // ดึงข้อมูล user ล่าสุดจาก API
  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser: AuthUser = {
          userId: data.userId,
          username: data.username,
          tier: data.tier,
          role: data.role,
          xp: data.xp,
        };
        setUser(updatedUser);
        saveAuth(currentToken, updatedUser);
      } else {
        // Token expired หรือ invalid
        clearAuth();
        setUser(null);
        setToken(null);
      }
    } catch {
      // Network error — ไม่ logout แค่ silent fail
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
    router.replace("/");
  }, [router]);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!user && isLoggedIn(),
    isOwner: user?.role === "owner",
    isMember: user?.role === "member" || user?.role === "owner",
    logout,
    refreshUser,
  };
}
