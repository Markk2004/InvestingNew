"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import type { NewsItem } from '@/lib/types';

interface ExposureChartProps {
  articles?: NewsItem[];
}

export default function ExposureChart({ articles = [] }: ExposureChartProps) {
  const data = React.useMemo(() => {
    // Last 24 hours hourly slots
    const result = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      d.setMinutes(0, 0, 0); // round to the start of the hour
      const label = `${d.getHours().toString().padStart(2, '0')}:00`;
      let safe = 0;
      let high = 0;
      articles.forEach(a => {
        if (!a.publishedAt) return;
        const pub = new Date(a.publishedAt);
        if (pub >= d && pub < new Date(d.getTime() + 60 * 60 * 1000)) {
          if (a.severityScore >= 7) high++;
          else safe++;
        }
      });
      result.push({ time: label, safe, high });
    }
    return result;
  }, [articles]);

  const formatYAxis = (tickItem: any) => {
    return tickItem.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3"
          style={{
            background: 'rgba(11, 11, 14, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            color: '#f8fafc',
            fontFamily: 'var(--font-mono), monospace'
          }}
        >
          <p style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-1">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }} 
              />
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{entry.name}:</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', marginLeft: 'auto' }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="w-full flex flex-col p-4"
      style={{
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'radial-gradient(ellipse at center bottom, rgba(255, 0, 60, 0.15) 0%, rgba(11, 11, 14, 1) 70%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Header & Controls ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <h3 style={{ color: '#a1a1aa', fontSize: '14px', fontFamily: 'var(--font-fui), sans-serif', letterSpacing: '0.5px' }}>
            News Risk Trends (24H)
          </h3>
          {/* Legend */}
          <div className="flex items-center gap-6 mt-3 font-mono text-[11px] text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_8px_var(--color-accent-primary)]" />
              <span>High Risk (≥7)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_#fbbf24]" />
              <span>Safe (&lt;7)</span>
            </div>
          </div>
        </div>

        {/* Time filters removed to display the chart directly */}
      </div>

      {/* ── Chart Area ───────────────────────────────────── */}
      <div className="w-full h-[165px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* Hidden Grids */}
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#52525b', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickFormatter={formatYAxis}
            />
            
            {/* Custom Hover Dashed Line */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} 
            />

            {/* High Risk Line (Crimson) */}
            <Line 
              type="monotone" 
              dataKey="high" 
              name="High Risk"
              stroke="var(--color-accent-primary)" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ 
                r: 5, 
                fill: '#0b0b0e', 
                stroke: 'var(--color-accent-primary)', 
                strokeWidth: 2 
              }} 
            />
            
            {/* Safe Line (Yellow) */}
            <Line 
              type="monotone" 
              dataKey="safe" 
              name="Safe"
              stroke="#fbbf24" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ 
                r: 5, 
                fill: '#0b0b0e', 
                stroke: '#fbbf24', 
                strokeWidth: 2 
              }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
