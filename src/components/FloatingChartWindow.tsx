"use client";

// ─────────────────────────────────────────────────────────────
//  FloatingChartWindow — Draggable / Resizable TradingView Window
// ─────────────────────────────────────────────────────────────

import { useRef, useCallback, useState, memo, useEffect } from "react";
import useSWR from "swr";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { getTradingViewSymbol } from "@/lib/stocks";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface ChartWindowState {
  id: string;
  symbol: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  closed?: boolean;
}

interface Props {
  window: ChartWindowState;
  /** Controlled by parent to stagger iframe loading */
  iframeReady: boolean;
  /** Stable container_id keyed by symbol (for TradingView drawing persistence) */
  containerId: string;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ChartWindowState>) => void;
}

const MIN_W = 380;
const MIN_H = 280;

// ── Memoized TradingView chart ────────────────────────────────────────────────
// Re-renders ONLY when symbol or containerId changes.
// iframeReady gate: shows a loading shimmer until the stagger delay allows
// the iframe to mount — preventing CDN flooding on page restore.
const MemoizedChart = memo(
  ({
    symbol,
    containerId,
    iframeReady,
  }: {
    symbol: string;
    containerId: string;
    iframeReady: boolean;
  }) => {
    if (!iframeReady) {
      // Placeholder shown while waiting in the stagger queue
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#030810",
            gap: 12,
          }}
        >
          {/* Animated pulse ring */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid #0d2040",
              borderTopColor: "#4fc3f7",
              animation: "tvSpin 0.8s linear infinite",
            }}
          />
          <div
            style={{
              color: "#4fc3f7",
              fontFamily: "monospace",
              fontSize: 9,
              letterSpacing: 2,
              opacity: 0.6,
            }}
          >
            {symbol}
          </div>
          <div
            style={{
              color: "#1e3a5f",
              fontFamily: "monospace",
              fontSize: 7,
              letterSpacing: 1,
            }}
          >
            QUEUED — CHART LOADING
          </div>
          <style>{`
            @keyframes tvSpin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return (
      <AdvancedRealTimeChart
        theme="dark"
        symbol={symbol}
        interval="15"
        timezone="Etc/UTC"
        style="1"
        locale="en"
        enable_publishing={false}
        hide_top_toolbar={false}
        hide_legend={false}
        save_image={true}
        hide_side_toolbar={false}
        allow_symbol_change={false}
        width="100%"
        height="100%"
        autosize={true}
        container_id={containerId}
      />
    );
  },
  (prev, next) =>
    prev.symbol === next.symbol &&
    prev.containerId === next.containerId &&
    prev.iframeReady === next.iframeReady
);

MemoizedChart.displayName = "MemoizedChart";

// ── Percentage Badge Component ────────────────────────────────────────────────
const PercentageBadge = memo(({ symbol }: { symbol: string }) => {
  const cleanSymbol = symbol.includes(":") ? symbol.split(":")[1] : symbol;
  const { data: quoteArr } = useSWR<any[]>(`/api/ticker?symbols=${cleanSymbol}`, fetcher, {
    refreshInterval: 10000,
  });
  const quote = Array.isArray(quoteArr) && quoteArr.length > 0 ? quoteArr[0] : null;

  if (!quote) return null;

  return (
    <span style={{ 
      color: quote.change >= 0 ? "#22c55e" : "#ef4444", 
      fontSize: 9, 
      marginLeft: 8,
      background: "rgba(0,0,0,0.3)",
      padding: "1px 4px",
      borderRadius: 2
    }}>
      {quote.change >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%
    </span>
  );
});

PercentageBadge.displayName = "PercentageBadge";

// ── Main component ────────────────────────────────────────────────────────────
export default function FloatingChartWindow({
  window: win,
  iframeReady,
  containerId,
  onClose,
  onFocus,
  onUpdate,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prevStateRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Drag — Direct DOM mutation during drag, React state saved on mouseup ──
  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isMaximized) return;
      e.preventDefault();
      onFocus(win.id);

      const container = containerRef.current;
      if (!container) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origX = win.x;
      const origY = win.y;
      let currentX = origX;
      let currentY = origY;

      const onMove = (ev: MouseEvent) => {
        currentX = Math.max(0, origX + (ev.clientX - startX));
        currentY = Math.max(0, origY + (ev.clientY - startY));
        container.style.left = `${currentX}px`;
        container.style.top = `${currentY}px`;
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        onUpdate(win.id, { x: currentX, y: currentY });
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [win.id, win.x, win.y, isMaximized, onFocus, onUpdate]
  );

  // ── Resize — Direct DOM mutation during resize, React state saved on mouseup
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onFocus(win.id);

      const container = containerRef.current;
      if (!container) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origW = win.width;
      const origH = win.height;
      let currentW = origW;
      let currentH = origH;

      const onMove = (ev: MouseEvent) => {
        currentW = Math.max(MIN_W, origW + (ev.clientX - startX));
        currentH = Math.max(MIN_H, origH + (ev.clientY - startY));
        container.style.width = `${currentW}px`;
        container.style.height = `${currentH}px`;
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        onUpdate(win.id, { width: currentW, height: currentH });
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [win.id, win.width, win.height, onFocus, onUpdate]
  );

  // ── Maximize toggle ───────────────────────────────────────────────────────
  const handleMaximize = useCallback(() => {
    if (!isMaximized) {
      prevStateRef.current = {
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      };
      const vw = globalThis.innerWidth ?? 1200;
      const vh = globalThis.innerHeight ?? 800;
      const sidebar = document.querySelector('aside');
      const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
      onUpdate(win.id, { x: sidebarWidth, y: 0, width: vw - sidebarWidth, height: vh - 96 });
      setIsMaximized(true);
    } else {
      if (prevStateRef.current) {
        onUpdate(win.id, prevStateRef.current);
      }
      setIsMaximized(false);
    }
  }, [isMaximized, win, onUpdate]);

  const titleColor = "#4fc3f7";
  // Resolve correct exchange prefix (e.g. NYSE:JPM or NASDAQ:AAPL)
  const tvSymbol = getTradingViewSymbol(win.symbol);
  const router = useRouter();

  return (
    <div
      ref={containerRef}
      onMouseDown={() => !isMobile && onFocus(win.id)}
      style={{
        position: isMobile ? "fixed" : "absolute",
        left: isMobile ? 0 : win.x,
        top: isMobile ? 0 : win.y,
        width: isMobile ? "100%" : win.width,
        height: isMobile ? "100%" : (win.minimized ? 44 : win.height),
        zIndex: isMobile ? 99999 : win.zIndex,
        display: "flex",
        visibility: win.closed ? "hidden" : "visible",
        opacity: win.closed ? 0 : 1,
        pointerEvents: win.closed ? "none" : "auto",
        transform: win.closed ? "scale(0.8)" : "scale(1)",
        flexDirection: "column",
        background: "var(--color-bg-header)",
        backdropFilter: "blur(12px)",
        border: isMobile ? "none" : `2px solid var(--color-border-normal)`,
        boxShadow: isMobile ? "none" : `0 0 0 1px var(--color-border-subtle), 0 8px 40px rgba(0,0,0,0.8), 0 0 20px var(--color-accent-primary)`,
        borderRadius: isMobile ? 0 : "var(--radius, 2px)",
        overflow: "hidden",
        transition: "box-shadow 0.15s ease",
        minWidth: isMobile ? 0 : MIN_W,
        minHeight: isMobile ? 0 : (win.minimized ? 44 : MIN_H),
        userSelect: "none",
      }}
    >
      {/* ── Title Bar ───────────────────────────────────────────────────── */}
      <div
        onMouseDown={isMobile ? undefined : handleDragMouseDown}
        style={{
          height: isMobile ? 48 : 44,
          flexShrink: 0,
          background: "var(--color-bg-page-gradient)",
          backgroundColor: "var(--color-bg-page)",
          borderBottom: `1px solid var(--color-border-normal)`,
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "0 16px" : "0 10px",
          cursor: (isMaximized || isMobile) ? "default" : "grab",
          gap: 8,
        }}
      >
        {isMobile ? (
          <button
            onClick={() => {
              onClose(win.id);
              router.back();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: "bold",
              color: "var(--color-accent-primary)",
              fontFamily: "var(--font-mono)",
              background: "rgba(255,0,60,0.1)",
              border: "none",
              padding: "4px 12px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            ◀ BACK
          </button>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onClose(win.id)}
              style={trafficBtn("#ff5f57")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7a0000")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "transparent")}
              title="Close"
            >×</button>

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onUpdate(win.id, { minimized: !win.minimized })}
              style={trafficBtn("#febc2e")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7a4400")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "transparent")}
              title="Minimize"
            >−</button>

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleMaximize}
              style={trafficBtn("#28c840")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#004400")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "transparent")}
              title="Maximize"
            >+</button>
          </div>
        )}

        <div style={{ width: 1, height: 20, background: "#1e3a5f", flexShrink: 0 }} />
        {!isMobile && <span style={{ fontSize: 14, flexShrink: 0 }}>📈</span>}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            color: "var(--color-accent-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: "bold",
            letterSpacing: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "flex",
            alignItems: "center",
          }}>
            <span>{win.symbol}</span>
            <PercentageBadge symbol={win.symbol} />
            {!iframeReady && (
              <span style={{ color: "#fbbf24", fontSize: 8, marginLeft: 8, fontWeight: "normal" }}>
                ⏳
              </span>
            )}
          </div>
          <div style={{ color: "var(--color-text-subtitle)", fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: 0.5 }}>
            TRADINGVIEW · LIVE
          </div>
        </div>

        <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace", flexShrink: 0 }}>
          {win.width}×{win.height}
        </span>
      </div>

      {/* ── Chart Body ───────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          visibility: win.minimized ? "hidden" : "visible",
          opacity: win.minimized ? 0 : 1,
        }}
      >
        <MemoizedChart
          symbol={tvSymbol}
          containerId={containerId}
          iframeReady={iframeReady}
        />
      </div>

      {/* ── Resize Handle ────────────────────────────────────────────────── */}
      {!win.minimized && !isMaximized && !isMobile && (
        <div
          onMouseDown={handleResizeMouseDown}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            cursor: "se-resize",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 12 12">
            <line x1="12" y1="4" x2="4" y2="12" stroke={`${titleColor}60`} strokeWidth="1.5" />
            <line x1="12" y1="8" x2="8" y2="12" stroke={`${titleColor}60`} strokeWidth="1.5" />
            <line x1="12" y1="12" x2="12" y2="12" stroke={`${titleColor}60`} strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Helper: traffic-light button style ────────────────────────────────────────
function trafficBtn(bg: string): React.CSSProperties {
  return {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: bg,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 8,
    color: "transparent",
    transition: "color 0.15s",
  };
}
