"use client";

import { useRouter } from "next/navigation";
import MarketTicker from "@/components/MarketTicker";
import MultiChartGrid from "@/components/MultiChartGrid";

export default function ChartsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030810] overflow-hidden text-white font-sans selection:bg-[#2563c8]">
      
      {/* Top Navigation Bar mimicking GameShell for consistency */}
      <header className="flex-none h-12 bg-[#071120] border-b border-[#1e3a5f] flex items-center px-4 justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-3 py-1 bg-[#0a1f3a] hover:bg-[#1e3a5f] border border-[#2563c8] rounded text-[#93c5fd] font-bold text-sm uppercase transition-colors"
          >
            ◀ BACK TO OFFICE
          </button>
          
          <div className="w-px h-6 bg-[#1e3a5f] mx-2" />
          
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h1 className="text-sm font-bold text-[#cce0ff] leading-none tracking-wide">DASH TERMINAL</h1>
              <span className="text-[10px] text-[#60a5fa] font-mono leading-none">MARKET MONITOR V1.0</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-[#60a5fa] bg-[#0a1f3a] px-3 py-1 rounded border border-[#1e3a5f]">
          CONNECTION: <span className="text-[#22c55e]">SECURE</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* TradingView Chart Grid */}
        <MultiChartGrid />
      </main>

      {/* Footer / Scrolling Ticker */}
      <footer className="flex-none h-8 bg-[#071120] border-t border-[#1e3a5f] relative z-20">
        <MarketTicker />
      </footer>
      
    </div>
  );
}
