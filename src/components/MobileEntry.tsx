"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { isLoggedIn, getUser } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";

const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});

export default function MobileEntry() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "register">("login");

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      const user = getUser();
      if (user?.role === "member") {
        router.replace("/news");
      } else {
        router.replace("/monitor");
      }
    }
  }, [router]);

  const openLogin = () => {
    setModalTab("login");
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ background: "#030810", color: "#fff", fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 30%, rgba(255,0,60,0.15) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(to bottom, rgba(3,8,16,0.1) 0%, rgba(3,8,16,1) 100%)" }} />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        
        {/* Logo Section */}
        <div className="w-16 h-16 rounded bg-[var(--color-accent-primary)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,0,60,0.5)]">
          <ShieldAlert size={36} color="#050505" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-widest text-center mb-2" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>
          KAIROS TECH
        </h1>
        <p className="text-[10px] tracking-[0.3em] text-[var(--color-accent-primary)] uppercase text-center mb-12">
          Tactical Mobile Interface
        </p>

        {/* Buttons Section */}
        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={openLogin}
            className="w-full py-4 rounded text-sm font-bold tracking-widest uppercase transition-all"
            style={{
              background: "var(--color-accent-primary)",
              color: "#000",
              boxShadow: "0 0 20px rgba(255,0,60,0.4)"
            }}
          >
            เริ่มต้นใช้งาน
          </button>
        </div>

        {/* Footer Area */}
        <div className="mt-16 text-center opacity-50 flex flex-col gap-2">
          <div className="text-[8px] tracking-[0.2em] uppercase">SYSTEM.STATUS: NOMINAL</div>
          <div className="text-[8px] tracking-[0.2em] uppercase">V 2.4.1 [MOBILE_OPT]</div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        defaultTab={modalTab}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
