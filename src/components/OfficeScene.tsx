"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CharacterSprite, { CharacterState } from "./CharacterSprite";

// ─── Animated Trading Dashboard ───────────────────────────────────────────────
interface Trade {
  symbol: string;
  price: number;
  change: number;
  shares: number;
}

const INITIAL_TRADES: Trade[] = [
  { symbol: "BTC", price: 67420, change: 2.4, shares: 1 },
  { symbol: "ETH", price: 3812, change: -1.2, shares: 3 },
  { symbol: "SOL", price: 182, change: 5.7, shares: 8 },
  { symbol: "ADA", price: 0.58, change: -0.8, shares: 200 },
  { symbol: "DOT", price: 8.92, change: 3.1, shares: 15 },
  { symbol: "LINK", price: 14.5, change: -2.3, shares: 12 },
  { symbol: "MATIC", price: 0.88, change: 1.5, shares: 120 },
  { symbol: "AVAX", price: 38.2, change: 4.2, shares: 5 },
  { symbol: "UNI", price: 7.4, change: -0.5, shares: 20 },
  { symbol: "ATOM", price: 9.1, change: 2.8, shares: 18 },
  { symbol: "NEAR", price: 5.2, change: -1.9, shares: 30 },
  { symbol: "FTM", price: 0.44, change: 6.3, shares: 300 },
];

