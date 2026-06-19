"use client";

// ─────────────────────────────────────────────────────────────
//  MarketGauge — Pixel Art version
//  Replaces semicircle chart with a retro 8-bit vertical
//  health-bar / RPG-style progress gauge.
// ─────────────────────────────────────────────────────────────

import { useTheme } from "./ThemeProvider";

interface MarketGaugeProps {
  averageSeverity: number;
  articleCount: number;
}

const GAUGE_LEVELS = [
  { min: 0,   max: 3,  label: "SAFE",      color: "var(--pixel-green)",  bg: "rgba(105,255,71,0.08)" },
  { min: 3,   max: 6,  label: "CAUTION",   color: "var(--pixel-yellow)", bg: "rgba(255,215,64,0.08)" },
  { min: 6,   max: 8,  label: "DANGER",    color: "var(--pixel-orange)", bg: "rgba(255,171,64,0.1)"  },
  { min: 8,   max: 10, label: "CRITICAL!", color: "var(--pixel-red)",    bg: "rgba(255,82,82,0.12)"  },
];

function getGaugeLevel(score: number) {
  return (
    GAUGE_LEVELS.find((l) => score >= l.min && score < l.max) ??
    GAUGE_LEVELS[GAUGE_LEVELS.length - 1]
  );
}

const SEGMENT_COUNT = 10;

export default function MarketGauge({
  averageSeverity,
  articleCount,
}: MarketGaugeProps) {
  const { theme } = useTheme();
  const score = Math.min(10, Math.max(0, averageSeverity));
  const level = getGaugeLevel(score);
  const filledSegments = Math.round(score);
  const isCrimson = theme === "crimson";

  const segmentColor = (i: number): string => {
    if (i >= filledSegments) return "rgba(58,58,110,0.4)";
    // Color ramp: green → yellow → orange → red
    if (i < 3) return "var(--pixel-green)";
    if (i < 6) return "var(--pixel-yellow)";
    if (i < 8) return "var(--pixel-orange)";
    return "var(--pixel-red)";
  };

  return (
    <div
      className="market-risk-card flex flex-col gap-3 p-4 h-full"
      style={{
        border: `2px solid ${level.color}`,
        background: level.bg,
        boxShadow: `0 0 20px ${level.color}30`,
        minHeight: "180px",
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className="font-pixel"
          style={{ fontSize: "8px", color: level.color }}
        >
          MARKET RISK
        </h2>
        <span
          className="font-pixel px-2 py-0.5"
          style={{
            fontSize: "6px",
            border: `1px solid ${level.color}`,
            color: level.color,
            background: `${level.color}15`,
          }}
        >
          {level.label}
        </span>
      </div>

      {/* Score Display */}
      <div className="text-center">
        <div
          className="font-pixel"
          style={{
            fontSize: "36px",
            color: level.color,
            textShadow: `0 0 15px ${level.color}`,
            lineHeight: 1,
          }}
        >
          {score.toFixed(1)}
        </div>
        <div
          className="font-pixel mt-1"
          style={{ fontSize: "7px", color: "#475569" }}
        >
          / 10.0 AVG SEVERITY
        </div>
      </div>

      {/* Pixel Progress Bar */}
      <div className="flex flex-col gap-1">
        <div
          className="font-pixel mb-1"
          style={{ fontSize: "6px", color: "#475569" }}
        >
          THREAT LEVEL
        </div>
        {isCrimson ? (
          <div className="relative mt-1">
            <div
              className="w-full bg-slate-950/40 rounded-full border border-white/10 overflow-hidden"
              style={{ height: "10px" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${score * 10}%`,
                  background: `linear-gradient(90deg, ${level.color}dd, ${level.color})`,
                  boxShadow: `0 0 8px ${level.color}`,
                }}
              />
            </div>
            {/* Subtle glow underneath */}
            <div
              className="absolute -bottom-1 left-0 right-0 h-2 blur-md rounded-full pointer-events-none opacity-40 transition-all duration-500"
              style={{
                background: level.color,
              }}
            />
          </div>
        ) : (
          <div className="flex gap-1">
            {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "20px",
                  background: segmentColor(i),
                  border: `1px solid ${i < filledSegments ? segmentColor(i) : "rgba(58,58,110,0.6)"}`,
                  boxShadow: i < filledSegments ? `0 0 4px ${segmentColor(i)}` : "none",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
        {/* Scale labels */}
        <div className="flex justify-between mt-1">
          {["0", "5", "10"].map((n) => (
            <span
              key={n}
              className="font-pixel"
              style={{ fontSize: "6px", color: "#334155" }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Article count */}
      <div
        className="flex justify-between items-center font-pixel pt-3"
        style={{
          borderTop: `1px solid var(--pixel-border)`,
          fontSize: "7px",
        }}
      >
        <span style={{ color: "#475569" }}>NEWS ANALYZED</span>
        <span style={{ color: "var(--pixel-blue)" }}>{articleCount} items</span>
      </div>
    </div>
  );
}
