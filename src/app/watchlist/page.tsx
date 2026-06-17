"use client";

// ─────────────────────────────────────────────────────────────
//  /watchlist page — User Watchlist Standalone
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WatchlistStandalonePage from "@/components/watchlist/WatchlistStandalonePage";
import MarketTicker from "@/components/MarketTicker";
import { useWatchlist } from "@/lib/useWatchlist";
import { LineChart, BarChart2 } from "lucide-react";

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
        flexShrink: 0,
      }}
    >
      {time}
    </span>
  );
}

export default function WatchlistPage() {
  const router = useRouter();
  const { items } = useWatchlist();

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
      {/* ── HEADER ── */}
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
        {/* Back */}
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
            flexShrink: 0,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1e3a5f")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0a1f3a")}
        >
          ◀ OFFICE
        </button>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <div>
            <div style={{ color: "#fbbf24", fontFamily: "monospace", fontSize: 10, fontWeight: "bold", letterSpacing: 2 }}>
              MY WATCHLIST
            </div>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 1 }}>
              USER CURATED · {items.length} SYMBOL{items.length !== 1 ? "S" : ""} TRACKED
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Nav links */}
        {[
          { label: "OVERVIEW", icon: <LineChart size={11} />, href: "/overview", color: "#4fc3f7" },
          { label: "CHARTS", icon: <BarChart2 size={11} />, href: "/charts", color: "#f43f5e" },
        ].map(({ label, icon, href, color }) => (
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
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {icon}
              {label}
            </span>
          </button>
        ))}

        <div style={{ flex: 1 }} />

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
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <WatchlistStandalonePage />
      </main>

      {/* ── FOOTER TICKER ── */}
      <footer
        style={{
          flexShrink: 0,
          height: 28,
          borderTop: "1px solid #0d2040",
          background: "#060d1a",
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
