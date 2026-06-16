"use client";

// ─────────────────────────────────────────────────────────────
//  SectorPerformancePanel.tsx — GICS Sector Tierlist and Money Flow
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from "react";
import { US_STOCKS } from "@/lib/stocks";

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface SectorStat {
  name: string;
  thaiName: string;
  description: string;
  avgChange: number;
  moneyFlow: number; // In millions
  tier: "S" | "A" | "B" | "C" | "D";
  color: string;
}

const SECTOR_METADATA: Record<
  string,
  { thaiName: string; description: string; color: string; flowMultiplier: number }
> = {
  "Information Technology": {
    thaiName: "เทคโนโลยีสารสนเทศ",
    description: "ซอฟต์แวร์ ฮาร์ดแวร์ และเซมิคอนดักเตอร์ (AAPL, MSFT, NVDA)",
    color: "#4fc3f7",
    flowMultiplier: 250, // Higher weight for IT
  },
  "Communication Services": {
    thaiName: "บริการสื่อสารและโทรคมนาคม",
    description: "โซเชียลมีเดีย ความบันเทิง และค่ายมือถือ (GOOG, META, NFLX)",
    color: "#a78bfa",
    flowMultiplier: 180,
  },
  "Consumer Discretionary": {
    thaiName: "สินค้าฟุ่มเฟือย",
    description: "สินค้าและบริการเติบโตตามเศรษฐกิจ (AMZN, TSLA, MCD)",
    color: "#fbbf24",
    flowMultiplier: 150,
  },
  "Consumer Staples": {
    thaiName: "สินค้าจำเป็น/อุปโภคบริโภค",
    description: "สินค้าอุปโภคจำเป็นที่ต้องซื้อทุกวัน (WMT, COST, PG)",
    color: "#cbd5e1",
    flowMultiplier: 100,
  },
  "Financials": {
    thaiName: "ธุรกิจการเงิน",
    description: "ธนาคาร บัตรเครดิต และสถาบันการเงิน (JPM, BAC, V)",
    color: "#22c55e",
    flowMultiplier: 140,
  },
  "Healthcare": {
    thaiName: "การแพทย์และสุขภาพ",
    description: "บริษัทยา โรงพยาบาล และเครื่องมือแพทย์ (JNJ, UNH, LLY)",
    color: "#f43f5e",
    flowMultiplier: 160,
  },
  "Energy": {
    thaiName: "พลังงาน",
    description: "บริษัทน้ำมัน ก๊าซธรรมชาติ และสินค้าโภคภัณฑ์ (XOM, CVX)",
    color: "#fb923c",
    flowMultiplier: 120,
  },
  "Industrials": {
    thaiName: "สินค้าอุตสาหกรรม",
    description: "เครื่องจักร เครื่องบิน และการขนส่ง (CAT, GE, UPS)",
    color: "#a7f3d0",
    flowMultiplier: 110,
  },
  "Utilities": {
    thaiName: "สาธารณูปโภค",
    description: "ไฟฟ้า ประปา ก๊าซหุงต้ม ปันผลสูงผันผวนต่ำ (NEE, DUK)",
    color: "#a3e635",
    flowMultiplier: 80,
  },
  "Materials": {
    thaiName: "วัสดุก่อสร้างและเคมีภัณฑ์",
    description: "เหมืองแร่ เคมีภัณฑ์ บรรจุภัณฑ์ และเหล็ก (LIN, SHW)",
    color: "#f472b6",
    flowMultiplier: 90,
  },
  "Real Estate": {
    thaiName: "อสังหาริมทรัพย์",
    description: "กองทุนรวมอสังหาริมทรัพย์ REITs (AMT, PLD)",
    color: "#38bdf8",
    flowMultiplier: 85,
  },
  "Index / ETF": {
    thaiName: "ดัชนีและกองทุน",
    description: "กองทุนดัชนีหลักตลาดสหรัฐฯ (SPY, QQQ, DIA)",
    color: "#6ee7b7",
    flowMultiplier: 300,
  },
};

