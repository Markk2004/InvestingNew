"use client";

// ─────────────────────────────────────────────────────────────
//  Charts Page — Market Overview + Watchlist + Floating Charts
//  Three-column layout with draggable chart windows
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MarketOverviewPanel from "@/components/MarketOverviewPanel";
import WatchlistPanel from "@/components/WatchlistPanel";
import { useChartManager } from "@/components/FloatingChartManager";
import MarketTicker from "@/components/MarketTicker";

const WATCHLIST_KEY = "invester_watchlist_v1";

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

// ── Live Clock ──────────────────────────────────────────────────────────────────
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

export default function ChartsPage() {
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const { openChart, ManagerUI, hasWindows, windows } = useChartManager();

  // Load watchlist from localStorage
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      if (prev.includes(symbol)) return prev;
      const next = [...prev, symbol];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== symbol);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const handleOpenChart = useCallback(
    (symbol: string) => {
      openChart(symbol);
    },
    [openChart]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: "#030810",
        overflow: "hidden",
        color: "white",
        fontFamily: "monospace",
      }}
    >
      {/* ── TOP NAV BAR ── */}
      <header
        style={{
          height: 48,
          flexShrink: 0,
          background: "#060d1a",
          borderBottom: "2px solid #0d2040",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 10,
          boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          style={{
            background: "#0a1f3a",
            border: "1px solid #2563c8",
            color: "#93c5fd",
            fontSize: 9,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "monospace",
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 4,
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#1e3a5f")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "#0a1f3a")
          }
        >
          ◀ OFFICE
        </button>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>📊</span>
          <div>
            <div
              style={{
                color: "#f43f5e",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: 2,
              }}
            >
              DASH TERMINAL
            </div>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 1 }}>
              MARKET MONITOR · MULTI-CHART
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Panel toggles */}
        <button
          onClick={() => setLeftOpen((v) => !v)}
          style={{
            background: leftOpen ? "#0a1f3a" : "transparent",
            border: `1px solid ${leftOpen ? "#4fc3f7" : "#1e3a5f"}`,
            color: leftOpen ? "#4fc3f7" : "#475569",
            fontSize: 8,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "monospace",
            letterSpacing: 0.5,
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          🇺🇸 MARKET {leftOpen ? "▶" : "◀"}
        </button>

        <button
          onClick={() => setRightOpen((v) => !v)}
          style={{
            background: rightOpen ? "#1a1200" : "transparent",
            border: `1px solid ${rightOpen ? "#fbbf24" : "#1e3a5f"}`,
            color: rightOpen ? "#fbbf24" : "#475569",
            fontSize: 8,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: "monospace",
            letterSpacing: 0.5,
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          {rightOpen ? "◀" : "▶"} ⭐ WATCHLIST ({watchlist.length})
        </button>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Windows count */}
        {hasWindows && (
          <div
            style={{
              background: "#0a1a30",
              border: "1px solid #1e3a5f",
              padding: "3px 10px",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#4fc3f7", fontSize: 8, fontFamily: "monospace" }}>
              {windows.length} CHART{windows.length !== 1 ? "S" : ""} OPEN
            </span>
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status */}
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
          <span style={{ color: "#22c55e", fontSize: 8, fontFamily: "monospace" }}>LIVE</span>
        </div>

        <LiveClock />
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* LEFT — Market Overview */}
        {leftOpen && (
          <MarketOverviewPanel
            watchlist={watchlist}
            onAddToWatchlist={addToWatchlist}
            onOpenChart={handleOpenChart}
          />
        )}

        {/* CENTER — Canvas for floating chart windows */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            background: "radial-gradient(ellipse at center, #060f1e 0%, #030810 70%)",
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
              <div
                style={{
                  fontSize: 64,
                  opacity: 0.12,
                  filter: "grayscale(1)",
                }}
              >
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
                  Click a stock name in Market Overview
                </div>
                <div style={{ fontSize: 8 }}>
                  or press <span style={{ color: "#4fc3f7" }}>[📊 GRAPH]</span> in Watchlist
                </div>
              </div>

              {/* Grid dots decoration */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(circle, #0d2040 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              />
            </div>
          )}

          {/* Grid dots always visible */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, #0d2040 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.3,
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {/* Floating chart windows + control toolbar */}
          {ManagerUI}
        </div>

        {/* RIGHT — Watchlist */}
        {rightOpen && (
          <WatchlistPanel
            watchlist={watchlist}
            onRemove={removeFromWatchlist}
            onOpenChart={(symbol) => {
              addToWatchlist(symbol);
              handleOpenChart(symbol);
            }}
          />
        )}
      </main>

      {/* ── FOOTER TICKER ── */}
      <footer
        style={{
          flexShrink: 0,
          height: 28,
          borderTop: "1px solid #0d2040",
          background: "#060d1a",
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
      `}</style>
    </div>
  );
}
