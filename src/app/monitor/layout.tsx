// ─────────────────────────────────────────────────────────────
//  Monitor Layout — /monitor
//  ห่อด้วย AuthGuard เพื่อป้องกัน unauthenticated access
// ─────────────────────────────────────────────────────────────

"use client";

import AuthGuard from "@/components/AuthGuard";

export default function MonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
