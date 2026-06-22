"use client";

// ─────────────────────────────────────────────────────────────
//  /overview page — Market Overview Dashboard
//  Sections: US Market List + breadth placeholders
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import USMarketListPanel from "@/components/overview/USMarketListPanel";
import SectorPerformancePanel from "@/components/overview/SectorPerformancePanel";
import MobileMarketList from "@/components/mobile/MobileMarketList";
import MarketTicker from "@/components/MarketTicker";
import { useTheme } from "@/components/ThemeProvider";
import { Star, BarChart2, TrendingUp } from "lucide-react";
import ResponsiveDashboard from "@/components/ResponsiveDashboard";

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



// ── Main Overview Page ────────────────────────────────────────
export default function OverviewPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isCrimson = theme === "crimson";

  const renderContent = () => (
    <>
      {/* MOBILE CONTENT */}
      <div className="block xl:hidden flex-1 overflow-hidden">
        <MobileMarketList />
      </div>

      {/* DESKTOP CONTENT */}
      <main
        className="hidden xl:flex"
        style={{
          flex: 1,
          overflow: "hidden",
          padding: "16px 20px 12px",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Horizontal split for Market List & Sector Performance */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-y-auto lg:overflow-hidden min-h-0">
          {/* Left Column: US Market List */}
          <div className="flex-1 lg:flex-[3] flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
            <USMarketListPanel />
          </div>

          {/* Right Column: Sector Performance Tierlist */}
          <div className="flex-1 lg:flex-[2] flex flex-col overflow-hidden min-h-[300px] lg:min-h-0">
            <SectorPerformancePanel />
          </div>
        </div>
      </main>
    </>
  );

  if (isCrimson) {
    return (
      <ResponsiveDashboard
        activeTab="overview"
        setActiveTab={() => {}}
        contentClassName="flex-1 overflow-hidden p-6 relative flex flex-col h-full"
      >
        {renderContent()}
      </ResponsiveDashboard>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: isCrimson ? "transparent" : "#030810",
        overflow: "hidden",
        color: "white",
        fontFamily: "monospace",
      }}
    >
      {/* ── HEADER ── */}
      <header
        className="hide-scrollbar"
        style={{
          height: 48,
          flexShrink: 0,
          background: isCrimson ? "var(--color-bg-header)" : "#060d1a",
          borderBottom: isCrimson ? "2px solid var(--color-border-subtle)" : "2px solid #0d2040",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          gap: 10,
          boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
          zIndex: 100,
          overflowX: "auto",
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
          <TrendingUp size={18} style={{ color: "#4fc3f7" }} />
          <div>
            <div style={{ color: "#4fc3f7", fontFamily: "monospace", fontSize: 10, fontWeight: "bold", letterSpacing: 2 }}>
              MARKET OVERVIEW
            </div>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 1 }}>
              US EQUITIES · SECTOR PERFORMANCE
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Navigation links */}
        {[
          { label: "WATCHLIST", icon: <Star size={11} />, href: "/watchlist", color: "#fbbf24" },
          { label: "CHARTS", icon: <BarChart2 size={11} />, href: "/charts", color: "#f43f5e" },
        ].map(({ label, icon, href, color }) => (
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
      {renderContent()}

      {/* ── FOOTER TICKER ── */}
      <footer
        style={{
          flexShrink: 0,
          height: 28,
          borderTop: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #0d2040",
          background: isCrimson ? "var(--color-bg-header)" : "#060d1a",
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
