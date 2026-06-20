// ─────────────────────────────────────────────────────────────
//  Member Layout — /member
//  ห่อด้วย AuthGuard requiredRole="owner"
// ─────────────────────────────────────────────────────────────

import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: "Member Panel — Kairos Tech",
  description: "Owner management panel",
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requiredRole="owner">{children}</AuthGuard>;
}
