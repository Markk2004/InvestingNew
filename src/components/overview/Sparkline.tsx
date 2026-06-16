"use client";

// ─────────────────────────────────────────────────────────────
//  Sparkline.tsx — Inline SVG mini sparkline chart
//  Input: closes: number[] (historical close prices)
//  Color: green if last >= first, red if last < first
// ─────────────────────────────────────────────────────────────

interface SparklineProps {
  closes: number[];
  width?: number;
  height?: number;
  className?: string;
}

export default function Sparkline({
  closes,
  width = 80,
  height = 28,
}: SparklineProps) {
  if (!closes || closes.length < 2) {
    return (
      <svg width={width} height={height} style={{ opacity: 0.2 }}>
        <line
          x1={0} y1={height / 2}
          x2={width} y2={height / 2}
          stroke="#475569" strokeWidth={1}
        />
      </svg>
    );
  }

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = closes.map((v, i) => {
    const x = pad + (i / (closes.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const isUp = closes[closes.length - 1] >= closes[0];
  const color = isUp ? "#22c55e" : "#ef4444";
  const fillColor = isUp ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";

  // Area path: go along points, then close bottom
  const firstX = pad;
  const lastX = pad + w;
  const bottomY = pad + h;
  const areaPath = `M${firstX},${bottomY} L${points.join(" L")} L${lastX},${bottomY} Z`;

  return (
    <svg
      width={width}
      height={height}
      style={{ display: "block", flexShrink: 0 }}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Fill area */}
      <path d={areaPath} fill={fillColor} />
      {/* Line */}
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* End dot */}
      {(() => {
        const last = points[points.length - 1].split(",");
        return (
          <circle
            cx={last[0]}
            cy={last[1]}
            r={1.8}
            fill={color}
          />
        );
      })()}
    </svg>
  );
}

// ── Mock sparkline data generator (seed by symbol) ────────────
// Used until real historical data is available from API
export function generateMockCloses(symbol: string, count = 20): number[] {
  // Deterministic pseudo-random based on symbol char codes
  let seed = symbol
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) * 137;

  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const base = 50 + rng() * 200; // base price 50–250
  const closes: number[] = [base];

  for (let i = 1; i < count; i++) {
    const change = (rng() - 0.48) * base * 0.025; // slight upward bias
    closes.push(Math.max(1, closes[i - 1] + change));
  }

  return closes;
}
