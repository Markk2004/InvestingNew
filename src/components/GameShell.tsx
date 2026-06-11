"use client";

// ─────────────────────────────────────────────────────────────
//  GameShell — Kairosoft-style top bar + 3-tab navigation
//  Wraps OfficeTab, CharacterTab, and routes to /news for AnalysisNew
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OfficeTab from "@/components/OfficeTab";
import CharacterTab from "@/components/CharacterTab";
import RenovateTab from "@/components/RenovateTab";
import { OfficeProvider } from "@/components/OfficeContext";

type Tab = "office" | "character" | "renovate";

// ── Pixel Company Logo (inline SVG) ───────────────────────────────────────────

function CompanyLogo() {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Building base */}
      <rect x="3" y="6" width="10" height="9" fill="#1e3a5f" />
      {/* Roof */}
      <rect x="2" y="5" width="12" height="2" fill="#2563c8" />
      <rect x="6" y="2" width="4" height="4" fill="#2563c8" />
      <rect x="7" y="1" width="2" height="2" fill="#60a5fa" />
      {/* Windows */}
      <rect x="4" y="8" width="2" height="2" fill="#22c55e" />
      <rect x="7" y="8" width="2" height="2" fill="#22c55e" />
      <rect x="10" y="8" width="2" height="2" fill="#fbbf24" />
      <rect x="4" y="11" width="2" height="2" fill="#60a5fa" />
      <rect x="10" y="11" width="2" height="2" fill="#22c55e" />
      {/* Door */}
      <rect x="7" y="12" width="2" height="3" fill="#0d2040" />
      {/* $ sign on building */}
      <rect x="7" y="8"  width="2" height="5" fill="#fbbf24" opacity="0" />
      {/* Ground line */}
      <rect x="1" y="15" width="14" height="1" fill="#1e3a5f" />
      {/* Glow dots */}
      <rect x="4" y="8" width="1" height="1" fill="#4ade80" />
      <rect x="10" y="8" width="1" height="1" fill="#fde68a" />
    </svg>
  );
}

// ── Live Clock ─────────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`
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

// ── Tab Button ─────────────────────────────────────────────────────────────────

interface TabButtonProps {
  id: Tab | "news";
  label: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
  glowColor?: string;
}

