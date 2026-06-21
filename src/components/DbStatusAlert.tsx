"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function DbStatusAlert() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkStatus = useCallback(async (manual = false) => {
    if (manual) setChecking(true);
    try {
      const res = await fetch("/api/health", {
        // Prevent browser caching
        cache: "no-store",
        headers: { "Pragma": "no-cache" },
      });
      const data = await res.json();
      setIsConnected(res.ok && data.database === "connected");
    } catch (err) {
      setIsConnected(false);
    } finally {
      if (manual) {
        // Give it a tiny visual delay for feedback
        setTimeout(() => setChecking(false), 500);
      }
      const now = new Date();
      setLastChecked(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }
  }, []);

  // Initial check
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Polling interval
  useEffect(() => {
    const intervalTime = isConnected === false ? 10000 : 30000; // Poll every 10s if offline, 30s if online
    const timer = setInterval(() => {
      checkStatus();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isConnected, checkStatus]);

  // If status check is still initializing or it's connected, don't show the warning bar.
  // Note: We keep the DOM element for smooth translate-y animations.
  const showBanner = isConnected === false;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[10000] p-4 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        showBanner ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <div className="max-w-4xl mx-auto relative overflow-hidden backdrop-blur-md bg-zinc-950/90 border border-rose-500/40 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.25)] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* HUD decoration corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-500" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-500" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-500" />

        {/* Scanline simulation */}
        <div className="absolute inset-0 bg-linear-to-b from-rose-500/5 to-transparent pointer-events-none animate-pulse" />

        <div className="flex items-center gap-4 flex-1">
          {/* Animated flashing icon */}
          <div className="relative shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-zinc-950 animate-ping" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-zinc-950" />
          </div>

          <div>
            <h4 className="font-pixel text-[10px] sm:text-xs text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <span>[CRITICAL_SYSTEM_ERROR]</span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            </h4>
            <p className="mt-1 text-sm font-semibold text-white tracking-wide">
              ตรวจพบปัญหาการเชื่อมต่อ MySQL (XAMPP)
            </p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              กรุณาเปิด <strong className="text-slate-200">XAMPP Control Panel</strong> และกดปุ่ม <strong className="text-rose-400">Start</strong> ที่ช่อง MySQL (พอร์ต 3306) เพื่อเข้าใช้งานระบบ
            </p>
          </div>
        </div>

        {/* Actions & Status info */}
        <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-center justify-end">
          {lastChecked && (
            <span className="text-[10px] font-mono text-slate-500 tracking-wider hidden md:inline">
              CHECKED: {lastChecked}
            </span>
          )}
          
          <button
            onClick={() => checkStatus(true)}
            disabled={checking}
            className="flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 hover:border-rose-500/60 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-rose-300" : ""}`} />
            {checking ? "กำลังตรวจสอบ..." : "ตรวจสอบอีกครั้ง"}
          </button>
        </div>
      </div>
    </div>
  );
}
