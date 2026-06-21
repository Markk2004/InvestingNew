import AuthGuard from "@/components/AuthGuard";

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
