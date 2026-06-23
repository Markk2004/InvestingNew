import React, { useMemo } from "react";
import type { NewsItem } from "@/lib/types";

export function RiskTrendsCard({ data = [] }: { data?: NewsItem[] | any[] }) {
  const riskTrend = useMemo(() => {
    // Check if the data is already formatted (like the mock list)
    if (data.length > 0 && typeof data[0].hour === "number" && (typeof data[0].high === "number" || typeof data[0].safe === "number")) {
      return data;
    }

    // Treat it as NewsItem[] and build the trends
    const now = new Date();
    const result = [];
    
    // We want 5 points to fit the graph width. Let's step back 4, 3, 2, 1, 0 slots of 3 hours each (covers last 12 hours)
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
      d.setMinutes(0, 0, 0); // round to start of hour
      const hour = d.getHours();
      
      let safe = 0;
      let high = 0;
      
      data.forEach((a: any) => {
        if (!a.publishedAt) return;
        const pub = new Date(a.publishedAt);
        // check if it falls within the 3-hour window
        if (pub >= new Date(d.getTime() - 1.5 * 60 * 60 * 1000) && pub < new Date(d.getTime() + 1.5 * 60 * 60 * 1000)) {
          if (a.severityScore >= 7) {
            high++;
          } else {
            safe++;
          }
        }
      });
      
      result.push({ hour, high, safe });
    }
    
    return result;
  }, [data]);
  
  const w = 320;
  const h = 140;
  const padL = 22;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  
  // Calculate maximum Y to scale the graph dynamically
  const maxY = useMemo(() => {
    const maxVal = Math.max(...riskTrend.map(p => Math.max(p.high, p.safe)));
    return maxVal > 0 ? Math.ceil(maxVal) : 2; // default to 2 if max is 0
  }, [riskTrend]);

  const toPoints = (key: "high" | "safe") =>
    riskTrend
      .map((p, i) => {
        const x = padL + (i / Math.max(1, riskTrend.length - 1)) * innerW;
        const y = padT + innerH - (p[key] / maxY) * innerH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const yTicks = useMemo(() => {
    const ticks = [];
    const step = maxY / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(parseFloat((i * step).toFixed(1)));
    }
    return ticks;
  }, [maxY]);

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#0a0a0f]/60 p-4">
      <div className="mb-2 text-sm font-bold text-white">
        News Risk Trends (24H)
      </div>
      <div className="mb-3 flex gap-4 text-[11px]">
        <span className="flex items-center gap-1.5 text-[#888888]">
          <span className="h-2 w-2 rounded-full bg-[#ff003c]" /> High Risk (≥7)
        </span>
        <span className="flex items-center gap-1.5 text-[#888888]">
          <span className="h-2 w-2 rounded-full bg-[#fbbf24]" /> Safe (&lt;7)
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {yTicks.map((v) => {
          const y = padT + innerH - (v / maxY) * innerH;
          return (
            <g key={v}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="2 3"
                strokeWidth="0.5"
              />
              <text x={2} y={y + 3} fontSize="8" fill="#888888">
                {v}
              </text>
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.8"
          points={toPoints("safe")}
          style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.5))" }}
        />
        <polyline
          fill="none"
          stroke="#ff003c"
          strokeWidth="1.8"
          points={toPoints("high")}
          style={{ filter: "drop-shadow(0 0 4px rgba(255,0,60,0.5))" }}
        />
        {riskTrend.map((p, i) => {
          const x = padL + (i / Math.max(1, riskTrend.length - 1)) * innerW;
          return (
            <text
              key={`${p.hour}-${i}`}
              x={x}
              y={h - 6}
              fontSize="7"
              fill="#888888"
              textAnchor="middle"
            >
              {p.hour}:00
            </text>
          );
        })}
      </svg>
    </div>
  );
}
