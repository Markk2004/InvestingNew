// ─────────────────────────────────────────────────────────────
//  LoadingSkeleton — Pixel Art 8-bit style loading placeholder
// ─────────────────────────────────────────────────────────────

export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ── Top Row: Gauge + Stats Skeleton ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gauge skeleton */}
        <div
          className="lg:col-span-1 h-48 animate-pulse"
          style={{
            border: "2px solid var(--pixel-border)",
            background: "rgba(26,26,62,0.5)",
          }}
        />
        {/* Stats skeleton */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse"
              style={{
                border: "2px solid var(--pixel-border)",
                background: "rgba(26,26,62,0.5)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── News Grid Skeleton ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col h-64 animate-pulse"
            style={{
              border: "2px solid var(--pixel-border)",
              background: "rgba(26,26,62,0.3)",
            }}
          >
            {/* Header part */}
            <div
              className="px-4 py-3 flex gap-3"
              style={{ borderBottom: "1px solid rgba(58,58,110,0.5)" }}
            >
              <div className="w-11 h-11 bg-[var(--pixel-border)] opacity-30" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-[var(--pixel-border)] opacity-30 w-full" />
                <div className="h-3 bg-[var(--pixel-border)] opacity-30 w-2/3" />
              </div>
            </div>
            {/* Summary part */}
            <div className="px-4 py-3 flex-1 space-y-2 mt-2">
              <div className="h-2 bg-[var(--pixel-border)] opacity-20 w-full" />
              <div className="h-2 bg-[var(--pixel-border)] opacity-20 w-full" />
              <div className="h-2 bg-[var(--pixel-border)] opacity-20 w-4/5" />
            </div>
            {/* Footer part */}
            <div
              className="px-4 py-2 flex gap-2"
              style={{ borderTop: "1px solid rgba(58,58,110,0.5)" }}
            >
              <div className="h-4 bg-[var(--pixel-border)] opacity-20 w-12" />
              <div className="h-4 bg-[var(--pixel-border)] opacity-20 w-16" />
            </div>
          </div>
        ))}
      </div>
      
      {/* ── Loading Overlay HUD ───────────────────────────── */}
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div 
          className="font-pixel px-6 py-4 animate-text-blink text-center"
          style={{
            background: "rgba(13,13,43,0.8)",
            border: "2px solid var(--pixel-blue)",
            color: "var(--pixel-blue)",
            fontSize: "12px",
            boxShadow: "0 0 20px rgba(79,195,247,0.4)"
          }}
        >
          <div className="mb-2">LOADING DATA</div>
          <div className="flex gap-2 justify-center">
            <span className="w-2 h-2 bg-[var(--pixel-blue)]" />
            <span className="w-2 h-2 bg-[var(--pixel-blue)]" />
            <span className="w-2 h-2 bg-[var(--pixel-blue)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
