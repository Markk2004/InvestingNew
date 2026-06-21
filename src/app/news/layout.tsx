import AuthGuard from "@/components/AuthGuard";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
