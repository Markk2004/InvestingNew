"use client";

// ─────────────────────────────────────────────────────────────
//  MarketOverviewPanel — US Stock List with Add to Watchlist
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";

export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

// Top US stocks by sector
const US_STOCKS: StockInfo[] = [
  // Technology
  { symbol: "AAPL",  name: "Apple Inc.",            sector: "Technology", exchange: "NASDAQ" },
  { symbol: "MSFT",  name: "Microsoft Corp.",        sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",           sector: "Technology", exchange: "NASDAQ" },
  { symbol: "GOOG",  name: "Alphabet Inc.",          sector: "Technology", exchange: "NASDAQ" },
  { symbol: "META",  name: "Meta Platforms",         sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AVGO",  name: "Broadcom Inc.",          sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AMD",   name: "Advanced Micro Devices", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "INTC",  name: "Intel Corp.",            sector: "Technology", exchange: "NASDAQ" },
  { symbol: "QCOM",  name: "QUALCOMM Inc.",          sector: "Technology", exchange: "NASDAQ" },
  { symbol: "TXN",   name: "Texas Instruments",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AMAT",  name: "Applied Materials",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "MU",    name: "Micron Technology",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "LRCX",  name: "Lam Research",           sector: "Technology", exchange: "NASDAQ" },
  { symbol: "KLAC",  name: "KLA Corp.",              sector: "Technology", exchange: "NASDAQ" },
  { symbol: "ORCL",  name: "Oracle Corp.",           sector: "Technology", exchange: "NYSE"   },
  { symbol: "CRM",   name: "Salesforce Inc.",        sector: "Technology", exchange: "NYSE"   },
  { symbol: "ADBE",  name: "Adobe Inc.",             sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NOW",   name: "ServiceNow Inc.",        sector: "Technology", exchange: "NYSE"   },
  { symbol: "SNOW",  name: "Snowflake Inc.",         sector: "Technology", exchange: "NYSE"   },
  { symbol: "PLTR",  name: "Palantir Technologies",  sector: "Technology", exchange: "NASDAQ" },
  { symbol: "IREN",  name: "Iris Energy Limited",    sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NVTS",  name: "Navitas Semiconductor",  sector: "Technology", exchange: "NASDAQ" },
  { symbol: "BTDR",  name: "Bitdeer Technologies",   sector: "Technology", exchange: "NASDAQ" },
  { symbol: "DOCN",  name: "DigitalOcean Holdings",  sector: "Technology", exchange: "NYSE"   },
  { symbol: "ONDS",  name: "Ondas Holdings Inc.",    sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AEHR",  name: "Aehr Test Systems",      sector: "Technology", exchange: "NASDAQ" },
  { symbol: "RKLB",  name: "Rocket Lab USA, Inc.",   sector: "Technology", exchange: "NASDAQ" },

  // Consumer / E-commerce
  { symbol: "AMZN",  name: "Amazon.com Inc.",        sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "TSLA",  name: "Tesla Inc.",             sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "HD",    name: "Home Depot Inc.",        sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "MCD",   name: "McDonald's Corp.",       sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "SBUX",  name: "Starbucks Corp.",        sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "NKE",   name: "Nike Inc.",              sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "COST",  name: "Costco Wholesale",       sector: "Consumer",   exchange: "NASDAQ" },
  { symbol: "WMT",   name: "Walmart Inc.",           sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "TGT",   name: "Target Corp.",           sector: "Consumer",   exchange: "NYSE"   },
  { symbol: "EBAY",  name: "eBay Inc.",              sector: "Consumer",   exchange: "NASDAQ" },

  // Finance
  { symbol: "JPM",   name: "JPMorgan Chase",         sector: "Finance",    exchange: "NYSE"   },
  { symbol: "BAC",   name: "Bank of America",        sector: "Finance",    exchange: "NYSE"   },
  { symbol: "WFC",   name: "Wells Fargo",            sector: "Finance",    exchange: "NYSE"   },
  { symbol: "GS",    name: "Goldman Sachs",          sector: "Finance",    exchange: "NYSE"   },
  { symbol: "MS",    name: "Morgan Stanley",         sector: "Finance",    exchange: "NYSE"   },
  { symbol: "V",     name: "Visa Inc.",              sector: "Finance",    exchange: "NYSE"   },
  { symbol: "MA",    name: "Mastercard Inc.",        sector: "Finance",    exchange: "NYSE"   },
  { symbol: "PYPL",  name: "PayPal Holdings",        sector: "Finance",    exchange: "NASDAQ" },
  { symbol: "BLK",   name: "BlackRock Inc.",         sector: "Finance",    exchange: "NYSE"   },
  { symbol: "COIN",  name: "Coinbase Global",        sector: "Finance",    exchange: "NASDAQ" },

  // Healthcare
  { symbol: "JNJ",   name: "Johnson & Johnson",      sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "UNH",   name: "UnitedHealth Group",     sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "PFE",   name: "Pfizer Inc.",            sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "ABBV",  name: "AbbVie Inc.",            sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "LLY",   name: "Eli Lilly",              sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "MRK",   name: "Merck & Co.",            sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "TMO",   name: "Thermo Fisher",          sector: "Healthcare", exchange: "NYSE"   },
  { symbol: "ABT",   name: "Abbott Laboratories",    sector: "Healthcare", exchange: "NYSE"   },

  // Energy
  { symbol: "XOM",   name: "Exxon Mobil",            sector: "Energy",     exchange: "NYSE"   },
  { symbol: "CVX",   name: "Chevron Corp.",          sector: "Energy",     exchange: "NYSE"   },
  { symbol: "COP",   name: "ConocoPhillips",         sector: "Energy",     exchange: "NYSE"   },
  { symbol: "SLB",   name: "Schlumberger Ltd.",      sector: "Energy",     exchange: "NYSE"   },
  { symbol: "OXY",   name: "Occidental Petroleum",   sector: "Energy",     exchange: "NYSE"   },
  { symbol: "TVC:GOLD",     name: "Gold Spot (TVC)",         sector: "Energy",     exchange: "TVC" },
  { symbol: "OANDA:XAUUSD", name: "Gold Spot (OANDA)",       sector: "Energy",     exchange: "OANDA" },
  { symbol: "FLNC",  name: "Fluence Energy, Inc.",   sector: "Energy",     exchange: "NASDAQ" },
  { symbol: "EOSE",  name: "Eos Energy Enterprises", sector: "Energy",     exchange: "NASDAQ" },

  // Comm & Media
  { symbol: "NFLX",  name: "Netflix Inc.",           sector: "Media",      exchange: "NASDAQ" },
  { symbol: "DIS",   name: "The Walt Disney Co.",    sector: "Media",      exchange: "NYSE"   },
  { symbol: "T",     name: "AT&T Inc.",              sector: "Media",      exchange: "NYSE"   },
  { symbol: "VZ",    name: "Verizon Comm.",          sector: "Media",      exchange: "NYSE"   },
  { symbol: "CMCSA", name: "Comcast Corp.",          sector: "Media",      exchange: "NASDAQ" },

  // Index / ETF
  { symbol: "SPY",   name: "SPDR S&P 500 ETF",      sector: "ETF",        exchange: "NYSE"   },
  { symbol: "QQQ",   name: "Invesco QQQ Trust",      sector: "ETF",        exchange: "NASDAQ" },
  { symbol: "IWM",   name: "iShares Russell 2000",   sector: "ETF",        exchange: "NYSE"   },
  { symbol: "DIA",   name: "SPDR Dow Jones ETF",     sector: "ETF",        exchange: "NYSE"   },
  { symbol: "SPCX",  name: "Spectra ESG ETF",        sector: "ETF",        exchange: "NASDAQ" },
];

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