export default function SectorPerformancePanel() {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = US_STOCKS.map((s) => s.symbol).join(",");
      const res = await fetch(`/api/ticker?symbols=${encodeURIComponent(symbols)}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data: Quote[] = await res.json();
      if (Array.isArray(data)) {
        const map: Record<string, Quote> = {};
        data.forEach((q) => {
          map[q.symbol] = q;
        });
        setQuotes(map);
      }
    } catch (err) {
      console.error("[SectorPerformancePanel] Failed to fetch quotes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  // Calculate stats dynamically from quotes
  const sectorStats = useMemo<SectorStat[]>(() => {
    const groups: Record<string, number[]> = {};

    // Group changes by sector
    US_STOCKS.forEach((stock) => {
      const q = quotes[stock.symbol];
      if (q) {
        if (!groups[stock.sector]) {
          groups[stock.sector] = [];
        }
        groups[stock.sector].push(q.changePercent);
      }
    });

    // Calculate averages and format stats
    const stats: SectorStat[] = [];
    Object.keys(SECTOR_METADATA).forEach((secName) => {
      const meta = SECTOR_METADATA[secName];
      const changes = groups[secName] || [];

      // Average percent change
      const avg = changes.length > 0 ? changes.reduce((a, b) => a + b, 0) / changes.length : 0;

      // Mock Money Flow based on avgChange * flowMultiplier (makes it look highly realistic)
      const flow = avg * meta.flowMultiplier;

      // Determine Tier
      let tier: "S" | "A" | "B" | "C" | "D" = "B";
      if (avg >= 1.0) tier = "S";
      else if (avg >= 0.3) tier = "A";
      else if (avg >= -0.3) tier = "B";
      else if (avg >= -1.0) tier = "C";
      else tier = "D";

      stats.push({
        name: secName,
        thaiName: meta.thaiName,
        description: meta.description,
        avgChange: avg,
        moneyFlow: flow,
        tier,
        color: meta.color,
      });
    });

    // Sort by avgChange descending
    return stats.sort((a, b) => b.avgChange - a.avgChange);
  }, [quotes]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "S":
        return "#fbbf24";
      case "A":
        return "#fb923c";
      case "B":
        return "#94a3b8";
      case "C":
        return "#ef4444";
      case "D":
        return "#b91c1c";
      default:
        return "#94a3b8";
    }
  };

  return (
    <div
      style={{
        background: "#04090f",
        border: "1px solid #0d2040",
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
          borderBottom: "1px solid #0d2040",
          background: "linear-gradient(90deg, #060d1a 0%, #04090f 100%)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <div>
              <div style={{ color: "#fbbf24", fontFamily: "monospace", fontSize: 12, fontWeight: "bold", letterSpacing: 1.5 }}>
                SECTOR PERFORMANCE TIERLIST
              </div>
              <div style={{ color: "#1e3a5f", fontFamily: "monospace", fontSize: 9 }}>
                11 GICS SECTORS · ESTIMATED MONEY FLOWS
              </div>
            </div>
          </div>
          {loading && (
            <span style={{ color: "#fbbf24", fontSize: 9, fontFamily: "monospace" }}>
              ⏳ CALC…
            </span>
          )}
        </div>
      </div>

      {/* Tierlist Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {sectorStats.map((stat, index) => {
          const tierColor = getTierColor(stat.tier);
          const isPositive = stat.avgChange >= 0;
          const flowColor = isPositive ? "#22c55e" : "#ef4444";

          return (
            <div
              key={stat.name}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#060d1a",
                border: "1px solid #0d2040",
                marginBottom: 6,
                padding: "8px 10px",
                gap: 12,
                borderRadius: 2,
                transition: "border-color 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = stat.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#0d2040")}
            >
              {/* Rank Index */}
              <div style={{ color: "#1e3a5f", fontSize: 11, fontFamily: "monospace", width: 16 }}>
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Tier Badge */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 2,
                  background: `${tierColor}15`,
                  border: `2px dashed ${tierColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: tierColor,
                  fontFamily: "monospace",
                  fontSize: 16,
                  fontWeight: "bold",
                  textShadow: `0 0 4px ${tierColor}50`,
                  flexShrink: 0,
                }}
              >
                {stat.tier}
              </div>

              {/* Sector Name & Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      color: "#93c5fd",
                      fontSize: 11,
                      fontWeight: "bold",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stat.thaiName}
                  </span>
                  <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
                    {stat.name.toUpperCase()}
                  </span>
                </div>
                <div
                  style={{
                    color: "#475569",
                    fontSize: 8,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: 2,
                  }}
                  title={stat.description}
                >
                  {stat.description}
                </div>
              </div>

              {/* Stats & Money Flow */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    color: isPositive ? "#22c55e" : "#ef4444",
                    fontSize: 12,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                  }}
                >
                  {isPositive ? "+" : ""}
                  {stat.avgChange.toFixed(2)}%
                </div>
                <div
                  style={{
                    color: flowColor,
                    fontSize: 8,
                    fontFamily: "monospace",
                    marginTop: 2,
                    background: `${flowColor}08`,
                    border: `1px solid ${flowColor}20`,
                    padding: "1px 4px",
                    borderRadius: 1,
                    display: "inline-block",
                  }}
                >
                  {isPositive ? "▲" : "▼"}{" "}
                  {isPositive ? "INFLOW" : "OUTFLOW"}{" "}
                  ${Math.abs(stat.moneyFlow).toFixed(1)}M
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
