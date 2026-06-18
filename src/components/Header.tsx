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
        background: "var(--color-bg-header-toast)",
        borderBottom: "2px solid var(--color-border-subtle)",
        backdropFilter: "blur(8px)",
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
        <div className="hidden md:flex flex-col items-center gap-2 font-pixel" style={{ fontSize: "7px" }}>
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <span style={{ color: "#475569" }}>LAST UPDATE</span>
              <span style={{ color: formattedTime ? "var(--pixel-blue)" : "#475569" }}>
                {formattedTime ? `${formattedTime} (ICT)` : "---"}
              </span>
            </div>
            
            {/* Token Usage Status Line */}
            {usage && (
              <div 
                className="flex flex-col items-center gap-1 px-2 border-l border-[#1e293b]"
                title={`Prompt: ${usage.prompt_tokens} | Completion: ${usage.completion_tokens}`}
              >
                <span style={{ color: "#475569" }}>AI ENGINE ({usage.model})</span>
                <span style={{ color: usage.cost > 0.1 ? "var(--pixel-yellow)" : "var(--pixel-green)" }}>
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
            className="font-pixel flex items-center gap-1.5 px-2 py-1"
            style={{
              fontSize: "7px",
              border: `1px solid ${statusColor}`,
              background: `${statusColor}10`,
            }}
          >
            <span
              className={isLoading ? "animate-text-blink" : ""}
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: 0,
                background: statusColor,
              }}
            />
            <span style={{ color: statusColor }}>{statusText}</span>
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
