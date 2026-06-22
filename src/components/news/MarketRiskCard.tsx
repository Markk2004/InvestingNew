import { AlertTriangle } from "lucide-react";

export function MarketRiskCard({ score = 7.1 }: { score?: number }) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  return (
    <div className="mx-4 mb-3 rounded-2xl border border-[rgba(255,0,60,0.4)] bg-[#0a0a0f]/60 p-4 shadow-[0_0_24px_-12px_rgba(255,0,60,0.6)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#ff003c]" />
          <span className="text-[11px] font-semibold tracking-widest text-[#888888]">
            MARKET RISK
          </span>
        </div>
        <span className="rounded-md border border-[rgba(255,0,60,0.6)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#ff003c] bg-[rgba(255,0,60,0.1)]">
          {score >= 7 ? "DANGER" : score >= 4 ? "WARNING" : "SAFE"}
        </span>
      </div>
      <div className="flex flex-col items-center py-2">
        <div className="text-5xl font-bold tabular-nums text-[#ff003c]">{score.toFixed(1)}</div>
        <div className="mt-1 text-[10px] tracking-widest text-[#888888]">
          / 10.0 AVG SEVERITY
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 text-[10px] tracking-widest text-[#888888]">
          THREAT LEVEL
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-[#222]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#4fc3f7] via-[#fbbf24] to-[#ff003c]"
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{ left: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[#888888] font-mono">
          <span>0</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
