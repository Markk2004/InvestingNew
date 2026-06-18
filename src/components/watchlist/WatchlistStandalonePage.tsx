"use client";

// ─────────────────────────────────────────────────────────────
//  WatchlistStandalonePage.tsx — User-curated watchlist
//  Full page component used by /watchlist route
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWatchlist } from "@/lib/useWatchlist";
import { US_STOCKS } from "@/lib/stocks";
import Sparkline, { generateMockCloses } from "@/components/overview/Sparkline";

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

function PulseDot({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 5px ${color}`,
        display: "inline-block",
        animation: "pixelBlink 2s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  );
}

export default function WatchlistStandalonePage() {
  const router = useRouter();
  const { items, remove } = useWatchlist();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(false);

  const symbols = items.map((i) => i.symbol);

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ticker?symbols=${symbols.join(",")}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data: Quote[] = await res.json();
      if (Array.isArray(data)) {
        const map: Record<string, Quote> = {};
        data.forEach((q) => { map[q.symbol] = q; });
        setQuotes(map);
      }
    } catch (err) {
      console.error("[WatchlistPage] Failed to fetch quotes:", err);
    } finally {
      setLoading(false);
    }
  }, [symbols.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  const stockInfo = (symbol: string) =>
    US_STOCKS.find((s) => s.symbol === symbol);

  if (items.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          color: "#1e3a5f",
          fontFamily: "monospace",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56, opacity: 0.2 }}>⭐</div>
        <div style={{ fontSize: 11, letterSpacing: 2 }}>WATCHLIST EMPTY</div>
        <div style={{ fontSize: 8, lineHeight: 1.8 }}>
          ไปที่หน้า Overview และกด{" "}
          <span style={{ color: "#22c55e" }}>[+ ADD]</span> เพื่อเพิ่มหุ้น
        </div>
        <button
          onClick={() => router.push("/overview")}
          style={{
            background: "#071020",
            border: "1px solid #4fc3f7",
            color: "#4fc3f7",
            fontSize: 8,
            padding: "6px 16px",
            cursor: "pointer",
            fontFamily: "monospace",
            letterSpacing: 1,
            marginTop: 8,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0a1f3a")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#071020")}
        >
          📈 GO TO OVERVIEW
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Sub-header */}
      <div
        style={{
          padding: "8px 20px",
          borderBottom: "1px solid #0d2040",
          background: "#060d1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#fbbf24", fontSize: 8, fontFamily: "monospace", letterSpacing: 1 }}>
          ⭐ {items.length} SYMBOL{items.length !== 1 ? "S" : ""} TRACKED
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {loading && (
            <span style={{ color: "#fbbf24", fontSize: 7, fontFamily: "monospace" }}>
              ⏳ UPDATING…
            </span>
          )}
          <button
            onClick={fetchQuotes}
            style={{
              background: "transparent",
              border: "1px solid #1e3a5f",
              color: "#4fc3f7",
              fontSize: 7,
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            ↺ REFRESH
          </button>
          <button
            onClick={() => router.push("/overview")}
            style={{
              background: "#071020",
              border: "1px solid #22c55e",
              color: "#22c55e",
              fontSize: 7,
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            + ADD MORE
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px 110px 1fr 100px 90px 90px 110px 36px",
          padding: "8px 16px",
          borderBottom: "1px solid #0d2040",
          background: "#050c17",
          flexShrink: 0,
          gap: 0,
          alignItems: "center",
        }}
      >
        {["#", "SYMBOL", "NAME / SECTOR", "TREND", "PRICE", "CHANGE", "ACTION", ""].map((h) => (
          <div key={h} style={{ color: "#52759e", fontSize: 10, fontFamily: "monospace", letterSpacing: 0.5 }}>
            {h}
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {items.map((item, idx) => {
          const q = quotes[item.symbol];
          const info = stockInfo(item.symbol);
          const pct = q?.changePercent ?? 0;
          const isUp = pct >= 0;
          const pctColor = isUp ? "#22c55e" : "#ef4444";
          const dotColor = isUp ? "#22c55e" : "#ef4444";
          const sparkCloses = generateMockCloses(item.symbol, 20);

          return (
            <div
              key={item.symbol}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 110px 1fr 100px 90px 90px 110px 36px",
                padding: "10px 16px",
                borderBottom: "1px solid #080f1a",
                alignItems: "center",
                gap: 0,
                transition: "background 0.08s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#060d1a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {/* Index */}
              <div style={{ color: "#1e3a5f", fontSize: 10, fontFamily: "monospace" }}>
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Symbol */}
              <div
                onClick={() => router.push(`/charts?open=${item.symbol}`)}
                style={{
                  color: "#fbbf24",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                title="Open chart"
              >
                <PulseDot color={q ? dotColor : "#1e3a5f"} />
                {item.symbol}
              </div>

              {/* Name + sector */}
              <div style={{ paddingRight: 4 }}>
                <div style={{ color: "#94a3b8", fontSize: 11, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {info?.name ?? item.symbol}
                </div>
                {info && (
                  <div style={{ color: "#475569", fontSize: 8, fontFamily: "monospace" }}>
                    {info.sector} · {info.exchange}
                  </div>
                )}
              </div>

              {/* Sparkline */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Sparkline closes={sparkCloses} width={86} height={30} />
              </div>

              {/* Price */}
              <div style={{ color: q ? "#cbd5e1" : "#1e3a5f", fontFamily: "monospace", fontSize: 12, textAlign: "right", paddingRight: 8 }}>
                {q ? `$${q.price.toFixed(2)}` : "—"}
              </div>

              {/* Change */}
              <div style={{ textAlign: "right", paddingRight: 8 }}>
                {q ? (
                  <div>
                    <div style={{ color: pctColor, fontFamily: "monospace", fontSize: 12, fontWeight: "bold" }}>
                      {isUp ? "+" : ""}{pct.toFixed(2)}%
                    </div>
                    <div style={{ color: pctColor, fontFamily: "monospace", fontSize: 9, opacity: 0.7 }}>
                      {isUp ? "+" : ""}{q.change.toFixed(2)}
                    </div>
                  </div>
                ) : (
                  <span style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 11 }}>—</span>
                )}
              </div>

              {/* Open Graph button */}
              <button
                onClick={() => router.push(`/charts?open=${item.symbol}`)}
                style={{
                  background: "#071a30",
                  border: "1px solid #1e3a5f",
                  color: "#4fc3f7",
                  fontSize: 9,
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  letterSpacing: 0.5,
                  transition: "all 0.12s",
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
                📊 OPEN GRAPH
              </button>

              {/* Remove */}
              <button
                onClick={() => remove(item.symbol)}
                title="Remove from watchlist"
                style={{
                  width: 24,
                  height: 24,
                  background: "transparent",
                  border: "1px solid #1e2a3a",
                  color: "#334155",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.12s",
                  margin: "0 auto",
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
                −
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "6px 16px",
          borderTop: "1px solid #0d2040",
          background: "#060d1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
          CLICK SYMBOL → OPEN CHART · PRICES UPDATE EVERY 60s
        </span>
        <span style={{ color: "#fbbf24", fontSize: 7, fontFamily: "monospace" }}>
          ⭐ {items.length} TRACKED
        </span>
      </div>
    </div>
  );
}
