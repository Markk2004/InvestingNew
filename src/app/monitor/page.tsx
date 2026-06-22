// ─────────────────────────────────────────────────────────────
//  Monitor Page — /monitor
//  Office View / GameShell — ต้อง login ก่อน
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GameShell from "@/components/GameShell";

export default function MonitorPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        router.replace("/overview");
      } else {
        setIsMobile(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  if (isMobile === null || isMobile === true) {
    // Return empty while checking or redirecting
    return <div className="h-screen w-full bg-[#050508]" />;
  }

  return <GameShell />;
}
