"use client";

// ─────────────────────────────────────────────────────────────
//  USMarketListPanel.tsx — US Stock list with live prices,
//  sparklines, sorting, pagination, and add-to-watchlist
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { US_STOCKS, type StockInfo } from "@/lib/stocks";
import { useWatchlist } from "@/lib/useWatchlist";
import Sparkline, { generateMockCloses } from "./Sparkline";
import { useTheme } from "@/components/ThemeProvider";

const PAGE_SIZE = 25;

const SECTOR_COLORS: Record<string, string> = {
  "Information Technology": "#4fc3f7",
  "Communication Services": "#a78bfa",
  "Consumer Discretionary": "#fbbf24",
  "Consumer Staples": "#cbd5e1",
  "Financials": "#22c55e",
  "Healthcare": "#f43f5e",
  "Energy": "#fb923c",
  "Industrials": "#a7f3d0",
  "Utilities": "#a3e635",
  "Materials": "#f472b6",
  "Real Estate": "#f472b6",
  "Index / ETF": "#6ee7b7",
};

const SECTORS = ["All", ...Array.from(new Set(US_STOCKS.map((s) => s.sector)))];

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

type SortKey = "symbol" | "price" | "changePercent";
type SortDir = "asc" | "desc";

export default function USMarketListPanel() {
  const router = useRouter();
  const { add, has } = useWatchlist();
  const { theme } = useTheme();
  const isCrimson = theme === "crimson";

  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("changePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Mock sparklines per symbol (deterministic)
  const sparklineData = useMemo(() => {
    const map: Record<string, number[]> = {};
    US_STOCKS.forEach((s) => {
      map[s.symbol] = generateMockCloses(s.symbol, 20);
    });
    return map;
  }, []);

  // Fetch live quotes in batches
  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = US_STOCKS.map((s) => s.symbol).join(",");
      const res = await fetch(`/api/ticker?symbols=${encodeURIComponent(symbols)}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data: Quote[] = await res.json();
      if (Array.isArray(data)) {
        const map: Record<string, Quote> = {};
        data.forEach((q) => { map[q.symbol] = q; });
        setQuotes(map);
      }
    } catch (err) {
      console.error("[USMarketListPanel] Failed to fetch quotes:", err);
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  // Filter
  const filtered = useMemo(() => {
    return US_STOCKS.filter((s) => {
      const matchSector = sector === "All" || s.sector === sector;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q);
      return matchSector && matchSearch;
    });
  }, [search, sector]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === "symbol") {
        return sortDir === "asc"
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      }
      if (sortKey === "price") {
        av = quotes[a.symbol]?.price ?? 0;
        bv = quotes[b.symbol]?.price ?? 0;
      } else if (sortKey === "changePercent") {
        av = quotes[a.symbol]?.changePercent ?? 0;
        bv = quotes[b.symbol]?.changePercent ?? 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [filtered, sortKey, sortDir, quotes]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleSectorChange = (s: string) => {
    setSector(s);
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span style={{ color: "#1e3a5f" }}>⇅</span>;
    return (
      <span style={{ color: "#4fc3f7" }}>
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div
      className={isCrimson ? "card" : ""}
      style={{
        background: isCrimson ? "var(--color-bg-card)" : "#04090f",
        border: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #0d2040",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #0d2040",
          background: isCrimson ? "transparent" : "linear-gradient(90deg, #060d1a 0%, #04090f 100%)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🇺🇸</span>
            <div>
              <div style={{ color: "#4fc3f7", fontFamily: "monospace", fontSize: 12, fontWeight: "bold", letterSpacing: 1.5 }}>
                US MARKET LIST
              </div>
              <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 9 }}>
                {US_STOCKS.length} SYMBOLS · LIVE PRICES
              </div>
            </div>
          </div>
          {loadingQuotes && (
            <span style={{ color: "#fbbf24", fontSize: 9, fontFamily: "monospace" }}>
              ⏳ FETCHING PRICES…
            </span>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search symbol or name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            width: "100%",
            background: isCrimson ? "transparent" : "#071020",
            border: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #1e3a5f",
            color: isCrimson ? "var(--color-text-title)" : "#93c5fd",
            fontFamily: "monospace",
            fontSize: 11,
            padding: "6px 10px",
            outline: "none",
            marginBottom: 8,
            boxSizing: "border-box",
          }}
        />

        {/* Sector filter */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {SECTORS.map((s) => {
            const color = SECTOR_COLORS[s] || "#4fc3f7";
            const active = sector === s;
            return (
              <button
                key={s}
                onClick={() => handleSectorChange(s)}
                style={{
                  padding: "3px 8px",
                  fontSize: 9,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  border: `1px solid ${active ? color : "#1e3a5f"}`,
                  background: active ? `${color}18` : "transparent",
                  color: active ? color : "#475569",
                  transition: "all 0.12s",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "14px 110px 1fr 100px 90px 90px 80px",
          gap: 0,
          padding: "8px 12px",
          borderBottom: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #0d2040",
          background: isCrimson ? "transparent" : "#060d1a",
          flexShrink: 0,
          alignItems: "center",
        }}
      >
        <div />
        <div
          onClick={() => handleSort("symbol")}
          style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", cursor: "pointer", letterSpacing: 0.5, userSelect: "none", display: "flex", gap: 2 }}
        >
          SYM <SortIcon k="symbol" />
        </div>
        <div style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", letterSpacing: 0.5 }}>NAME</div>
        <div style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", letterSpacing: 0.5, textAlign: "center" }}>TREND</div>
        <div
          onClick={() => handleSort("price")}
          style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", cursor: "pointer", textAlign: "right", letterSpacing: 0.5, userSelect: "none", display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          PRICE <SortIcon k="price" />
        </div>
        <div
          onClick={() => handleSort("changePercent")}
          style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", cursor: "pointer", textAlign: "right", letterSpacing: 0.5, userSelect: "none", display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          CHG% <SortIcon k="changePercent" />
        </div>
        <div style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", textAlign: "center", letterSpacing: 0.5 }}>ADD</div>
      </div>

      {/* Stock Rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {pageItems.length === 0 ? (
          <div style={{ padding: 24, color: "#1e3a5f", fontFamily: "monospace", fontSize: 11, textAlign: "center" }}>
            No results
          </div>
        ) : (
          pageItems.map((stock) => {
            const q = quotes[stock.symbol];
            const inWL = has(stock.symbol);
            const sectorColor = SECTOR_COLORS[stock.sector] || "#4fc3f7";
            const pct = q?.changePercent ?? 0;
            const price = q?.price;
            const isUp = pct >= 0;
            const pctColor = isUp ? "#22c55e" : "#ef4444";
            const sparkCloses = sparklineData[stock.symbol] ?? [];

            return (
              <div
                key={stock.symbol}
                style={{
                  display: "grid",
                  gridTemplateColumns: "14px 110px 1fr 100px 90px 90px 80px",
                  gap: 0,
                  alignItems: "center",
                  padding: "8px 12px",
                  borderBottom: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #080f1a",
                  transition: "background 0.08s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isCrimson ? "rgba(255, 0, 60, 0.05)" : "#071020")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Sector dot */}
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: sectorColor,
                    boxShadow: `0 0 3px ${sectorColor}80`,
                  }}
                />

                {/* Symbol (clickable → open chart) */}
                <div
                  onClick={() => router.push(`/charts?open=${stock.symbol}`)}
                  style={{
                    color: "#93c5fd",
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                    letterSpacing: 0.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={`Open chart: ${stock.symbol}`}
                >
                  {stock.symbol}
                </div>

                {/* Name */}
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: 11,
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    paddingRight: 4,
                  }}
                  title={stock.name}
                >
                  {stock.name}
                </div>

                {/* Sparkline */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Sparkline closes={sparkCloses} width={80} height={26} />
                </div>

                {/* Price */}
                <div
                  style={{
                    color: price != null ? "#cbd5e1" : "#1e3a5f",
                    fontFamily: "monospace",
                    fontSize: 12,
                    textAlign: "right",
                  }}
                >
                  {price != null ? `$${price.toFixed(2)}` : "---"}
                </div>

                {/* Change% */}
                <div
                  style={{
                    color: q ? pctColor : "#1e3a5f",
                    fontFamily: "monospace",
                    fontSize: 12,
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {q ? `${isUp ? "+" : ""}${pct.toFixed(2)}%` : "---"}
                </div>

                {/* ADD button */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => { if (!inWL) add(stock.symbol); }}
                    disabled={inWL}
                    title={inWL ? "Already in watchlist" : "Add to watchlist"}
                    style={{
                      padding: "3px 8px",
                      fontSize: 9,
                      fontFamily: "monospace",
                      cursor: inWL ? "default" : "pointer",
                      border: `1px solid ${inWL ? "#166534" : "#1e3a5f"}`,
                      background: inWL ? "#0a2a0a" : "#071020",
                      color: inWL ? "#22c55e" : "#475569",
                      transition: "all 0.12s",
                      letterSpacing: 0.3,
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (!inWL) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#22c55e";
                        (e.currentTarget as HTMLButtonElement).style.color = "#22c55e";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!inWL) {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e3a5f";
                        (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                      }
                    }}
                  >
                    {inWL ? "✓ Added" : "+ ADD"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderTop: isCrimson ? "1px solid var(--color-border-subtle)" : "1px solid #0d2040",
          background: isCrimson ? "transparent" : "#060d1a",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#1e3a5f", fontSize: 10, fontFamily: "monospace" }}>
          {sorted.length} result{sorted.length !== 1 ? "s" : ""} · page {currentPage}/{totalPages}
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              padding: "4px 10px",
              fontSize: 10,
              fontFamily: "monospace",
              cursor: currentPage <= 1 ? "default" : "pointer",
              border: "1px solid #1e3a5f",
              background: "transparent",
              color: currentPage <= 1 ? "#1e2a3a" : "#4fc3f7",
            }}
          >
            ◀ PREV
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{
              padding: "4px 10px",
              fontSize: 10,
              fontFamily: "monospace",
              cursor: currentPage >= totalPages ? "default" : "pointer",
              border: "1px solid #1e3a5f",
              background: "transparent",
              color: currentPage >= totalPages ? "#1e2a3a" : "#4fc3f7",
            }}
          >
            NEXT ▶
          </button>
        </div>
      </div>
    </div>
  );
}
