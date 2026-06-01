// ─────────────────────────────────────────────────────────────
//  ErrorBanner Component
//  Shown when the /api/news endpoint fails or returns an error.
//  Displays a human-friendly message and a retry button.
// ─────────────────────────────────────────────────────────────

"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorBanner({
  message = "ไม่สามารถโหลดข้อมูลข่าวได้ในขณะนี้",
  onRetry,
}: ErrorBannerProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 flex flex-col items-center text-center gap-4">
        {/* Icon */}
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-rose-400" />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-base font-bold text-white mb-1">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </h3>
          <p className="text-sm text-slate-400 max-w-md">{message}</p>
          <p className="text-xs text-slate-500 mt-2">
            ระบบจะพยายามโหลดข้อมูลใหม่โดยอัตโนมัติ หรือกดปุ่มด้านล่างเพื่อลองทันที
          </p>
        </div>

        {/* Retry */}
        <button
          onClick={onRetry}
          className="flex items-center gap-2 h-10 px-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 hover:border-rose-500/50 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          ลองอีกครั้ง
        </button>

        {/* Technical detail (collapsed) */}
        {message && (
          <details className="text-[10px] text-slate-600 cursor-pointer">
            <summary className="hover:text-slate-500 transition-colors">
              ดูรายละเอียดข้อผิดพลาด
            </summary>
            <code className="block mt-2 text-rose-500/70 bg-slate-950/60 rounded-lg px-3 py-2 text-left max-w-sm">
              {message}
            </code>
          </details>
        )}
      </div>
    </div>
  );
}
