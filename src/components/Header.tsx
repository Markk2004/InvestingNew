"use client";

// ─────────────────────────────────────────────────────────────
//  Header — Pixel Art HUD style game header
//  Shows: title, last-updated timestamp, refresh button, status
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import type { NewsApiResponse } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

interface HeaderProps {
  fetchedAt?: string;
  isLoading: boolean;
  hasError: boolean;
  onRefresh: () => void;
  usage?: NewsApiResponse["usage"];
}

export default function Header({
  fetchedAt,
  isLoading,
  hasError,
  onRefresh,
  usage,
}: HeaderProps) {
  const [clicked, setClicked] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isCrimson = theme === "crimson";

  const handleRefreshClick = useCallback(() => {
    if (isLoading) return;
    setClicked(true);
    onRefresh();
    setTimeout(() => setClicked(false), 600);
  }, [isLoading, onRefresh]);

  const formattedTime = fetchedAt
    ? new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
      }).format(new Date(fetchedAt))
    : null;

  const statusColor = hasError
    ? "var(--pixel-red)"
    : isLoading
    ? "var(--pixel-yellow)"
    : "var(--pixel-green)";

  const statusText = hasError ? "ERROR" : isLoading ? "LOADING" : "LIVE";

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "linear-gradient(180deg, rgba(40, 40, 45, 0.65) 0%, rgba(10, 10, 15, 0.95) 100%), radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 15px 35px rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(12px)",
        transition: "var(--transition)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* ── Left: Title + subtitle ─────────────────────── */}
        <div className="flex flex-col gap-1 min-w-0">
          <h1
            className="font-pixel leading-tight truncate"
            style={{ fontSize: "10px", color: "var(--pixel-blue)" }}
          >
            InvestingNew
          </h1>
          <p
            className="font-pixel hidden sm:block"
            style={{ fontSize: "6px", color: "#475569", letterSpacing: "0.05em" }}
          >
            AI MARKET INTELLIGENCE — GEMINI 2.5
          </p>
        </div>

        {/* ── Center: Timestamp & Token Usage ─────────────────────────── */}
        <div className="hidden md:flex flex-col items-center gap-1 font-mono" style={{ fontSize: "11px", letterSpacing: "1px" }}>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-0.5">
              <span style={{ color: "#64748b", fontSize: "9px" }}>LAST UPDATE</span>
              <span style={{ color: formattedTime ? "var(--color-accent-primary)" : "#475569", fontWeight: "bold" }}>
                {formattedTime ? `${formattedTime} (ICT)` : "---"}
              </span>
            </div>
            
            {/* Token Usage Status Line */}
            {usage && (
              <div 
                className="flex flex-col items-center gap-0.5 px-3 border-l border-[#1e293b]"
                title={`Prompt: ${usage.prompt_tokens} | Completion: ${usage.completion_tokens}`}
              >
                <span style={{ color: "#64748b", fontSize: "9px" }}>AI ENGINE ({usage.model})</span>
                <span style={{ color: usage.cost > 0.1 ? "#fbbf24" : "#4ade80", fontWeight: "bold" }}>
                  ${usage.cost.toFixed(4)} / {usage.total_tokens.toLocaleString()} TKNS
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Status + Refresh button ───────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* Status badge */}
          <div
            className="font-mono flex items-center gap-2"
            style={isCrimson ? {
              fontSize: "10px",
              padding: "6px 14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 12px rgba(255, 0, 60, 0.25)",
              color: "#f1f5f9",
              borderRadius: "6px",
              letterSpacing: "1px",
              fontWeight: "bold",
            } : {
              fontSize: "10px",
              padding: "4px 10px",
              border: `1px solid ${statusColor}`,
              background: `${statusColor}10`,
              letterSpacing: "1px",
              fontWeight: "bold",
            }}
          >
            <span
              className={isLoading ? "animate-text-blink" : ""}
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}`,
              }}
            />
            <span style={isCrimson ? {} : { color: statusColor }}>
              {isCrimson ? `[ ${statusText} ]` : statusText}
            </span>
          </div>

          {/* Refresh button */}
          <button
            id="header-refresh-btn"
            onClick={handleRefreshClick}
            disabled={isLoading}
            aria-label="รีเฟรชข้อมูล"
            className="font-pixel transition-transform active:scale-90 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={isCrimson ? {
              fontSize: "7px",
              padding: "6px 12px",
              background: clicked ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 12px rgba(255, 0, 60, 0.25)",
              color: "#cbd5e1",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            } : {
              fontSize: "7px",
              padding: "6px 12px",
              background: clicked ? "var(--pixel-blue)" : "transparent",
              border: "2px solid var(--pixel-blue)",
              color: clicked ? "var(--pixel-dark)" : "var(--pixel-blue)",
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: "0 0 8px rgba(79,195,247,0.3)",
              transition: "all 0.15s ease",
            }}
          >
            {isLoading ? "SCANNING..." : "[ REFRESH ]"}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="font-pixel transition-transform active:scale-90 hover:scale-105"
            style={isCrimson ? {
              fontSize: "7px",
              padding: "6px 12px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 12px rgba(255, 0, 60, 0.25)",
              color: "#cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            } : {
              fontSize: "7px",
              padding: "6px 12px",
              background: "transparent",
              border: "2px solid var(--color-accent-primary)",
              color: "var(--color-accent-primary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {isCrimson ? "[ 🔴 CRIMSON ]" : "[ 🎮 NORMAL ]"}
          </button>
        </div>
      </div>
    </header>
  );
}
