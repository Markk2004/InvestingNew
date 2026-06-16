"use client";

// ─────────────────────────────────────────────────────────────
//  /overview page — Market Overview Dashboard
//  Sections: US Market List + breadth placeholders
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import USMarketListPanel from "@/components/overview/USMarketListPanel";
import SectorPerformancePanel from "@/components/overview/SectorPerformancePanel";
import MarketTicker from "@/components/MarketTicker";

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

// ── Placeholder section card ──────────────────────────────────
function PlaceholderSection({
  title,
  icon,
  description,
  color = "#1e3a5f",
}: {
  title: string;
  icon: string;
  description: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#04090f",
        border: `1px solid #0d2040`,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div>
          <div
            style={{
              color,
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: "bold",
              letterSpacing: 1.5,
            }}
          >
            {title}
          </div>
          <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 7 }}>
            SCANNER BACKEND REQUIRED
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              background: "#0d1a0d",
              border: "1px solid #166534",
              color: "#22c55e",
              fontSize: 6,
              fontFamily: "monospace",
              padding: "2px 8px",
              letterSpacing: 1,
            }}
          >
            COMING SOON
          </span>
        </div>
      </div>
      <div
        style={{
          color: "#1e3a5f",
          fontFamily: "monospace",
          fontSize: 8,
          lineHeight: 1.6,
          borderTop: "1px solid #0d2040",
          paddingTop: 10,
          marginTop: 4,
        }}
      >
        {description}
      </div>
      {/* Mock grid placeholder */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginTop: 4,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 36,
              background: "#060d1a",
              border: "1px solid #0d2040",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: `${40 + i * 10}%`,
                height: 6,
                background: "#0d2040",
                borderRadius: 2,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Breadth gauge visual ──────────────────────────────────────
function BreadthPlaceholder() {
  const items = [
    { label: "ADV", value: "—", color: "#22c55e" },
    { label: "DEC", value: "—", color: "#ef4444" },
    { label: "52W HI", value: "—", color: "#4fc3f7" },
    { label: "52W LO", value: "—", color: "#f43f5e" },
    { label: "A/D LINE", value: "—", color: "#fbbf24" },
    { label: "MCO", value: "—", color: "#a78bfa" },
  ];

  return (
    <div
      style={{
        background: "#04090f",
        border: "1px solid #0d2040",
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>📊</span>
        <div>
          <div style={{ color: "#4fc3f7", fontFamily: "monospace", fontSize: 10, fontWeight: "bold", letterSpacing: 1.5 }}>
            MARKET BREADTH
          </div>
          <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 7 }}>
            NYSE/NASDAQ ADVANCE-DECLINE · BACKEND REQUIRED
          </div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            background: "#0d1a0d",
            border: "1px solid #166534",
            color: "#22c55e",
            fontSize: 6,
            fontFamily: "monospace",
            padding: "2px 8px",
            letterSpacing: 1,
          }}
        >
          COMING SOON
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#060d1a",
              border: `1px solid ${item.color}20`,
              padding: "10px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ color: item.color, fontFamily: "monospace", fontSize: 16, marginBottom: 4 }}>
              {item.value}
            </div>
            <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 6, letterSpacing: 0.5 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Overview Page ────────────────────────────────────────
export default function OverviewPage() {
  const router = useRouter();

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
          <span style={{ fontSize: 18 }}>📈</span>
          <div>
            <div style={{ color: "#4fc3f7", fontFamily: "monospace", fontSize: 10, fontWeight: "bold", letterSpacing: 2 }}>
              MARKET OVERVIEW
            </div>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 1 }}>
              US EQUITIES · BREADTH · SCANNER
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Navigation links */}
        {[
          { label: "⭐ WATCHLIST", href: "/watchlist", color: "#fbbf24" },
          { label: "📊 CHARTS", href: "/charts", color: "#f43f5e" },
        ].map(({ label, href, color }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              background: "transparent",
              border: `1px solid #1e3a5f`,
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
      <main
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "16px 20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Horizontal split for Market List & Sector Performance */}
        <div style={{ display: "flex", flexDirection: "row", gap: 16, flex: 1, overflow: "hidden" }}>
          {/* Left Column: US Market List */}
          <div style={{ flex: 3, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <USMarketListPanel />
          </div>

          {/* Right Column: Sector Performance Tierlist */}
          <div style={{ flex: 2, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <SectorPerformancePanel />
          </div>
        </div>

        {/* Market Breadth placeholder */}
        <BreadthPlaceholder />
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
