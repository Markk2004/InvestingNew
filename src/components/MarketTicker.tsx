"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketTicker() {
  const { data: quotes, error } = useSWR<Quote[]>("/api/ticker", fetcher, {
    refreshInterval: 60000, // Refresh every 1 minute
  });

  const isLoading = !quotes && !error;

  return (
    <div className="w-full bg-[#030810] border-b border-[#1e3a5f] text-sm overflow-hidden h-8 flex items-center relative shadow-md">
      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#030810] to-transparent w-8 z-10 pointer-events-none" />
      
      {isLoading ? (
        <div className="text-[#60a5fa] px-4 font-mono">LOADING MARKET DATA...</div>
      ) : error ? (
        <div className="text-red-500 px-4 font-mono">OFFLINE</div>
      ) : (
        <div 
          className="flex whitespace-nowrap"
          style={{ animation: "tickerScroll 40s linear infinite" }}
        >
          {/* Double the list for seamless looping */}
          {[...(quotes || []), ...(quotes || [])].map((q, i) => {
            const isUp = q.change >= 0;
            return (
              <div key={`${q.symbol}-${i}`} className="inline-flex items-center px-6 font-mono">
                <span className="font-bold text-[#cce0ff] mr-2">{q.symbol}</span>
                <span className="text-gray-300 mr-2">{q.price?.toFixed(2)}</span>
                <span className={`${isUp ? "text-[#22c55e]" : "text-red-500"}`}>
                  {isUp ? "▲" : "▼"}{Math.abs(q.change || 0).toFixed(2)} 
                  ({Math.abs(q.changePercent || 0).toFixed(2)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-[#030810] to-transparent w-8 z-10 pointer-events-none" />

      {/* Tailwind global keyframes fallback in case global.css is missing this exact keyframe */}
      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
