"use client";

// ─────────────────────────────────────────────────────────────
//  FloatingChartManager — Manages all open chart windows
//  Fixes: concurrent iframe loading, drawing persistence,
//         cascading re-renders
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import FloatingChartWindow, { ChartWindowState } from "./FloatingChartWindow";

const WINDOWS_STORAGE_KEY = "invester_chart_windows_v1";

// Stagger delay between each iframe load (ms) to avoid hammering TradingView CDN
const IFRAME_STAGGER_MS = 600;

// Layout presets for tiled mode
const TILE_LAYOUTS: Record<string, { cols: number; rows: number }> = {
  "1x1": { cols: 1, rows: 1 },
  "2x1": { cols: 2, rows: 1 },
  "2x2": { cols: 2, rows: 2 },
  "3x2": { cols: 3, rows: 2 },
  "3x3": { cols: 3, rows: 3 },
};

const INITIAL_POSITIONS = [
  { x: 20, y: 20 },
  { x: 60, y: 40 },
  { x: 100, y: 60 },
  { x: 140, y: 80 },
];

export type OpenChartFn = (symbol: string) => void;

interface ManagerReturn {
  windows: ChartWindowState[];
  openChart: OpenChartFn;
  closeChart: (id: string) => void;
  ManagerUI: React.ReactNode;
  hasWindows: boolean;
}

// ── Stable container_id mapping: symbol → container DOM id ──────────────────
//  We use a symbol-keyed map so that even after reload, the same symbol
//  always gets the same container_id. This lets TradingView restore
//  drawings, trendlines and timeframe from localStorage automatically.
const symbolToContainerId = new Map<string, string>();

function getContainerId(symbol: string): string {
  const key = symbol.toUpperCase();
  if (!symbolToContainerId.has(key)) {
    const safe = key.replace(/[^a-zA-Z0-9]/g, "-");
    symbolToContainerId.set(key, `tv-chart-${safe}`);
  }
  return symbolToContainerId.get(key)!;
}

