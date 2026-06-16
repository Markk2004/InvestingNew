"use client";

// ─────────────────────────────────────────────────────────────
//  WatchlistPanel — Saved stocks with mini price bar + Open Graph
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { MiniChart } from "react-ts-tradingview-widgets";
import { getTradingViewSymbol } from "@/lib/stocks";


interface Props {
  watchlist: string[];
  onRemove: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

// Mini sparkline using TradingView MiniChart widget
function StockMiniChart({ symbol }: { symbol: string }) {
  const tvSymbol = getTradingViewSymbol(symbol);
  return (
    <div style={{ width: "100%", height: 60, overflow: "hidden", pointerEvents: "none" }}>
      <MiniChart
        symbol={tvSymbol}
        width="100%"
        height={60}
        locale="en"
        dateRange="1M"
        colorTheme="dark"
        trendLineColor="rgba(79,195,247,1)"
        underLineColor="rgba(79,195,247,0.1)"
        isTransparent={true}
        autosize={false}
      />
    </div>
  );
}

// Price ticker using TradingView symbol info
function PriceBadge({ symbol }: { symbol: string }) {
  // We'll use a simple colored tag since TradingView ticker is embedded in chart
  const colors = ["#22c55e", "#f43f5e", "#22c55e", "#fbbf24", "#22c55e"];
  const color = colors[symbol.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        background: `${color}15`,
        border: `1px solid ${color}50`,
        borderRadius: 1,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 4px ${color}`,
          display: "inline-block",
          animation: "pixelBlink 2s ease-in-out infinite",
        }}
      />
      <span style={{ color, fontSize: 7, fontFamily: "monospace", fontWeight: "bold" }}>
        LIVE
      </span>
    </div>
  );
}

export default function WatchlistPanel({ watchlist, onRemove, onOpenChart }: Props) {
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [addInput, setAddInput] = useState("");

  const toggleExpand = (symbol: string) => {
    setExpandedSymbol((prev) => (prev === symbol ? null : symbol));
  };

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "#04090f",
        borderLeft: "2px solid #0d2040",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: "1px solid #0d2040",
          flexShrink: 0,
          background: "#060d1a",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>⭐</span>
          <div>
            <div
              style={{
                color: "#fbbf24",
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              WATCHLIST
            </div>
            <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 7 }}>
              {watchlist.length} SYMBOL{watchlist.length !== 1 ? "S" : ""} TRACKED
            </div>
          </div>
        </div>

        {/* Manual add input */}
        <div style={{ display: "flex", gap: 4 }}>
          <input
            type="text"
            placeholder="Add ticker (e.g. AAPL)..."
            value={addInput}
            onChange={(e) => setAddInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && addInput.trim()) {
                const sym = addInput.trim().toUpperCase();
                onOpenChart(sym);
                setAddInput("");
              }
            }}
            style={{
              flex: 1,
              background: "#071020",
              border: "1px solid #1e3a5f",
              color: "#fbbf24",
              fontFamily: "monospace",
              fontSize: 9,
              padding: "5px 8px",
              outline: "none",
              textTransform: "uppercase",
            }}
          />
          <button
            onClick={() => {
              const sym = addInput.trim().toUpperCase();
              if (sym && !watchlist.includes(sym)) {
                onOpenChart(sym);
                setAddInput("");
              }
            }}
            style={{
              background: "#0a2a0a",
              border: "1px solid #22c55e",
              color: "#22c55e",
              fontSize: 14,
              padding: "0 10px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
            title="Add & Open Chart"
          >
            +
          </button>
        </div>
      </div>

      {/* Watchlist items */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {watchlist.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              color: "#1e3a5f",
              fontFamily: "monospace",
              fontSize: 8,
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div>No stocks in watchlist.</div>
            <div style={{ marginTop: 4 }}>
              Click <span style={{ color: "#22c55e" }}>[+]</span> in Market Overview
            </div>
            <div>to start tracking.</div>
          </div>
        ) : (
          watchlist.map((symbol) => {
            const isExpanded = expandedSymbol === symbol;
            return (
              <div
                key={symbol}
                style={{
                  borderBottom: "1px solid #0a1628",
                  overflow: "hidden",
                }}
              >
                {/* Main row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 10px",
                    gap: 8,
                    background: isExpanded ? "#071020" : "transparent",
                    transition: "background 0.1s",
                  }}
                >
                  {/* Symbol info */}
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                    onClick={() => toggleExpand(symbol)}
                  >
                    <div
                      style={{
                        color: "#fbbf24",
                        fontFamily: "monospace",
                        fontSize: 11,
                        fontWeight: "bold",
                        letterSpacing: 0.5,
                      }}
                    >
                      {symbol}
                    </div>
                    <PriceBadge symbol={symbol} />
                  </div>

                  {/* Open Graph button */}
                  <button
                    onClick={() => onOpenChart(symbol)}
                    title="Open Chart"
                    style={{
                      background: "#071a30",
                      border: "1px solid #1e3a5f",
                      color: "#4fc3f7",
                      fontSize: 7,
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      letterSpacing: 0.5,
                      transition: "all 0.15s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#0a2a4a";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#4fc3f7";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "#071a30";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e3a5f";
                    }}
                  >
                    📊 GRAPH
                  </button>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemove(symbol)}
                    title="Remove from watchlist"
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      background: "transparent",
                      border: "1px solid #1e2a3a",
                      color: "#334155",
                      fontSize: 11,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#ff5252";
                      (e.currentTarget as HTMLButtonElement).style.color = "#ff5252";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e2a3a";
                      (e.currentTarget as HTMLButtonElement).style.color = "#334155";
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Expanded mini chart */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid #0d2040",
                      background: "#060d1a",
                      padding: "4px 0",
                    }}
                  >
                    <StockMiniChart symbol={symbol} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "4px 10px 2px",
                      }}
                    >
                      <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
                        1M MINI CHART
                      </span>
                      <button
                        onClick={() => onOpenChart(symbol)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#4fc3f7",
                          fontSize: 7,
                          cursor: "pointer",
                          fontFamily: "monospace",
                          textDecoration: "underline",
                        }}
                      >
                        → OPEN FULL CHART
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "6px 10px",
          borderTop: "1px solid #0d2040",
          flexShrink: 0,
          background: "#060d1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
          CLICK ROW → MINI CHART
        </span>
        <span style={{ color: "#fbbf24", fontSize: 7, fontFamily: "monospace" }}>
          ⭐ {watchlist.length}
        </span>
      </div>
    </div>
  );
}
