"use client";

// ─────────────────────────────────────────────────────────────
//  Header — Pixel Art HUD style game header
//  Shows: title, last-updated timestamp, refresh button, status
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

interface HeaderProps {
  fetchedAt?: string;
  isLoading: boolean;
  hasError: boolean;
  onRefresh: () => void;
}

export default function Header({
  fetchedAt,
  isLoading,
  hasError,
  onRefresh,
}: HeaderProps) {
  const [clicked, setClicked] = useState(false);

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
        background: "rgba(13,13,43,0.95)",
        borderBottom: "2px solid var(--pixel-border)",
        backdropFilter: "blur(8px)",
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

        {/* ── Center: Timestamp ─────────────────────────── */}
        <div
          className="hidden md:flex flex-col items-center gap-1 font-pixel"
          style={{ fontSize: "7px" }}
        >
          <span style={{ color: "#475569" }}>LAST UPDATE</span>
          <span style={{ color: formattedTime ? "var(--pixel-blue)" : "#475569" }}>
            {formattedTime ? `${formattedTime} (ICT)` : "---"}
          </span>
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
            style={{
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
        </div>
      </div>
    </header>
  );
}