function TradingDashboard({
  averageSeverity,
  isLoading,
}: {
  averageSeverity?: number;
  isLoading?: boolean;
}) {
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [balance, setBalance] = useState(70.8);
  const [cost, setCost] = useState(55.07);
  const [tick, setTick] = useState(0);
  const [chartData, setChartData] = useState<number[]>(
    Array.from({ length: 30 }, (_, i) => 60 + Math.sin(i * 0.4) * 8 + Math.random() * 4)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setTrades((prev) =>
        prev.map((tr) => ({
          ...tr,
          price: +(tr.price * (1 + (Math.random() - 0.49) * 0.004)).toFixed(
            tr.price < 1 ? 4 : tr.price < 100 ? 2 : 0
          ),
          change: +(tr.change + (Math.random() - 0.5) * 0.3).toFixed(2),
        }))
      );
      setBalance((b) => +(b + (Math.random() - 0.48) * 0.15).toFixed(2));
      setCost((c) => +(c + (Math.random() - 0.5) * 0.05).toFixed(2));
      setChartData((prev) => {
        const next = [...prev.slice(1), +(prev[prev.length - 1] + (Math.random() - 0.48) * 1.5).toFixed(2)];
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const totalShares = trades.length;
  const pnl = +(balance - cost).toFixed(2);
  const pnlPct = +((pnl / cost) * 100).toFixed(2);

  const minChart = Math.min(...chartData);
  const maxChart = Math.max(...chartData);
  const chartRange = maxChart - minChart || 1;

  const polyPoints = chartData
    .map((v, i) => {
      const x = (i / (chartData.length - 1)) * 220;
      const y = 40 - ((v - minChart) / chartRange) * 36;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,40 ${polyPoints} 220,40`;
  const riskColor =
    (averageSeverity ?? 0) >= 8
      ? "#f87171"
      : (averageSeverity ?? 0) >= 5
      ? "#ffd740"
      : "#00ff88";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#050810",
        padding: "6px 8px",
        fontFamily: "'Share Tech Mono', monospace",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 9, color: isLoading ? "#ffd740" : "#00ff88", letterSpacing: 1 }}>
          ◉ {isLoading ? "SCANNING..." : "LIVE TRADING"}
        </span>
        <span style={{ fontSize: 9, color: "#334155" }}>
          {new Date().toLocaleTimeString("th-TH")}
        </span>
        <span
          style={{
            fontSize: 9,
            color: riskColor,
            background: "#0d2035",
            padding: "1px 6px",
            borderRadius: 3,
            border: `1px solid ${riskColor}`,
          }}
        >
          RISK: {averageSeverity ? averageSeverity.toFixed(1) : "---"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
        {[
          { label: "BALANCE", value: balance.toFixed(2), color: "#00ff88" },
          { label: "COST", value: cost.toFixed(2), color: "#38bdf8" },
          {
            label: "P&L",
            value: `${pnl >= 0 ? "+" : ""}${pnl} (${pnlPct}%)`,
            color: pnl >= 0 ? "#4ade80" : "#f87171",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#0a0e1a",
              border: `1px solid ${s.color}33`,
              borderRadius: 4,
              padding: "3px 6px",
            }}
          >
            <div style={{ fontSize: 7, color: "#334155", marginBottom: 1 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#070b14",
          border: "1px solid #1e293b",
          borderRadius: 4,
          padding: "4px 6px",
          position: "relative",
        }}
      >
        <div style={{ fontSize: 7, color: "#334155", marginBottom: 2 }}>
          PORTFOLIO VALUE ▸ 30s (CLICK TO VIEW FULL NEWS)
        </div>
        <svg width="100%" height="42" viewBox="0 0 220 44" preserveAspectRatio="none">
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="0" y1={i * 11} x2="220" y2={i * 11}
              stroke="#1e293b" strokeWidth="0.5"
            />
          ))}
          <polygon points={areaPoints} fill="#00ff8812" />
          <polyline
            points={polyPoints}
            fill="none"
            stroke="#00ff88"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle
            cx={(chartData.length - 1) / (chartData.length - 1) * 220}
            cy={40 - ((chartData[chartData.length - 1] - minChart) / chartRange) * 36}
            r="2.5"
            fill="#00ff88"
          />
        </svg>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1.5fr",
            fontSize: 7,
            color: "#334155",
            padding: "0 2px 2px",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <span>SYMBOL</span>
          <span style={{ textAlign: "right" }}>PRICE</span>
          <span style={{ textAlign: "right" }}>CHG%</span>
        </div>
        {trades.map((tr) => (
          <div
            key={tr.symbol}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1.5fr",
              fontSize: 8,
              padding: "2px 2px",
              borderBottom: "1px solid #0f1520",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#94a3b8" }}>{tr.symbol}</span>
            <span style={{ textAlign: "right", color: "#e2e8f0" }}>
              {tr.price < 1 ? tr.price.toFixed(4) : tr.price < 100 ? tr.price.toFixed(2) : tr.price.toLocaleString()}
            </span>
            <span
              style={{
                textAlign: "right",
                color: tr.change >= 0 ? "#4ade80" : "#f87171",
                fontWeight: 600,
              }}
            >
              {tr.change >= 0 ? "▲" : "▼"}{Math.abs(tr.change).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          overflow: "hidden",
          fontSize: 7,
          color: "#38bdf8",
          borderTop: "1px solid #1e293b",
          paddingTop: 2,
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            display: "inline-block",
            animation: "marquee 12s linear infinite",
          }}
        >
          {trades.map((t) => `${t.symbol}: ${t.price < 1 ? t.price.toFixed(4) : t.price.toFixed(2)}  `).join("  ◆  ")}
        </span>
      </div>
    </div>
  );
}

// ─── Room Background (pure CSS pixel art) ─────────────────────────────────────
function RoomBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "62%",
          background: "#131828",
        }}
      />
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i * 12,
            left: 0,
            right: 0,
            height: 1,
            background: i % 4 === 0 ? "#1a2035" : "transparent",
            opacity: 0.5,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          background: "#1a1008",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40%",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,180,60,0.07) 0px, rgba(255,180,60,0.07) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(255,180,60,0.07) 0px, rgba(255,180,60,0.07) 1px, transparent 1px, transparent 20px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: 0,
          right: 0,
          height: 3,
          background: "#0a0806",
          boxShadow: "0 0 8px #00000088",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "#00ffe0",
          opacity: 0.6,
          boxShadow: "0 0 12px #00ffe0, 0 0 24px #00ffe066",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: "38%",
          left: 0,
          width: 2,
          background: "#ff00ff",
          opacity: 0.5,
          boxShadow: "0 0 10px #ff00ff",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: "38%",
          right: 0,
          width: 2,
          background: "#00ffe0",
          opacity: 0.5,
          boxShadow: "0 0 10px #00ffe0",
        }}
      />
    </div>
  );
}

function CityWindow({ style }: { style?: React.CSSProperties }) {
  const [stars] = useState(() =>
    Array.from({ length: 18 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 40,
      delay: Math.random() * 3,
    }))
  );
  const buildings = [
    { x: 0, w: 22, h: 55, lit: [10, 30, 48] },
    { x: 18, w: 14, h: 72, lit: [8, 24, 40, 60] },
    { x: 28, w: 18, h: 48, lit: [15, 32] },
    { x: 42, w: 12, h: 65, lit: [10, 28, 44] },
    { x: 50, w: 20, h: 42, lit: [20, 35] },
    { x: 66, w: 16, h: 58, lit: [12, 30, 48] },
    { x: 78, w: 14, h: 50, lit: [16, 36] },
    { x: 88, w: 12, h: 68, lit: [8, 26, 44, 58] },
  ];

  return (
    <div
      style={{
        position: "absolute",
        background: "#040a18",
        border: "3px solid #1a3050",
        borderRadius: 4,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, #020610 0%, #041030 60%, #061840 100%)",
        }}
      />
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 1.5,
            height: 1.5,
            background: "#ffffff",
            borderRadius: "50%",
            animation: `starTwinkle 2s ${s.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
        viewBox="0 0 100 80"
        preserveAspectRatio="none"
        width="100%"
        height="80%"
      >
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={80 - b.h} width={b.w} height={b.h} fill="#0d1a2a" />
            <rect x={b.x} y={80 - b.h} width={b.w} height={1} fill="#1a3050" />
            {b.lit.map((ly, j) => (
              <rect
                key={j}
                x={b.x + 2}
                y={80 - b.h + ly}
                width={Math.floor(b.w * 0.5)}
                height={4}
                fill="#ffe566"
                opacity={0.7 + Math.random() * 0.3}
              />
            ))}
          </g>
        ))}
        <rect x="0" y="78" width="100" height="2" fill="#1a3050" opacity="0.8" />
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 2,
          background: "#1a3050",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 2,
          background: "#1a3050",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 8,
          background: "linear-gradient(to top, #0a2040, transparent)",
        }}
      />
    </div>
  );
}

