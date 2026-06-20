"use client";

// ─────────────────────────────────────────────────────────────
//  GameShell — Kairosoft-style top bar + 3-tab navigation
//  Wraps OfficeTab, CharacterTab, and routes to /news for AnalysisNew
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OfficeTab from "@/components/OfficeTab";
import CharacterTab from "@/components/CharacterTab";
import { useWatchlist } from "@/lib/useWatchlist";
import { useTheme } from "@/components/ThemeProvider";
import { Building2, User, Users, Newspaper, BarChart2, LineChart, Star, LogOut } from "lucide-react";
import CyberHudDashboard from "@/components/CyberHudDashboard";
import { clearAuth, getUser } from "@/lib/auth";

type Tab = "office" | "character";


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
  id: Tab | "news" | "charts" | "overview" | "watchlist" | "member";
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  glowColor?: string;
}

function TabButton({ label, icon, active, onClick, glowColor = "#4fc3f7" }: TabButtonProps) {
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
      <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
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

// ── Ticker Tape ────────────────────────────────────────────────────────────────

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const DEFAULT_TICKERS: TickerData[] = [
  { symbol: "AAPL", price: 180.25, change: 2.15, changePercent: 1.2 },
  { symbol: "NVDA", price: 875.12, change: 18.02, changePercent: 2.1 },
  { symbol: "MSFT", price: 421.90, change: 3.76, changePercent: 0.9 },
  { symbol: "GOOG", price: 151.60, change: -0.61, changePercent: -0.4 },
  { symbol: "TSLA", price: 171.05, change: -3.13, changePercent: -1.8 },
  { symbol: "META", price: 505.35, change: 2.51, changePercent: 0.5 },
  { symbol: "AMD", price: 178.50, change: 2.30, changePercent: 1.3 },
  { symbol: "INTC", price: 34.20, change: -0.24, changePercent: -0.7 },
  { symbol: "PLTR", price: 23.40, change: 0.73, changePercent: 3.2 },
  { symbol: "COIN", price: 248.50, change: 6.76, changePercent: 2.8 },
  { symbol: "TSM", price: 141.20, change: 0.84, changePercent: 0.6 },
  { symbol: "AMZN", price: 174.80, change: -0.35, changePercent: -0.2 },
];

function TickerTape() {
  const [tickers, setTickers] = useState<TickerData[]>(DEFAULT_TICKERS);

  useEffect(() => {
    let active = true;
    const fetchTickers = async () => {
      try {
        const symbols = DEFAULT_TICKERS.map(t => t.symbol).join(",");
        const res = await fetch(`/api/ticker?symbols=${symbols}`);
        if (!res.ok) throw new Error("HTTP error");
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setTickers(data);
        }
      } catch (err) {
        console.error("Failed to fetch tickers in GameShell:", err);
      }
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Double the tickers array for seamless looping scrolling
  const displayTickers = [...tickers, ...tickers];

  return (
    <div
      style={{
        overflow: "hidden",
        flex: 1,
        position: "relative",
        mask: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          animation: "tickerScroll 40s linear infinite",
          fontSize: 8,
          fontFamily: "monospace",
          display: "inline-block",
        }}
      >
        {displayTickers.map((t, idx) => {
          const isUp = t.changePercent >= 0;
          const color = isUp ? "#22c55e" : "#ef4444"; // Green or Red
          const sign = isUp ? "▲" : "▼";
          const pct = Math.abs(t.changePercent).toFixed(1);
          return (
            <span key={idx} style={{ marginRight: 24, display: "inline-flex", alignItems: "center" }}>
              <span style={{ color: "#cce0ff", fontWeight: "bold", marginRight: 4 }}>{t.symbol}</span>
              <span style={{ color: "#94a3b8", marginRight: 6 }}>{t.price ? t.price.toFixed(2) : "0.00"}</span>
              <span style={{ color, display: "inline-flex", alignItems: "center" }}>
                <span style={{ fontSize: 7, marginRight: 2 }}>{sign}</span>
                <span>{pct}%</span>
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ── Watchlist Tab Button (with live count badge) ───────────────────────────────

function WatchlistTabButton() {
  const router = useRouter();
  const { items } = useWatchlist();
  const glowColor = "#fbbf24";
  return (
    <button
      onClick={() => router.push("/watchlist")}
      style={{
        background: "transparent",
        border: `2px solid #1e2a3a`,
        color: "#475569",
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
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = `${glowColor}80`;
        (e.currentTarget as HTMLButtonElement).style.color = `${glowColor}cc`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e2a3a";
        (e.currentTarget as HTMLButtonElement).style.color = "#475569";
      }}
    >
      <span style={{ display: "flex", alignItems: "center" }}><Star size={13} /></span>
      <span>Watchlist</span>
      {items.length > 0 && (
        <span
          style={{
            background: glowColor,
            color: "#030810",
            fontSize: 7,
            fontWeight: "bold",
            padding: "1px 5px",
            borderRadius: 8,
            lineHeight: 1.4,
            minWidth: 16,
            textAlign: "center",
          }}
        >
          {items.length}
        </span>
      )}
    </button>
  );
}

// ── Main GameShell ─────────────────────────────────────────────────────────────

export default function GameShell() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("office");
  const [username, setUsername] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "character") {
        setActiveTab("character");
      }
      // Load user info
      const user = getUser();
      if (user) {
        setUsername(user.username);
        setUserRole(user.role || "");
        if (user.role === "member") {
          router.replace("/news");
        }
      }
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.replace("/");
  };

  const { theme, toggleTheme } = useTheme();
  const isCrimson = theme === "crimson";
  const [spriteOverrides, setSpriteOverrides] = useState<Record<string, number>>({
    mxrk: 1,
    gemini: 2,
    newinvester: 3,
    techie: 5,
  });

  if (isCrimson) {
    return (
      <CyberHudDashboard activeTab={activeTab} setActiveTab={setActiveTab}>
        <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
          {activeTab === "office" && <OfficeTab spriteOverrides={spriteOverrides} />}
          {activeTab === "character" && (
            <CharacterTab spriteOverrides={spriteOverrides} setSpriteOverrides={setSpriteOverrides} />
          )}
        </main>
      </CyberHudDashboard>
    );
  }

  return (
      <div
        style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--color-bg-page)",
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
              KAIROS TECH
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
          {userRole !== "member" && (
            <TabButton
              id="office"
              icon={<Building2 size={13} />}
              label="Office Overview"
              active={activeTab === "office"}
              onClick={() => setActiveTab("office")}
              glowColor="#4fc3f7"
            />
          )}
          {userRole !== "member" && (
            <TabButton
              id="character"
              icon={<User size={13} />}
              label="Character"
              active={activeTab === "character"}
              onClick={() => setActiveTab("character")}
              glowColor="#c084fc"
            />
          )}
          <TabButton
            id="news"
            icon={<Newspaper size={13} />}
            label="AnalysisNew"
            active={false}
            onClick={() => router.push("/news")}
            glowColor="#69ff47"
          />
          <TabButton
            id="charts"
            icon={<BarChart2 size={13} />}
            label="Charts"
            active={false}
            onClick={() => router.push("/charts")}
            glowColor="#f43f5e"
          />
          {userRole !== "member" && (
            <TabButton
              id="overview"
              icon={<LineChart size={13} />}
              label="Overview"
              active={false}
              onClick={() => router.push("/overview")}
              glowColor="#4fc3f7"
            />
          )}
          <WatchlistTabButton />
        </nav>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#0d2040", flexShrink: 0 }} />

        {/* Ticker Tape */}
        <TickerTape />

        {/* Clock */}
        <LiveClock />


        {/* Username badge */}
        {username && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "#0a1628", border: "1px solid #1e3a5f",
              padding: "2px 8px", flexShrink: 0,
              fontSize: 7, fontFamily: "monospace", color: "#60a5fa",
              letterSpacing: 1,
            }}
          >
            <span style={{ color: "#475569" }}>AGENT:</span>
            <span>{username.toUpperCase()}</span>
          </div>
        )}

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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            background: "transparent",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "rgba(239,68,68,0.7)",
            fontSize: 7,
            padding: "5px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "monospace",
            letterSpacing: 1,
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.8)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(239,68,68,0.7)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <LogOut size={11} />
          <span>LOGOUT</span>
        </button>
      </header>

      {/* ── TAB CONTENT ── */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "office" && <OfficeTab spriteOverrides={spriteOverrides} />}
        {activeTab === "character" && (
          <CharacterTab spriteOverrides={spriteOverrides} setSpriteOverrides={setSpriteOverrides} />
        )}
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
            : ""}
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
            KAIROS TECH v1.0 · Gemini AI
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
  );
}
