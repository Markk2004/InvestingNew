"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { US_STOCKS, type StockInfo } from "@/lib/stocks";
import { useWatchlist } from "@/lib/useWatchlist";
import Sparkline, { generateMockCloses } from "@/components/overview/Sparkline";
import SectorPerformancePanel from "@/components/overview/SectorPerformancePanel";
import { Search, Calendar, Settings, SlidersHorizontal, ChevronDown, CheckCircle2, Star } from "lucide-react";

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MobileMarketList() {
  const router = useRouter();
  const { add, remove, has } = useWatchlist();
  
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"market" | "sector">("market");

  // Mock sparklines
  const sparklineData = useMemo(() => {
    const map: Record<string, number[]> = {};
    US_STOCKS.forEach((s) => {
      map[s.symbol] = generateMockCloses(s.symbol, 20);
    });
    return map;
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      const symbols = US_STOCKS.slice(0, 15).map((s) => s.symbol).join(",");
      const res = await fetch(`/api/ticker?symbols=${encodeURIComponent(symbols)}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data: Quote[] = await res.json();
      if (Array.isArray(data)) {
        const map: Record<string, Quote> = {};
        data.forEach((q) => { map[q.symbol] = q; });
        setQuotes(map);
      }
    } catch (err) {
      console.error("[MobileMarketList] Failed to fetch quotes:", err);
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return US_STOCKS.filter((s) => 
      !q || s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 15); // Show top 15 on mobile for performance
  }, [search]);

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden pb-16">
      
      {/* HEADER TABS */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,0,60,0.2)] shrink-0">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveSubTab("market")}
            className={`text-sm font-bold tracking-wider transition-colors ${activeSubTab === "market" ? "text-[var(--color-accent-primary)] border-b-2 border-[var(--color-accent-primary)] pb-1" : "text-[#555] pb-1"}`}
            style={{ fontFamily: "var(--font-fui)" }}
          >
            MARKET
          </button>
          <button 
            onClick={() => setActiveSubTab("sector")}
            className={`text-sm font-bold tracking-wider transition-colors ${activeSubTab === "sector" ? "text-[var(--color-accent-primary)] border-b-2 border-[var(--color-accent-primary)] pb-1" : "text-[#555] pb-1"}`}
            style={{ fontFamily: "var(--font-fui)" }}
          >
            SECTORS
          </button>
        </div>
        <div className="flex gap-4">
          <SlidersHorizontal size={18} className="text-[#888]" />
          <Settings size={18} className="text-[#888]" />
        </div>
      </div>

      {activeSubTab === "sector" ? (
        <div className="flex-1 overflow-y-auto">
          <SectorPerformancePanel />
        </div>
      ) : (
        <>


          {/* SEARCH BAR (Top) */}
          <div className="p-3 shrink-0 border-b border-[rgba(255,255,255,0.05)] bg-[#050508]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input 
                type="text" 
                placeholder="ชื่อย่อ/ชื่อหุ้น/ฟีเจอร์/ข่าว"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-[rgba(255,255,255,0.1)] rounded-full py-2 pl-10 pr-12 text-xs text-white focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[#4fc3f7] to-[var(--color-accent-primary)] flex items-center justify-center shadow-[0_0_10px_rgba(255,0,60,0.3)]">
                <span className="text-[9px] text-black font-bold">AI</span>
              </div>
            </div>
          </div>

          {/* STOCK LIST */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {filtered.map((stock) => {
              const q = quotes[stock.symbol];
              const pct = q?.changePercent ?? 0;
              const price = q?.price;
              const isUp = pct >= 0;
              const colorClass = isUp ? "text-[#22c55e]" : "text-[var(--color-accent-primary)]";
              const bgClass = isUp ? "bg-[#22c55e]" : "bg-[var(--color-accent-primary)]";
              const sparkCloses = sparklineData[stock.symbol] ?? [];

              return (
                <div 
                  key={stock.symbol}
                  onClick={() => router.push(`/charts?open=${stock.symbol}`)}
                  className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.03)] active:bg-[rgba(255,255,255,0.05)]"
                >
                  {/* Left: Logo + Info */}
                  <div className="flex items-center gap-3 flex-[2] min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#111] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-bold shrink-0">
                      {stock.symbol.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide">{stock.symbol}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (has(stock.symbol)) remove(stock.symbol);
                            else add(stock.symbol);
                          }}
                          className="p-1 -ml-1 transition-colors"
                        >
                          <Star 
                            size={14} 
                            className={has(stock.symbol) ? "fill-[#fbbf24] text-[#fbbf24]" : "text-[#555]"} 
                          />
                        </button>
                      </div>
                      <div className="text-xs text-[#888] truncate pr-2" title={stock.name}>
                        {stock.name}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <span className="text-[8px] bg-[rgba(255,255,255,0.1)] text-[#ccc] px-1 rounded">24H</span>
                        <span className="text-[8px] bg-[rgba(255,255,255,0.1)] text-[#ccc] px-1 rounded">US</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Sparkline */}
                  <div className="flex-1 flex justify-center px-2">
                    <div className="opacity-80" style={{ width: 60, height: 24, filter: isUp ? "hue-rotate(-50deg)" : "hue-rotate(0deg)" }}>
                      <Sparkline closes={sparkCloses} width={60} height={24} />
                    </div>
                  </div>

                  {/* Right: Price Pill */}
                  <div className="flex flex-col items-end flex-[1.5] shrink-0">
                    <div className={`${bgClass} text-black font-bold text-sm px-3 py-1 rounded-md mb-1 min-w-[75px] text-right shadow-[0_0_10px_rgba(255,0,60,0.2)]`}>
                      {price != null ? price.toFixed(2) : "---"}
                    </div>
                    <div className={`${colorClass} text-xs tabular-nums tracking-tighter`}>
                      {q ? `${isUp ? "+" : ""}${q.change.toFixed(2)} (${pct.toFixed(2)}%)` : "---"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