function TabButton({ label, emoji, active, onClick, glowColor = "#4fc3f7" }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active
          ? `rgba(${glowColor === "#4fc3f7" ? "79,195,247" : "105,255,71"},0.08)`
          : "transparent",
        border: `2px solid ${active ? glowColor : "#1e2a3a"}`,
        color: active ? glowColor : "#475569",
        fontSize: 9,
        padding: "6px 14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "monospace",
        letterSpacing: 1,
        transition: "all 0.15s ease",
        position: "relative",
        ...(active
          ? {
              boxShadow: `0 0 8px ${glowColor}40, 0 0 20px ${glowColor}20, inset 0 0 8px ${glowColor}10`,
            }
          : {}),
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${glowColor}80`;
          (e.currentTarget as HTMLButtonElement).style.color = `${glowColor}cc`;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e2a3a";
          (e.currentTarget as HTMLButtonElement).style.color = "#475569";
        }
      }}
    >
      <span style={{ fontSize: 13 }}>{emoji}</span>
      <span>{label}</span>
      {active && (
        <span
          style={{
            position: "absolute",
            bottom: -2,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: 2,
            background: glowColor,
            boxShadow: `0 0 6px ${glowColor}`,
          }}
        />
      )}
    </button>
  );
}

// ── Ticker Tape ────────────────────────────────────────────────────────────────

const TICKERS = [
  "AAPL ▲+1.2%", "NVDA ▲+2.1%", "MSFT ▲+0.9%", "GOOG ▼-0.4%",
  "TSLA ▼-1.8%", "META ▲+0.5%", "AMD  ▲+1.3%", "INTC ▼-0.7%",
  "PLTR ▲+3.2%", "COIN ▲+2.8%", "TSM  ▲+0.6%", "AMZN ▼-0.2%",
];

function TickerTape() {
  const text = TICKERS.join("  ·  ") + "  ·  " + TICKERS.join("  ·  ");
  return (
    <div
      style={{
        overflow: "hidden",
        flex: 1,
        position: "relative",
        mask: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          animation: "tickerScroll 40s linear infinite",
          color: "#3b82f6",
          fontSize: 8,
          fontFamily: "monospace",
          display: "inline-block",
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ── Main GameShell ─────────────────────────────────────────────────────────────

export default function GameShell() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("office");
  const [spriteOverrides, setSpriteOverrides] = useState<Record<string, number>>({
    mxrk: 1,
    gemini: 2,
    newinvester: 3,
  });

  return (
    <OfficeProvider>
      <div
        style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#03080f",
        overflow: "hidden",
      }}
    >
      {/* ── TOP BAR ── */}
      <header
        style={{
          background: "#060d1a",
          borderBottom: "2px solid #0d2040",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 12px",
          height: 48,
          flexShrink: 0,
          position: "relative",
          boxShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo + Company Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <CompanyLogo />
          <div>
            <div
              className="logo-shimmer font-pixel"
              style={{ fontSize: 10, letterSpacing: 2, lineHeight: 1.2 }}
            >
              INVESTER CORP
            </div>
            <div style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace", letterSpacing: 1 }}>
              AI-POWERED TRADING
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Tab Navigation */}
        <nav style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
          <TabButton
            id="office"
            emoji="🏢"
            label="Office Overview"
            active={activeTab === "office"}
            onClick={() => setActiveTab("office")}
            glowColor="#4fc3f7"
          />
          <TabButton
            id="character"
            emoji="👔"
            label="Character"
            active={activeTab === "character"}
            onClick={() => setActiveTab("character")}
            glowColor="#c084fc"
          />
          <TabButton
            id="renovate"
            emoji="🏗️"
            label="Renovate"
            active={activeTab === "renovate"}
            onClick={() => setActiveTab("renovate")}
            glowColor="#fbbf24"
          />
          <TabButton
            id="news"
            emoji="📰"
            label="AnalysisNew"
            active={false}
            onClick={() => router.push("/news")}
            glowColor="#69ff47"
          />
        </nav>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Ticker Tape */}
        <TickerTape />

        {/* Clock */}
        <LiveClock />

        {/* Status badge */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "#0a1e12", border: "1px solid #166534",
            padding: "2px 8px", flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#22c55e", boxShadow: "0 0 6px #22c55e",
              display: "inline-block",
              animation: "pixelBlink 2s ease-in-out infinite",
            }}
          />
          <span style={{ color: "#22c55e", fontSize: 8, fontFamily: "monospace" }}>LIVE</span>
        </div>
      </header>

      {/* ── TAB CONTENT ── */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "office" && <OfficeTab spriteOverrides={spriteOverrides} />}
        {activeTab === "character" && (
          <CharacterTab spriteOverrides={spriteOverrides} setSpriteOverrides={setSpriteOverrides} />
        )}
        {activeTab === "renovate"  && <RenovateTab />}
      </main>

      {/* ── BOTTOM STATUS BAR ── */}
      <footer
        style={{
          background: "#040c18",
          borderTop: "1px solid #0d2040",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "3px 12px",
          height: 24,
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace", letterSpacing: 1 }}>
          {activeTab === "office"
            ? "+ Click any work zone to send nearest agent there"
            : activeTab === "character"
            ? "🎮 Pick a claw-empire sprite for each staff member"
            : activeTab === "renovate"
            ? "🏗️ As CEO: pick flooring theme, buy furniture, and design your dream office"
            : ""}
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
            INVESTER CORP v1.0 · Gemini AI
          </span>
          <button
            onClick={() => router.push("/news")}
            style={{
              background: "#0a1e12", border: "1px solid #166534",
              color: "#22c55e", fontSize: 7, padding: "1px 8px",
              cursor: "pointer", fontFamily: "monospace", letterSpacing: 1,
              display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e", display: "inline-block" }} />
            AnalysisNew →
          </button>
        </div>
      </footer>

      {/* Inline keyframe for ticker scroll */}
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
      </div>
    </OfficeProvider>
  );
}
