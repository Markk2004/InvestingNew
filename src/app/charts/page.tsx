"use client";

// ─────────────────────────────────────────────────────────────
//  Charts Page — Floating TradingView Windows Only
//  Reads ?open=SYMBOL (comma-separated) → auto-opens charts
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useChartManager } from "@/components/FloatingChartManager";
import { useTheme } from "@/components/ThemeProvider";
import MarketTicker from "@/components/MarketTicker";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const SWR_CONFIG = {
  refreshInterval: 10 * 60 * 1000, // 10 min
  revalidateOnFocus: false,
  dedupingInterval: 5 * 60 * 1000,
} as const;

// ── Live Clock ───────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
      );
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span
      style={{
        color: "#60a5fa",
        fontSize: 9,
        fontFamily: "monospace",
        background: "#0a1628",
        border: "1px solid #1e3a5f",
        padding: "2px 8px",
        letterSpacing: 1,
      }}
    >
      {time}
    </span>
  );
}

// ── Inner page that reads searchParams ────────────────────────
function ChartsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const isCrimson = theme === "crimson";
  const { openChart, hasWindows, windows } = useChartManager();

  // ── Background News Poller ──────────────────────────────────
  // Keeps news analysis active and sends Telegram alerts even when the user is on the chart page
  const { data } = useSWR("/api/news?page=1", fetcher, SWR_CONFIG);

  // Auto-process queue if there are pending articles
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data?.pendingArticles && data.pendingArticles.length > 0) {
      interval = setInterval(async () => {
        try {
          await fetch("/api/news?process_queue=true");
        } catch (e) {}
      }, 300000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data?.pendingArticles]);

  // Auto-open symbols from ?open= query param on mount
  useEffect(() => {
    const openParam = searchParams.get("open");
    if (!openParam) return;
    const symbols = openParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    symbols.forEach((sym) => openChart(sym));
    // Clean up URL to avoid re-opening on refresh
    router.replace("/charts", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only on mount

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "var(--color-bg-page)",
        overflow: "hidden",
        color: "white",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* ── TOP NAV BAR ── */}
      <header
          style={{
            height: 48,
            flexShrink: 0,
            background: "var(--color-bg-header)",
            backdropFilter: "blur(12px)",
            borderBottom: "2px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 10,
            boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
            zIndex: 100,
          }}
        >
          {/* Back */}
          <button
            onClick={() => router.push("/")}
            style={{
              background: "var(--color-button-bg)",
              border: "1px solid var(--color-button-border)",
              color: "var(--color-button-text)",
              fontSize: 9,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: 1,
              flexShrink: 0,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-button-bg-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-button-bg)")}
          >
            ◀ OFFICE
          </button>

          <div style={{ width: 1, height: 28, background: "var(--color-border-subtle)", flexShrink: 0 }} />

          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 18 }}>📊</span>
            <div>
              <div
                style={{
                  color: "var(--color-accent-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: "bold",
                  letterSpacing: 2,
                }}
              >
                DASH TERMINAL
              </div>
              <div style={{ color: "var(--color-text-subtitle)", fontSize: 7, letterSpacing: 1 }}>
                FLOATING CHART WINDOWS
              </div>
            </div>
          </div>

          <div style={{ width: 1, height: 28, background: "var(--color-border-subtle)", flexShrink: 0 }} />

          {/* Nav links */}
          {[
            { label: "📈 OVERVIEW", href: "/overview", color: "#4fc3f7" },
            { label: "⭐ WATCHLIST", href: "/watchlist", color: "#fbbf24" },
          ].map(({ label, href, color }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                background: "transparent",
                border: "1px solid #1e3a5f",
                color: "#475569",
                fontSize: 8,
                padding: "4px 10px",
                cursor: "pointer",
                fontFamily: "monospace",
                letterSpacing: 0.5,
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                (e.currentTarget as HTMLButtonElement).style.color = color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e3a5f";
                (e.currentTarget as HTMLButtonElement).style.color = "#475569";
              }}
            >
              {label}
            </button>
          ))}

          <div style={{ width: 1, height: 28, background: "var(--color-border-subtle)", flexShrink: 0 }} />

          {/* Windows count badge */}
          {hasWindows && (
            <div
              style={{
                background: "var(--color-badge-bg)",
                border: "1px solid var(--color-badge-border)",
                padding: "3px 10px",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "var(--color-badge-text)", fontSize: 8, fontFamily: "var(--font-mono)" }}>
                {windows.length} CHART{windows.length !== 1 ? "S" : ""} OPEN
              </span>
            </div>
          )}

          <div style={{ flex: 1 }} />
          
          {/* Token Usage Status Line */}
          {data?.usage && (
            <div 
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "0 10px",
                borderRight: "1px solid #0d2040",
                borderLeft: "1px solid #0d2040",
                marginRight: "4px"
              }}
              title={`Prompt: ${data.usage.prompt_tokens} | Completion: ${data.usage.completion_tokens}`}
            >
              <span style={{ color: "#475569", fontSize: 7 }}>AI ENGINE ({data.usage.model})</span>
              <span style={{ color: data.usage.cost > 0.1 ? "#facc15" : "#22c55e", fontSize: 7 }}>
                ${data.usage.cost.toFixed(4)} / {data.usage.total_tokens.toLocaleString()} TKNS
              </span>
            </div>
          )}

          {/* Live status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "#0a1e12",
              border: "1px solid #166534",
              padding: "2px 8px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px #22c55e",
                display: "inline-block",
                animation: "pixelBlink 2s ease-in-out infinite",
              }}
            />
            <span style={{ color: "#22c55e", fontSize: 8 }}>LIVE</span>
          </div>

          <LiveClock />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="font-pixel transition-transform active:scale-90 hover:scale-105"
            style={{
              fontSize: "7px",
              padding: "6px 12px",
              background: isCrimson ? "var(--color-bg-card)" : "transparent",
              border: "2px solid var(--color-accent-primary)",
              color: "var(--color-accent-primary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              marginLeft: "8px",
            }}
          >
            {isCrimson ? "[ 🔴 CRIMSON ]" : "[ 🎮 NORMAL ]"}
          </button>
        </header>

      {/* ── DESKTOP WORKSPACE ── */}
      <main
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          background: "var(--color-bg-page-gradient)",
          backgroundColor: "var(--color-bg-page)",
        }}
      >
        {/* Empty state */}
        {!hasWindows && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 64, opacity: 0.1, filter: "grayscale(1)" }}>
              📊
            </div>
            <div
              style={{
                textAlign: "center",
                color: "#1e3a5f",
                fontFamily: "monospace",
                lineHeight: 2,
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: 2 }}>NO CHARTS OPEN</div>
              <div style={{ fontSize: 8 }}>
                Go to{" "}
                <span style={{ color: "#4fc3f7" }}>📈 Overview</span> or{" "}
                <span style={{ color: "#fbbf24" }}>⭐ Watchlist</span>
              </div>
              <div style={{ fontSize: 8 }}>
                and click a stock to open it here
              </div>
            </div>
          </div>
        )}

        {/* Grid dots background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #0d2040 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.3,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Floating chart windows + control toolbar are rendered globally by ChartManagerProvider */}
      </main>

      {/* ── FOOTER TICKER ── */}
      <footer
        style={{
          flexShrink: 0,
          height: 28,
          borderTop: "1px solid var(--color-border-subtle)",
          background: "var(--color-bg-header)",
          position: "relative",
          zIndex: 50,
        }}
      >
        <MarketTicker />
      </footer>

      <style>{`
        @keyframes pixelBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ── Exported page (wrapped in Suspense for useSearchParams) ───
export default function ChartsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#030810", color: "#1e3a5f", fontFamily: "monospace", fontSize: 9 }}>
        LOADING…
      </div>
    }>
      <ChartsInner />
    </Suspense>
  );
}