export function useChartManager(): ManagerReturn {
  const [windows, setWindows] = useState<ChartWindowState[]>([]);
  const [maxZ, setMaxZ] = useState(100);
  // Set of window IDs that are allowed to render their iframe
  // (staggered unlock to prevent CDN flooding)
  const [readyIds, setReadyIds] = useState<Set<string>>(new Set());
  const isLoadedRef = useRef(false);

  // ── Load from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(WINDOWS_STORAGE_KEY);
      if (raw) {
        const parsed: ChartWindowState[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWindows(parsed);
          const zs = parsed.map((w) => w.zIndex ?? 100);
          setMaxZ(Math.max(...zs, 100));

          // Stagger-unlock iframes one by one so CDN isn't hit all at once
          parsed.forEach((w, i) => {
            setTimeout(() => {
              setReadyIds((prev) => new Set([...prev, w.id]));
            }, i * IFRAME_STAGGER_MS);
          });
        }
      }
    } catch (e) {
      console.error("[ChartManager] Failed to load chart windows:", e);
    } finally {
      isLoadedRef.current = true;
    }
  }, []);

  // ── Persist to localStorage on change ────────────────────────────────────
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem(WINDOWS_STORAGE_KEY, JSON.stringify(windows));
    } catch (e) {
      console.error("[ChartManager] Failed to save chart windows:", e);
    }
  }, [windows]);

  // ── Open / focus chart ────────────────────────────────────────────────────
  const openChart = useCallback(
    (symbol: string) => {
      setWindows((prev) => {
        // If already open → focus & un-minimize
        const existing = prev.find(
          (w) => w.symbol.toUpperCase() === symbol.toUpperCase()
        );
        if (existing) {
          const newZ = maxZ + 1;
          setMaxZ(newZ);
          return prev.map((w) =>
            w.id === existing.id ? { ...w, zIndex: newZ, minimized: false } : w
          );
        }

        // Create new window
        const idx = prev.length % INITIAL_POSITIONS.length;
        const pos = INITIAL_POSITIONS[idx];
        const newZ = maxZ + 1;
        setMaxZ(newZ);

        const id = `chart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newWin: ChartWindowState = {
          id,
          symbol: symbol.toUpperCase(),
          x: pos.x + prev.length * 30,
          y: pos.y + prev.length * 20,
          width: 620,
          height: 420,
          zIndex: newZ,
          minimized: false,
        };

        // New window is immediately ready (not a restore batch)
        setReadyIds((r) => new Set([...r, id]));

        return [...prev, newWin];
      });
    },
    [maxZ]
  );

  // ── Close ─────────────────────────────────────────────────────────────────
  const closeChart = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setReadyIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // ── Focus ─────────────────────────────────────────────────────────────────
  const focusChart = useCallback(
    (id: string) => {
      const newZ = maxZ + 1;
      setMaxZ(newZ);
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w))
      );
    },
    [maxZ]
  );

  // ── Update (position / size from drag-end / resize-end) ──────────────────
  const updateChart = useCallback(
    (id: string, patch: Partial<ChartWindowState>) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...patch } : w))
      );
    },
    []
  );

  // ── Tile all windows ──────────────────────────────────────────────────────
  const tileWindows = useCallback((layoutKey: string) => {
    const layout = TILE_LAYOUTS[layoutKey] ?? { cols: 2, rows: 2 };
    const vw = globalThis.innerWidth ?? 1200;
    const vh = globalThis.innerHeight ?? 800;
    const availW = vw;
    const availH = vh - 96; // header + footer
    const cellW = Math.floor(availW / layout.cols);
    const cellH = Math.floor(availH / layout.rows);

    setWindows((prev) =>
      prev.map((w, i) => ({
        ...w,
        x: (i % layout.cols) * cellW,
        y: Math.floor(i / layout.cols) * cellH,
        width: cellW - 4,
        height: cellH - 4,
        minimized: false,
        zIndex: 100 + i,
      }))
    );
  }, []);

  const closeAll = useCallback(() => {
    setWindows([]);
    setReadyIds(new Set());
  }, []);

  // ── Toolbar & windows UI (memoized to avoid waterfall re-renders) ─────────
  const ManagerUI = useMemo(
    () => (
      <>
        {/* Control toolbar */}
        {windows.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 9999,
              display: "flex",
              gap: 6,
              alignItems: "center",
              background: "#060d1a",
              border: "1px solid #1e3a5f",
              padding: "4px 10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            <span
              style={{
                color: "#3a5a7a",
                fontSize: 8,
                fontFamily: "monospace",
                marginRight: 4,
              }}
            >
              MONITOR
            </span>

            {Object.keys(TILE_LAYOUTS).map((key) => (
              <button
                key={key}
                onClick={() => tileWindows(key)}
                style={{
                  background: "#0a1628",
                  border: "1px solid #1e3a5f",
                  color: "#4fc3f7",
                  fontSize: 8,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "#1e3a5f")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "#0a1628")
                }
                title={`Tile ${key}`}
              >
                {key}
              </button>
            ))}

            <div style={{ width: 1, height: 16, background: "#1e3a5f" }} />

            <button
              onClick={closeAll}
              style={{
                background: "#1a0606",
                border: "1px solid #5f1e1e",
                color: "#ff5252",
                fontSize: 8,
                padding: "3px 8px",
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              ✕ ALL
            </button>

            <span
              style={{
                color: "#4fc3f7",
                fontSize: 8,
                fontFamily: "monospace",
              }}
            >
              {windows.length} OPEN
            </span>

            {/* Loading indicator: show queued count */}
            {readyIds.size < windows.length && (
              <span
                style={{
                  color: "#fbbf24",
                  fontSize: 8,
                  fontFamily: "monospace",
                  animation: "pixelBlink 1s step-end infinite",
                }}
              >
                ⏳ {windows.length - readyIds.size} LOADING…
              </span>
            )}
          </div>
        )}

        {/* Chart windows */}
        {windows.map((win) => (
          <FloatingChartWindow
            key={win.id}
            window={win}
            iframeReady={readyIds.has(win.id)}
            containerId={getContainerId(win.symbol)}
            onClose={closeChart}
            onFocus={focusChart}
            onUpdate={updateChart}
          />
        ))}
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [windows, readyIds, tileWindows, closeAll, closeChart, focusChart, updateChart]
  );

  return {
    windows,
    openChart,
    closeChart,
    ManagerUI,
    hasWindows: windows.length > 0,
  };
}
