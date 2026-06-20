// ─────────────────────────────────────────────────────────────
//  Dashboard Layout — /dashboard
//  ห่อด้วย AuthGuard เพื่อป้องกัน unauthenticated access
// ─────────────────────────────────────────────────────────────

"use client";

import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