function TradingDesk({ 
  x, 
  y, 
  onNewsClick, 
  averageSeverity, 
  isLoading 
}: { 
  x: number; 
  y: number;
  onNewsClick: () => void;
  averageSeverity?: number;
  isLoading?: boolean;
}) {
  return (
    <div style={{ position: "absolute", left: x, bottom: y, zIndex: 5 }}>
      <div
        onClick={onNewsClick}
        style={{
          position: "absolute",
          left: 8,
          bottom: 42,
          width: 220,
          height: 175,
          background: "#050810",
          border: "2px solid #1a3050",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 0 20px #00ff8822, 0 0 40px #00ff8811",
          zIndex: 6,
          cursor: "pointer",
          transition: "transform 0.1s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <TradingDashboard averageSeverity={averageSeverity} isLoading={isLoading} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 105,
          bottom: 30,
          width: 14,
          height: 14,
          background: "#1a2a3a",
          borderLeft: "2px solid #0a1a2a",
          zIndex: 6,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -40,
          bottom: 0,
          width: 320,
          height: 32,
          background: "#6b3a1f",
          border: "2px solid #4a2510",
          borderRadius: "2px",
          boxShadow: "0 4px 0 #2a1008",
        }}
      >
        {[6, 12, 18, 24].map((ly) => (
          <div
            key={ly}
            style={{
              position: "absolute",
              top: ly,
              left: 0,
              right: 0,
              height: 1,
              background: "#5a3015",
              opacity: 0.5,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            right: 14,
            top: 2,
            width: 16,
            height: 20,
            background: "#e8e8e8",
            border: "2px solid #cccccc",
            borderRadius: "0 0 3px 3px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 8,
              height: 6,
              background: "#3a1a08",
              borderRadius: 1,
              marginTop: 4,
            }}
          />
        </div>
      </div>
      {[20, 240].map((lx) => (
        <div
          key={lx}
          style={{
            position: "absolute",
            left: lx,
            bottom: -28,
            width: 10,
            height: 30,
            background: "#4a2510",
          }}
        />
      ))}
    </div>
  );
}

function PlantProp({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: "absolute", left: x, bottom: y, zIndex: 4 }}>
      <div style={{ position: "relative", width: 36, height: 50 }}>
        <div
          style={{
            position: "absolute",
            left: 16,
            top: 20,
            width: 4,
            height: 20,
            background: "#2a6a30",
          }}
        />
        {[
          { l: 2, t: 8, w: 14, h: 8, rotate: -20, color: "#3a8a40" },
          { l: 18, t: 4, w: 14, h: 8, rotate: 20, color: "#2a6a30" },
          { l: 0, t: 16, w: 12, h: 7, rotate: -30, color: "#4aaa50" },
          { l: 22, t: 14, w: 12, h: 7, rotate: 30, color: "#3a8a40" },
          { l: 8, t: 0, w: 18, h: 10, rotate: 0, color: "#4aaa50" },
        ].map((leaf, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: leaf.l,
              top: leaf.t,
              width: leaf.w,
              height: leaf.h,
              background: leaf.color,
              borderRadius: "50%",
              transform: `rotate(${leaf.rotate}deg)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 6,
            width: 24,
            height: 20,
            background: "#7a4a28",
            borderRadius: "0 0 4px 4px",
            borderTop: "3px solid #5a3418",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 18,
            left: 4,
            width: 28,
            height: 5,
            background: "#5a3418",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

function ShelfProp({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: "absolute", left: x, bottom: y, zIndex: 3 }}>
      <div style={{ position: "relative", width: 80, height: 120 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#1e2a38",
            border: "2px solid #2a3a4a",
            borderRadius: 3,
          }}
        />
        {[90, 58, 26].map((top, si) => (
          <div key={si}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top,
                width: "100%",
                height: 5,
                background: "#3a4a5a",
                borderBottom: "2px solid #2a3a4a",
              }}
            />
            {si === 0 && (
              <>
                {[
                  { l: 4, w: 8, h: 22, c: "#c0392b" },
                  { l: 13, w: 6, h: 18, c: "#2980b9" },
                  { l: 20, w: 8, h: 24, c: "#27ae60" },
                  { l: 29, w: 6, h: 20, c: "#8e44ad" },
                ].map((book, bi) => (
                  <div
                    key={bi}
                    style={{
                      position: "absolute",
                      left: book.l,
                      top: top - book.h,
                      width: book.w,
                      height: book.h,
                      background: book.c,
                      border: "1px solid rgba(0,0,0,0.3)",
                    }}
                  />
                ))}
                <div
                  style={{
                    position: "absolute",
                    right: 4,
                    top: top - 18,
                    width: 32,
                    height: 16,
                    background: "#0d1a2a",
                    border: "1px solid #00ffe0",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 5,
                      color: "#00ffe0",
                      fontFamily: "monospace",
                      letterSpacing: 0.5,
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    Tech<br />Innovate
                  </span>
                </div>
              </>
            )}
            {si === 1 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    top: top - 20,
                    width: 16,
                    height: 18,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 12,
                      background: "#f0c040",
                      borderRadius: "4px 4px 0 0",
                      border: "1px solid #c09020",
                    }}
                  />
                  <div style={{ width: 6, height: 3, background: "#c09020" }} />
                  <div style={{ width: 14, height: 3, background: "#c09020", borderRadius: 1 }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 6,
                    top: top - 16,
                    width: 12,
                    height: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 8,
                      background: "#3a8a40",
                      borderRadius: "50% 50% 0 0",
                    }}
                  />
                  <div style={{ width: 6, height: 6, background: "#6a3a18", borderRadius: "0 0 2px 2px" }} />
                </div>
              </>
            )}
            {si === 2 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    top: top - 18,
                    width: 22,
                    height: 16,
                    background: "#050810",
                    border: "1px solid #1a3050",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 7, color: "#00ff88" }}>📈</div>
                </div>
                {[0, 3, 6].map((dy) => (
                  <div
                    key={dy}
                    style={{
                      position: "absolute",
                      right: 4,
                      top: top - 10 + dy,
                      width: 20,
                      height: 3,
                      background: "#2a4a6a",
                      border: "1px solid #1a3050",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Particles() {
  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      speed: 0.3 + Math.random() * 0.5,
      color: i % 3 === 0 ? "#00ffe0" : i % 3 === 1 ? "#ff00ff" : "#ffaa00",
      delay: Math.random() * 5,
    }))
  );

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.current.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: "50%",
            opacity: 0.4,
            animation: `floatUp ${p.speed * 10}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Bubble({ text, color, direction = "down" }: { text: string; color: string; direction?: "down" | "left" }) {
  return (
    <div style={{
      position: "relative",
      background: "#0F172A",
      border: `2px solid ${color}`,
      padding: "5px 10px",
      fontSize: "9px",
      color,
      fontFamily: "'Courier New', monospace",
      borderRadius: "3px",
      whiteSpace: "nowrap",
      boxShadow: `0 0 10px ${color}44`,
      letterSpacing: "0.5px",
    }}>
      {text}
      {direction === "down" && (
        <div style={{
          position: "absolute",
          bottom: "-8px",
          left: "16px",
          width: 0, height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `8px solid ${color}`,
        }} />
      )}
    </div>
  );
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export interface OfficeSceneProps {
  geminiState: CharacterState;
  newinvesterState: CharacterState;
  averageSeverity?: number;
  isLoading?: boolean;
}

export default function OfficeScene({
  geminiState,
  newinvesterState,
  averageSeverity,
  isLoading = false,
}: OfficeSceneProps) {
  const [time, setTime] = useState(new Date());
  const router = useRouter();
  const [enterAnimating, setEnterAnimating] = useState(false);

  // Animation frame & walking logic
  const [frame, setFrame] = useState(0);
  const [geminiPos, setGeminiPos] = useState(-400); // Start off-screen left
  const [newPos, setNewPos] = useState(400); // Start off-screen right
  const [geminiAtDesk, setGeminiAtDesk] = useState(false);
  const [newAtDesk, setNewAtDesk] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const animInterval = setInterval(() => {
      setFrame((f) => f + 1);

      setGeminiPos((p) => {
        if (p >= -90) {
          setGeminiAtDesk(true);
          return -90;
        }
        return p + 4;
      });

      setNewPos((p) => {
        if (p <= 40) {
          setNewAtDesk(true);
          return 40;
        }
        return p - 4;
      });
    }, 80);
    return () => clearInterval(animInterval);
  }, []);

  const handleNewsClick = () => {
    setEnterAnimating(true);
    setTimeout(() => {
      router.push("/news");
    }, 350);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Press+Start+2P&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes starTwinkle {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-200px) translateX(20px); opacity: 0; }
        }
        @keyframes neonPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes screenFlicker {
          0%, 96%, 100% { opacity: 1; }
          97% { opacity: 0.8; }
          98% { opacity: 1; }
          99% { opacity: 0.9; }
        }
        @keyframes charBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes fadeToBlack {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Scene container */}
      <div
        style={{
          position: "relative",
          width: "100vw",
          height: "100vh",
          background: "#030610",
          overflow: "hidden",
          imageRendering: "pixelated",
          fontFamily: "'Share Tech Mono', monospace",
        }}
      >
        <Particles />
        <RoomBackground />

        {/* City window */}
        <CityWindow
          style={{
            top: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "28%",
            height: "34%",
          }}
        />

        {/* Secondary small window */}
        <CityWindow
          style={{
            top: "10%",
            right: "6%",
            width: "12%",
            height: "22%",
          }}
        />

        {/* Neon sign on wall */}
        <div
          style={{
            position: "absolute",
            top: "7%",
            left: "6%",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(7px, 1.2vw, 13px)",
            color: "#00ffe0",
            textShadow: "0 0 8px #00ffe0, 0 0 16px #00ffe066",
            letterSpacing: 2,
            animation: "neonPulse 3s ease-in-out infinite",
          }}
        >
          TECH<br />
          <span style={{ color: "#ff00ff", textShadow: "0 0 8px #ff00ff" }}>
            TRADE
          </span>
          <span style={{ color: "#00ffe0" }}> HQ</span>
        </div>

        {/* Clock on wall */}
        <div
          style={{
            position: "absolute",
            top: "5%",
            right: "22%",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "clamp(8px, 1.1vw, 14px)",
            color: "#38bdf8",
            opacity: 0.8,
            letterSpacing: 2,
          }}
        >
          {time.toLocaleTimeString("th-TH")}
        </div>

        {/* Shelf */}
        <div
          style={{
            position: "absolute",
            right: "6%",
            bottom: "38%",
            zIndex: 3,
          }}
        >
          <ShelfProp x={0} y={0} />
        </div>

        {/* Plant left */}
        <div
          style={{
            position: "absolute",
            left: "4%",
            bottom: "38%",
            zIndex: 4,
          }}
        >
          <PlantProp x={0} y={0} />
        </div>

        {/* Plant right (smaller) */}
        <div
          style={{
            position: "absolute",
            left: "15%",
            bottom: "38%",
            transform: "scale(0.7)",
            transformOrigin: "bottom left",
            zIndex: 4,
          }}
        >
          <PlantProp x={0} y={0} />
        </div>

        {/* Trading desk */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "38%",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        >
          <TradingDesk 
            x={0} 
            y={0} 
            onNewsClick={handleNewsClick} 
            averageSeverity={averageSeverity} 
            isLoading={isLoading} 
          />
        </div>

        {/* Character 1: Gemini — Left desk */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "38%",
            marginLeft: geminiPos,
            zIndex: 10,
            transform: "translateY(5px)",
          }}
        >
          <div style={{ position: "absolute", top: -35, left: -20, zIndex: 11 }}>
            {!geminiAtDesk ? (
              <Bubble text="🤖 AI Booting..." color="#60A5FA" />
            ) : isLoading ? (
              <Bubble text="⚡ Processing signals..." color="#22C55E" />
            ) : null}
          </div>
          <CharacterSprite 
            character="gemini" 
            state={geminiState} 
            isWalking={!geminiAtDesk}
            frame={frame}
          />
        </div>

        {/* Character 2: Newinvester — Right desk */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "38%",
            marginLeft: newPos,
            zIndex: 10,
            transform: "translateY(5px)",
          }}
        >
          <div style={{ position: "absolute", top: -35, left: -20, zIndex: 11 }}>
            {!newAtDesk ? (
              <Bubble text="🧑💼 Arriving at work..." color="#F59E0B" />
            ) : newinvesterState === "shocked" ? (
              <Bubble text="🚨 High Risk Detected!" color="#EF4444" />
            ) : null}
          </div>
          <CharacterSprite 
            character="newinvester" 
            state={newinvesterState} 
            isWalking={!newAtDesk}
            frame={frame}
            flip={!newAtDesk} // Flip to walk left!
          />
        </div>

        {/* Floor reflection under desk */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "37%",
            transform: "translateX(-50%)",
            width: 260,
            height: 6,
            background: "radial-gradient(ellipse, rgba(0,255,136,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(2px)",
          }}
        />

        {/* Screen glow on floor */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "37.5%",
            transform: "translateX(-50%)",
            width: 160,
            height: 30,
            background: "radial-gradient(ellipse, rgba(0,80,255,0.07) 0%, transparent 70%)",
            filter: "blur(4px)",
            animation: "screenFlicker 8s ease-in-out infinite",
          }}
        />

        {/* Bottom floor line */}
        <div
          style={{
            position: "absolute",
            bottom: "38%",
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, rgba(0,255,224,0.15) 20%, rgba(0,255,224,0.25) 50%, rgba(0,255,224,0.15) 80%, transparent)",
          }}
        />

        {/* CRT scanline overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
            pointerEvents: "none",
            zIndex: 100,
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
            zIndex: 99,
          }}
        />

        {/* Bottom status bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 28,
            background: "#030610",
            borderTop: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: 20,
            zIndex: 200,
          }}
        >
          <span style={{ fontSize: 9, color: isLoading ? "#ffd740" : "#00ff88" }} className={isLoading ? "animate-text-blink" : ""}>
            ◉ {isLoading ? "LOADING..." : "LIVE"}
          </span>
          <span style={{ fontSize: 9, color: "#334155" }}>
            PIXEL OFFICE SCENE v2.0
          </span>
          <span style={{ fontSize: 9, color: "#334155", marginLeft: "auto" }}>
            {averageSeverity ? `MARKET RISK: ${averageSeverity.toFixed(1)}/10` : "SCANNING MARKET"}
          </span>
          <span style={{ fontSize: 9, color: "#38bdf8" }}>
            [CLICK MONITOR TO OPEN DASHBOARD]
          </span>
        </div>

        {/* Enter animation overlay */}
        {enterAnimating && (
          <div
            className="absolute inset-0 z-[500] bg-black"
            style={{
              animation: "fadeToBlack 0.4s ease-in forwards",
            }}
          />
        )}
      </div>
    </>
  );
}
