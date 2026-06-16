"use client";

// ─────────────────────────────────────────────────────────────
//  MarketOverviewPanel — US Stock List with Add to Watchlist
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { StockInfo, US_STOCKS } from "@/lib/stocks";
export type { StockInfo };

const SECTORS = ["All", ...Array.from(new Set(US_STOCKS.map((s) => s.sector)))];

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#4fc3f7",
  Consumer:   "#fbbf24",
  Finance:    "#22c55e",
  Healthcare: "#f43f5e",
  Energy:     "#fb923c",
  Media:      "#a78bfa",
  ETF:        "#6ee7b7",
};

interface Props {
  watchlist: string[];
  onAddToWatchlist: (symbol: string) => void;
  onOpenChart: (symbol: string) => void;
}

export default function MarketOverviewPanel({ watchlist, onAddToWatchlist, onOpenChart }: Props) {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");

  const filtered = useMemo(() => {
    return US_STOCKS.filter((s) => {
      const matchSector = sector === "All" || s.sector === sector;
      const matchSearch =
        s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase());
      return matchSector && matchSearch;
    });
  }, [search, sector]);

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "#04090f",
        borderRight: "2px solid #0d2040",
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
          <span style={{ fontSize: 14 }}>🇺🇸</span>
          <div>
            <div style={{ color: "#4fc3f7", fontFamily: "monospace", fontSize: 10, fontWeight: "bold", letterSpacing: 1 }}>
              MARKET OVERVIEW
            </div>
            <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 7 }}>
              US EQUITIES · {US_STOCKS.length} SYMBOLS
            </div>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search symbol or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#071020",
            border: "1px solid #1e3a5f",
            color: "#93c5fd",
            fontFamily: "monospace",
            fontSize: 9,
            padding: "5px 8px",
            outline: "none",
            marginBottom: 6,
          }}
        />

        {/* Sector filter */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              style={{
                padding: "2px 7px",
                fontSize: 7,
                fontFamily: "monospace",
                cursor: "pointer",
                border: `1px solid ${sector === s ? (SECTOR_COLORS[s] || "#4fc3f7") : "#1e3a5f"}`,
                background: sector === s ? `${(SECTOR_COLORS[s] || "#4fc3f7")}15` : "transparent",
                color: sector === s ? (SECTOR_COLORS[s] || "#4fc3f7") : "#475569",
                transition: "all 0.15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stock List */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 20, color: "#1e3a5f", fontFamily: "monospace", fontSize: 9, textAlign: "center" }}>
            No results found
          </div>
        ) : (
          filtered.map((stock) => {
            const inWatchlist = watchlist.includes(stock.symbol);
            const sectorColor = SECTOR_COLORS[stock.sector] || "#4fc3f7";

            return (
              <div
                key={stock.symbol}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 10px",
                  borderBottom: "1px solid #0a1628",
                  gap: 8,
                  transition: "background 0.1s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "#071020")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                }
              >
                {/* Sector dot */}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: sectorColor,
                    flexShrink: 0,
                    boxShadow: `0 0 4px ${sectorColor}80`,
                  }}
                />

                {/* Symbol & Name */}
                <div
                  style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  onClick={() => onOpenChart(stock.symbol)}
                  title={`Open chart: ${stock.symbol}`}
                >
                  <div
                    style={{
                      color: "#93c5fd",
                      fontFamily: "monospace",
                      fontSize: 10,
                      fontWeight: "bold",
                      letterSpacing: 0.5,
                    }}
                  >
                    {stock.symbol}
                    <span style={{ color: "#1e3a5f", fontSize: 7, marginLeft: 4, fontWeight: "normal" }}>
                      {stock.exchange}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#334155",
                      fontSize: 7,
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stock.name}
                  </div>
                </div>

                {/* Add to Watchlist button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!inWatchlist) onAddToWatchlist(stock.symbol);
                  }}
                  title={inWatchlist ? "Already in watchlist" : "Add to watchlist"}
                  style={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    background: inWatchlist ? "#0a2a0a" : "#071020",
                    border: `1px solid ${inWatchlist ? "#22c55e" : "#1e3a5f"}`,
                    color: inWatchlist ? "#22c55e" : "#475569",
                    fontSize: 12,
                    cursor: inWatchlist ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!inWatchlist) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#22c55e";
                      (e.currentTarget as HTMLButtonElement).style.color = "#22c55e";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!inWatchlist) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e3a5f";
                      (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                    }
                  }}
                >
                  {inWatchlist ? "✓" : "+"}
                </button>
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
        }}
      >
        <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
          {filtered.length} of {US_STOCKS.length}
        </span>
        <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
          CLICK NAME → CHART
        </span>
      </div>
    </div>
  );
}
