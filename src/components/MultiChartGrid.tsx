"use client";

import { useState } from "react";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

const DEFAULT_SYMBOLS = ["NASDAQ:AAPL", "NASDAQ:TSLA", "BINANCE:BTCUSD", "SP:SPX"];

export default function MultiChartGrid() {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);

  // Allow user to change a symbol for a specific grid slot
  const handleSymbolChange = (index: number, newSymbol: string) => {
    const updated = [...symbols];
    updated[index] = newSymbol.toUpperCase();
    setSymbols(updated);
  };

  return (
    <div className="flex-1 w-full h-full p-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-[#04090f]">
      {symbols.map((sym, i) => (
        <div key={i} className="flex flex-col h-full bg-[#071120] border border-[#1e3a5f] rounded overflow-hidden shadow-lg relative">
          
          {/* Simple header for each chart to change symbol */}
          <div className="flex items-center justify-between bg-[#0a1f3a] px-3 py-1 border-b border-[#1e3a5f]">
            <input 
              type="text" 
              className="bg-transparent text-[#60a5fa] font-mono text-sm font-bold focus:outline-none w-32 uppercase"
              value={sym}
              onChange={(e) => handleSymbolChange(i, e.target.value)}
              placeholder="SYMBOL..."
            />
            <span className="text-xs text-gray-400 font-mono">LIVE</span>
          </div>

          {/* TradingView Widget */}
          <div className="flex-1 w-full h-full pointer-events-auto">
            <AdvancedRealTimeChart 
              theme="dark"
              symbol={sym}
              interval="15"
              timezone="Etc/UTC"
              style="1"
              locale="en"
              enable_publishing={false}
              hide_top_toolbar={true}
              hide_legend={false}
              save_image={false}
              hide_volume={false}
              hide_side_toolbar={true}
              allow_symbol_change={false} // We handle it via our custom input header
              width="100%"
              height="100%"
              autosize={true}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
