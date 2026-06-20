"use client";
// ─────────────────────────────────────────────────────────────
//  AuthGuard — ป้องกัน routes ที่ต้อง login
//  ใช้ห่อ component ที่ต้อง authenticated
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // client-side check
    if (isLoggedIn()) {
      setAuthorized(true);
    } else {
      router.replace("/");
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner">
          <div className="auth-guard-ring" />
          <div className="auth-guard-ring auth-guard-ring--delay" />
        </div>
        <p className="auth-guard-text">VERIFYING CREDENTIALS...</p>
        <style jsx>{`
          .auth-guard-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #000;
            gap: 1.5rem;
          }
          .auth-guard-spinner {
            position: relative;
            width: 48px;
            height: 48px;
          }
          .auth-guard-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 1.5px solid transparent;
            border-top-color: rgba(132, 204, 22, 0.8);
            animation: spin 1s linear infinite;
          }
          .auth-guard-ring--delay {
            inset: 8px;
            border-top-color: rgba(212, 175, 55, 0.6);
            animation-duration: 0.7s;
            animation-direction: reverse;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .auth-guard-text {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.6rem;
            letter-spacing: 0.3em;
            color: rgba(132, 204, 22, 0.5);
            text-transform: uppercase;
          }
        `}</style>
      </div>
    );
  }

  if (!authorized) return null;
  return <>{children}</>;
}
