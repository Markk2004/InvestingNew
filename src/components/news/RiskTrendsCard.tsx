export function RiskTrendsCard({ data = [] }: { data?: any[] }) {
  // Use mock data if not provided
  const riskTrend = data.length > 0 ? data : [
    { hour: 8, high: 0.2, safe: 1.5 },
    { hour: 10, high: 0.5, safe: 1.2 },
    { hour: 12, high: 1.2, safe: 0.8 },
    { hour: 14, high: 1.8, safe: 0.5 },
    { hour: 16, high: 1.5, safe: 0.7 },
  ];

  const w = 320;
  const h = 140;
  const padL = 22;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const maxY = 2;
  const n = riskTrend.length;
  
  const toPoints = (key: "high" | "safe") =>
    riskTrend
      .map((p, i) => {
        const x = padL + (i / Math.max(1, n - 1)) * innerW;
        const y = padT + innerH - (p[key] / maxY) * innerH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
      
  const yTicks = [0, 0.5, 1, 1.5, 2];
  
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
        {riskTrend
          .map((p, i) => {
            const x = padL + (i / Math.max(1, n - 1)) * innerW;
            return (
              <text
                key={p.hour}
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
