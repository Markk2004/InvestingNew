"use client";

// ─────────────────────────────────────────────────────────────
//  RenovateTab — Pixel Office Tycoon Renovation System
//  As the boss/owner, you renovate your office by:
//  1. Picking a floor theme
//  2. Dragging furniture from the shop onto the grid
//  3. Seeing Before/After comparison
//  4. Managing your renovation budget
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from "react";

import { useOffice, PlacedItem, FloorTheme, CATALOG, FLOOR_THEMES, FurnitureItem } from "./OfficeContext";

const CATEGORIES = ["all", "desk", "chair", "lounge", "tech", "plant", "decor"] as const;

const GRID_COLS = 20;
const GRID_ROWS = 12;
const CELL = 36; // px per cell



// ── Grid Canvas ────────────────────────────────────────────────
function OfficeGridCanvas({
  placed,
  theme,
  hoveredCell,
  selectedItem,
  onCellClick,
  onCellHover,
  frame,
}: {
  placed: PlacedItem[];
  theme: FloorTheme;
  hoveredCell: { x: number; y: number } | null;
  selectedItem: FurnitureItem | null;
  onCellClick: (x: number, y: number) => void;
  onCellHover: (x: number, y: number) => void;
  frame: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<Record<string, HTMLCanvasElement>>({});

  useEffect(() => {
    const sheets = ["/furniture.png", "/stylish_modularfurniture.png", "/stylish_room_door_tiles.png"];
    sheets.forEach((path) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const cx = c.getContext("2d")!;
        cx.drawImage(img, 0, 0);
        const d = cx.getImageData(0, 0, c.width, c.height);
        for (let i = 0; i < d.data.length; i += 4) {
          if (d.data[i] > 230 && d.data[i+1] > 230 && d.data[i+2] > 230) d.data[i+3] = 0;
        }
        cx.putImageData(d, 0, 0);
        imgRef.current[path] = c;
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;

    const W = GRID_COLS * CELL;
    const H = GRID_ROWS * CELL;

    ctx.clearRect(0, 0, W, H);

    // Draw floor tiles
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? theme.tile1 : theme.tile2;
        ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 1, CELL - 1);
      }
    }

    // Grid lines
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= GRID_ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
    }
    for (let c = 0; c <= GRID_COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
    }

    // Cyber theme accent grid pulse
    if (theme.id === "cyber") {
      const pulse = 0.15 + 0.08 * Math.sin(frame * 0.04);
      ctx.strokeStyle = `rgba(0,200,255,${pulse})`;
      ctx.lineWidth = 1;
      for (let r = 0; r <= GRID_ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
      }
      for (let c = 0; c <= GRID_COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
      }
    }

    // Draw placed items
    placed.forEach((p) => {
      const item = CATALOG.find((i) => i.id === p.itemId);
      if (!item) return;
      const px = p.gridX * CELL;
      const py = p.gridY * CELL;
      const pw = item.cols * CELL;
      const ph = item.rows * CELL;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(px + 4, py + 4, pw, ph);

      // Draw sprite
      const imgPath = item.sheet || "/furniture.png";
      const img = imgRef.current[imgPath];
      if (img) {
        ctx.save();
        const scaleX = pw / item.sw;
        const scaleY = ph / item.sh;
        const scale = Math.min(scaleX, scaleY);
        const dw = item.sw * scale;
        const dh = item.sh * scale;
        const dx = px + (pw - dw) / 2;
        const dy = py + (ph - dh); // align to bottom of the cell

        if (p.flipped) {
          ctx.translate(dx + dw, dy);
          ctx.scale(-1, 1);
          ctx.drawImage(img, item.sx, item.sy, item.sw, item.sh, 0, 0, dw, dh);
        } else {
          ctx.drawImage(img, item.sx, item.sy, item.sw, item.sh, dx, dy, dw, dh);
        }
        ctx.restore();
      } else {
        // Fallback pixel block
        ctx.fillStyle = item.color;
        ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(px + 2, py + 2, pw - 4, 3);
        ctx.fillStyle = "#60a5fa";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = "center";
        ctx.fillText(item.emoji, px + pw / 2, py + ph / 2 + 3);
        ctx.textAlign = "left";
      }

      // Item border glow
      ctx.strokeStyle = `${theme.accent}80`;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    });

    // Hover ghost
    if (hoveredCell && selectedItem) {
      const px = hoveredCell.x * CELL;
      const py = hoveredCell.y * CELL;
      const pw = selectedItem.cols * CELL;
      const ph = selectedItem.rows * CELL;
      const fits = hoveredCell.x + selectedItem.cols <= GRID_COLS && hoveredCell.y + selectedItem.rows <= GRID_ROWS;
      const isOccupied = placed.some(p => {
        const item = CATALOG.find(i => i.id === p.itemId);
        if (!item) return false;
        return hoveredCell.x < p.gridX + item.cols && hoveredCell.x + selectedItem.cols > p.gridX &&
               hoveredCell.y < p.gridY + item.rows && hoveredCell.y + selectedItem.rows > p.gridY;
      });
      const canPlace = fits && !isOccupied;

      ctx.fillStyle = canPlace ? "rgba(79,195,247,0.2)" : "rgba(255,82,82,0.25)";
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = canPlace ? "#4fc3f7" : "#ff5252";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
      ctx.setLineDash([]);
    }

    // Corner accent markers (boss-style)
    const markerColor = theme.accent;
    [[0,0],[W-8,0],[0,H-8],[W-8,H-8]].forEach(([mx,my]) => {
      ctx.fillStyle = markerColor;
      ctx.fillRect(mx, my, 8, 2);
      ctx.fillRect(mx, my, 2, 8);
    });

  }, [placed, theme, hoveredCell, selectedItem, frame]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / GRID_COLS));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / GRID_ROWS));
    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) onCellHover(x, y);
  }, [onCellHover]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (rect.width / GRID_COLS));
    const y = Math.floor((e.clientY - rect.top) / (rect.height / GRID_ROWS));
    if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) onCellClick(x, y);
  }, [onCellClick]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID_COLS * CELL}
      height={GRID_ROWS * CELL}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={() => onCellHover(-1, -1)}
      style={{
        display: "block",
        imageRendering: "pixelated",
        cursor: selectedItem ? "crosshair" : "default",
        width: "100%",
        height: "100%",
      }}
    />
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function RenovateTab() {
  const {
    budget,
    draftSpent: spent,
    setDraftSpent: setSpent,
    draftPlacedItems: placed,
    setDraftPlacedItems: setPlaced,
    draftTheme: activeTheme,
    setDraftTheme: setActiveTheme,
    confirmRenovation,
    cancelRenovation,
    placedItems: confirmedPlaced,
    activeTheme: confirmedTheme,
  } = useOffice();
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const [filterCat, setFilterCat] = useState<typeof CATEGORIES[number]>("all");
  const [mode, setMode] = useState<"renovate" | "before" | "after">("renovate");
  const [showConfirm, setShowConfirm] = useState(false);
  const [undoStack, setUndoStack] = useState<PlacedItem[][]>([]);
  const [frame, setFrame] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [flipNext, setFlipNext] = useState(false);

  const hasUnsavedChanges =
    JSON.stringify(placed) !== JSON.stringify(confirmedPlaced) ||
    activeTheme.id !== confirmedTheme.id;

  const handleConfirm = () => {
    confirmRenovation();
    setUndoStack([]);
    notify("💾 Layout and theme saved successfully!");
  };

  const handleCancel = () => {
    cancelRenovation();
    setUndoStack([]);
    setSelectedItem(null);
    notify("❌ Reverted to previous layout.");
  };

  // Animation loop
  useEffect(() => {
    let raf: number;
    const loop = () => { setFrame(f => f + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Notify helper
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const remaining = budget - spent;

  const handleCellClick = useCallback((x: number, y: number) => {
    if (!selectedItem) {
      // Try to remove existing item at cell
      const target = placed.find(p => {
        const item = CATALOG.find(i => i.id === p.itemId)!;
        return x >= p.gridX && x < p.gridX + item.cols && y >= p.gridY && y < p.gridY + item.rows;
      });
      if (target) {
        const item = CATALOG.find(i => i.id === target.itemId)!;
        setSpent(s => s - item.cost);
        setUndoStack(stack => [...stack.slice(-9), placed]);
        notify(`🗑️ Removed ${item.name}`);
        setPlaced(prev => prev.filter(p => p.uid !== target.uid));
      }
      return;
    }

    if (x + selectedItem.cols > GRID_COLS || y + selectedItem.rows > GRID_ROWS) {
      notify("⚠️ Doesn't fit here!");
      return;
    }

    const isOccupied = placed.some(p => {
      const item = CATALOG.find(i => i.id === p.itemId);
      if (!item) return false;
      return x < p.gridX + item.cols && x + selectedItem.cols > p.gridX &&
             y < p.gridY + item.rows && y + selectedItem.rows > p.gridY;
    });

    if (isOccupied) {
      notify("⚠️ Space is occupied!");
      return;
    }

    if (selectedItem.cost > remaining) {
      notify("💸 Not enough budget!");
      return;
    }

    setUndoStack(stack => [...stack.slice(-9), placed]);
    const newItem: PlacedItem = {
      uid: `${selectedItem.id}-${Date.now()}`,
      itemId: selectedItem.id,
      gridX: x,
      gridY: y,
      flipped: flipNext,
    };
    setPlaced(prev => [...prev, newItem]);
    setSpent(s => s + selectedItem.cost);
    notify(`✅ Placed ${selectedItem.name} — $${selectedItem.cost.toLocaleString()}`);
  }, [selectedItem, remaining, placed, flipNext]);

  const handleCellHover = useCallback((x: number, y: number) => {
    if (x < 0) setHoveredCell(null);
    else setHoveredCell({ x, y });
  }, []);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    const prevSpent = prev.reduce((acc, p) => {
      const item = CATALOG.find(i => i.id === p.itemId);
      return acc + (item?.cost ?? 0);
    }, 0);
    setPlaced(prev);
    setSpent(prevSpent);
    setUndoStack(s => s.slice(0, -1));
    notify("↩️ Undo");
  };

  const handleBuyTheme = (theme: FloorTheme) => {
    if (theme.id === activeTheme.id) return;
    if (theme.cost > remaining) { notify("💸 Not enough budget for flooring!"); return; }
    const oldCost = activeTheme.cost;
    setSpent(s => s - oldCost + theme.cost);
    setActiveTheme(theme);
    notify(`🏗️ Floor upgraded to ${theme.name}!`);
  };

  const catalogFiltered = filterCat === "all" ? CATALOG : CATALOG.filter(i => i.category === filterCat);

  const displayPlaced = mode === "before" ? confirmedPlaced : placed;
  const displayTheme = mode === "before" ? confirmedTheme : activeTheme;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", flexDirection: "column", background: "#03080f" }}>

      {/* ── Top Toolbar ── */}
      <div style={{
        background: "#060d1a",
        borderBottom: "2px solid #0d2040",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        height: 42,
        flexShrink: 0,
      }}>
        {/* Boss badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>🏢</span>
          <div>
            <div style={{ color: "#fbbf24", fontSize: 8, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 }}>RENOVATION MODE</div>
            <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>CEO Office · Floor 1</div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: "#0d2040" }} />

        {/* View mode toggle */}
        {(["before", "renovate", "after"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              background: mode === m ? (m === "renovate" ? "#1d4ed8" : m === "before" ? "#7c3aed" : "#065f46") : "#0a1628",
              border: `1px solid ${mode === m ? (m === "renovate" ? "#3b82f6" : m === "before" ? "#8b5cf6" : "#059669") : "#1e3a5f"}`,
              color: mode === m ? "#fff" : "#475569",
              fontSize: 8,
              padding: "4px 10px",
              cursor: "pointer",
              fontFamily: "monospace",
              letterSpacing: 1,
              textTransform: "uppercase",
              transition: "all 0.15s",
            }}
          >
            {m === "before" ? "📷 Before" : m === "renovate" ? "🔨 Renovate" : "✨ After"}
          </button>
        ))}

        <div style={{ width: 1, height: 24, background: "#0d2040" }} />

        {/* Flip toggle */}
        <button
          onClick={() => setFlipNext(f => !f)}
          title="Flip next item horizontally"
          style={{
            background: flipNext ? "#3b1a00" : "#0a1628",
            border: `1px solid ${flipNext ? "#f59e0b" : "#1e3a5f"}`,
            color: flipNext ? "#fbbf24" : "#475569",
            fontSize: 8,
            padding: "4px 8px",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          🔄 FLIP
        </button>

        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          style={{
            background: "#0a1628",
            border: "1px solid #1e3a5f",
            color: undoStack.length > 0 ? "#60a5fa" : "#1e3a5f",
            fontSize: 8,
            padding: "4px 8px",
            cursor: undoStack.length > 0 ? "pointer" : "not-allowed",
            fontFamily: "monospace",
          }}
        >
          ↩ UNDO
        </button>

        {/* Clear */}
        <button
          onClick={() => setShowConfirm(true)}
          style={{
            background: "#1c0505",
            border: "1px solid #7f1d1d",
            color: "#ef4444",
            fontSize: 8,
            padding: "4px 8px",
            cursor: "pointer",
            fontFamily: "monospace",
          }}
        >
          🗑 CLEAR ALL
        </button>

        <div style={{ width: 1, height: 24, background: "#0d2040" }} />

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={!hasUnsavedChanges}
          style={{
            background: hasUnsavedChanges ? "#064e3b" : "#0d1a15",
            border: `1px solid ${hasUnsavedChanges ? "#059669" : "#064e3b"}`,
            color: hasUnsavedChanges ? "#34d399" : "#1e3d30",
            fontSize: 8,
            padding: "4px 12px",
            cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
            fontFamily: "monospace",
            fontWeight: "bold",
            letterSpacing: 1,
            boxShadow: hasUnsavedChanges ? "0 0 8px rgba(52,211,153,0.2)" : "none",
            transition: "all 0.15s",
          }}
        >
          💾 CONFIRM
        </button>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          disabled={!hasUnsavedChanges}
          style={{
            background: hasUnsavedChanges ? "#4c1d95" : "#1e1330",
            border: `1px solid ${hasUnsavedChanges ? "#8b5cf6" : "#4c1d95"}`,
            color: hasUnsavedChanges ? "#ddd6fe" : "#3c2e52",
            fontSize: 8,
            padding: "4px 12px",
            cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
            fontFamily: "monospace",
            fontWeight: "bold",
            letterSpacing: 1,
            boxShadow: hasUnsavedChanges ? "0 0 8px rgba(139,92,246,0.2)" : "none",
            transition: "all 0.15s",
          }}
        >
          ❌ CANCEL
        </button>

        <div style={{ flex: 1 }} />

        {/* Budget display */}
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>BUDGET</div>
              <div style={{ color: "#fbbf24", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                ${budget.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>SPENT</div>
              <div style={{ color: "#ef4444", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                ${spent.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>REMAINING</div>
              <div style={{
                color: remaining > 5000 ? "#22c55e" : remaining > 0 ? "#f59e0b" : "#ef4444",
                fontSize: 11, fontFamily: "monospace", fontWeight: 700
              }}>
                ${remaining.toLocaleString()}
              </div>
            </div>
          </div>
          {/* Budget bar */}
          <div style={{ width: 200, height: 4, background: "#040c18", border: "1px solid #0d2040", marginTop: 3, position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${Math.min(100, (spent / budget) * 100)}%`,
              background: spent / budget > 0.9 ? "#ef4444" : spent / budget > 0.7 ? "#f59e0b" : "#22c55e",
              transition: "width 0.3s ease",
            }} />
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Sidebar: Furniture Shop ── */}
        <div style={{
          width: 220,
          background: "#06101e",
          borderRight: "1px solid #0d2040",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {/* Shop header */}
          <div style={{ background: "#040c18", borderBottom: "1px solid #0d2040", padding: "8px 10px" }}>
            <div style={{ color: "#fbbf24", fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2 }}>🛒 FURNITURE SHOP</div>
            <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace", marginTop: 2 }}>
              {selectedItem ? `Selected: ${selectedItem.name}` : "Click item → place on grid"}
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: "4px 6px", background: "#050d1a", borderBottom: "1px solid #0d2040" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                style={{
                  background: filterCat === cat ? "#1d4ed8" : "#0a1628",
                  border: `1px solid ${filterCat === cat ? "#3b82f6" : "#1e3a5f"}`,
                  color: filterCat === cat ? "#93c5fd" : "#475569",
                  fontSize: 7,
                  padding: "2px 5px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Item list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
            {catalogFiltered.map(item => {
              const isSelected = selectedItem?.id === item.id;
              const canAfford = item.cost <= remaining;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(isSelected ? null : item);
                    if (!isSelected && !canAfford) notify("💸 You can't afford this item!");
                  }}
                  style={{
                    background: isSelected ? "rgba(79,195,247,0.12)" : "rgba(4,12,24,0.8)",
                    border: `1px solid ${isSelected ? "#4fc3f7" : canAfford ? "#0d2040" : "#3a1515"}`,
                    color: canAfford ? "#e2e8f0" : "#4a2020",
                    padding: "5px 7px",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                    boxShadow: isSelected ? "0 0 8px rgba(79,195,247,0.3)" : "none",
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>{item.cols}×{item.rows} cells</span>
                      <span style={{ color: canAfford ? "#22c55e" : "#ef4444", fontSize: 7, fontFamily: "monospace", fontWeight: 700 }}>
                        ${item.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ color: "#4fc3f7", fontSize: 8, flexShrink: 0 }}>◀</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Deselect hint */}
          {selectedItem && (
            <div style={{ padding: "6px 8px", background: "rgba(79,195,247,0.06)", borderTop: "1px solid #0d2040" }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  width: "100%", background: "transparent", border: "1px solid #1e3a5f",
                  color: "#60a5fa", fontSize: 8, padding: "4px", cursor: "pointer", fontFamily: "monospace",
                }}
              >
                ✕ Deselect / Remove Mode
              </button>
              <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace", marginTop: 3, textAlign: "center" }}>
                No item selected = click grid to remove
              </div>
            </div>
          )}
        </div>

        {/* ── Center: Grid Canvas ── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Mode banner */}
          {mode !== "renovate" && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
              background: mode === "before" ? "rgba(124,58,237,0.9)" : "rgba(6,95,70,0.9)",
              borderBottom: `2px solid ${mode === "before" ? "#8b5cf6" : "#059669"}`,
              padding: "4px 12px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>{mode === "before" ? "📷" : "✨"}</span>
              <span style={{ color: "#fff", fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2 }}>
                {mode === "before" ? "BEFORE RENOVATION — Original Layout" : "AFTER RENOVATION — Your Design"}
              </span>
            </div>
          )}

          {/* The actual canvas grid */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 12, overflow: "hidden" }}>
            <div style={{
              position: "relative",
              border: `2px solid ${displayTheme.accent}`,
              boxShadow: `0 0 20px ${displayTheme.accent}40, 0 0 40px ${displayTheme.accent}20`,
              imageRendering: "pixelated",
              maxWidth: "100%",
              maxHeight: "100%",
              aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
            }}>
              <OfficeGridCanvas
                placed={displayPlaced}
                theme={displayTheme}
                hoveredCell={mode === "renovate" ? hoveredCell : null}
                selectedItem={mode === "renovate" ? selectedItem : null}
                onCellClick={mode === "renovate" ? handleCellClick : () => {}}
                onCellHover={mode === "renovate" ? handleCellHover : () => {}}
                frame={frame}
              />

              {/* CRT scanline overlay */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)",
              }} />

              {/* Room label */}
              <div style={{
                position: "absolute", top: 4, left: 4,
                background: "rgba(0,0,0,0.7)",
                border: `1px solid ${displayTheme.accent}`,
                padding: "2px 6px",
              }}>
                <span style={{ color: displayTheme.accent, fontSize: 7, fontFamily: "monospace", letterSpacing: 1 }}>
                  {mode === "before" ? "ORIGINAL OFFICE" : mode === "after" ? "RENOVATED OFFICE" : "CEO OFFICE · FLOOR 1"}
                </span>
              </div>

              {/* Placed count */}
              <div style={{
                position: "absolute", bottom: 4, left: 4,
                background: "rgba(0,0,0,0.7)",
                border: `1px solid ${displayTheme.accent}40`,
                padding: "2px 6px",
              }}>
                <span style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>
                  {displayPlaced.length} items placed
                </span>
              </div>
            </div>
          </div>

          {/* Bottom hint bar */}
          <div style={{
            background: "#040c18",
            borderTop: "1px solid #0d2040",
            padding: "4px 12px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 28,
            flexShrink: 0,
          }}>
            <span style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace" }}>
              {selectedItem
                ? `🖱️ Click to place ${selectedItem.name} (${selectedItem.cols}×${selectedItem.rows}) — $${selectedItem.cost.toLocaleString()}`
                : "🖱️ Select furniture from shop, then click grid to place · Click empty grid to remove items"}
            </span>
          </div>
        </div>

        {/* ── Right Sidebar: Floor Themes + Stats ── */}
        <div style={{
          width: 200,
          background: "#06101e",
          borderLeft: "1px solid #0d2040",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {/* Flooring header */}
          <div style={{ background: "#040c18", borderBottom: "1px solid #0d2040", padding: "8px 10px" }}>
            <div style={{ color: "#c084fc", fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: 2 }}>🪟 FLOORING</div>
            <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace", marginTop: 2 }}>Active: {activeTheme.name}</div>
          </div>

          <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            {FLOOR_THEMES.map(theme => {
              const isActive = activeTheme.id === theme.id;
              const canAfford = theme.cost <= remaining || isActive;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleBuyTheme(theme)}
                  style={{
                    background: isActive ? "rgba(192,132,252,0.12)" : "rgba(4,12,24,0.8)",
                    border: `1px solid ${isActive ? "#c084fc" : "#0d2040"}`,
                    padding: "6px 8px",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.15s",
                  }}
                >
                  {/* Tile preview */}
                  <div style={{ width: 24, height: 24, flexShrink: 0, position: "relative", border: "1px solid #1e3a5f" }}>
                    {[[0,0],[12,0],[0,12],[12,12]].map(([ox,oy],i) => (
                      <div key={i} style={{
                        position: "absolute", left: ox, top: oy, width: 12, height: 12,
                        background: i % 2 === 0 ? theme.tile1 : theme.tile2,
                      }} />
                    ))}
                    <div style={{ position: "absolute", inset: 0, border: `1px solid ${theme.accent}40` }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: isActive ? "#c084fc" : canAfford ? "#e2e8f0" : "#4a2020", fontSize: 8, fontFamily: "monospace", fontWeight: 700 }}>
                      {theme.name}
                    </div>
                    <div style={{ color: isActive ? "#6b21a8" : "#475569", fontSize: 7, fontFamily: "monospace" }}>
                      {isActive ? "✓ Active" : theme.cost === 0 ? "Free" : `$${theme.cost.toLocaleString()}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid #0d2040", padding: "6px 10px" }}>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 2, fontFamily: "monospace", marginBottom: 6 }}>RENOVATION STATS</div>

            {[
              { label: "Items Placed", value: placed.length, unit: "items" },
              { label: "Floor Theme", value: activeTheme.name, unit: "" },
              { label: "Reno Score", value: Math.min(100, placed.length * 8 + (activeTheme.cost > 0 ? 20 : 0)), unit: "/100" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "#040c18",
                border: "1px solid #0d2040",
                padding: "4px 6px",
                marginBottom: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>{stat.label}</span>
                <span style={{ color: "#60a5fa", fontSize: 8, fontFamily: "monospace", fontWeight: 700 }}>
                  {stat.value}{stat.unit}
                </span>
              </div>
            ))}

            {/* Reno score bar */}
            {(() => {
              const score = Math.min(100, placed.length * 8 + (activeTheme.cost > 0 ? 20 : 0));
              return (
                <div style={{ marginTop: 6 }}>
                  <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace", marginBottom: 3 }}>
                    PRESTIGE: {score < 30 ? "Basic" : score < 60 ? "Modern" : score < 85 ? "Premium" : "EXECUTIVE ★"}
                  </div>
                  <div style={{ height: 8, background: "#040c18", border: "1px solid #0d2040", position: "relative", overflow: "hidden" }}>
                    <div style={{
                      position: "absolute", left: 0, top: 0, height: "100%",
                      width: `${score}%`,
                      background: score < 30 ? "#1e3a5f" : score < 60 ? "#1d4ed8" : score < 85 ? "#7c3aed" : "#fbbf24",
                      transition: "width 0.5s ease",
                      boxShadow: score >= 85 ? "0 0 6px #fbbf24" : "none",
                    }} />
                    {[25,50,75].map(m => (
                      <div key={m} style={{ position: "absolute", left: `${m}%`, top: 0, width: 1, height: "100%", background: "#060d1a" }} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Activity log */}
          <div style={{ flex: 1, borderTop: "1px solid #0d2040", padding: "6px 8px", overflow: "hidden" }}>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 2, fontFamily: "monospace", marginBottom: 4 }}>PLACED ITEMS</div>
            <div style={{ overflowY: "auto", height: "calc(100% - 20px)", display: "flex", flexDirection: "column", gap: 2 }}>
              {placed.length === 0 ? (
                <div style={{ color: "#1e3a5f", fontSize: 7, fontFamily: "monospace", textAlign: "center", marginTop: 8 }}>
                  No items placed yet
                </div>
              ) : (
                [...placed].reverse().map(p => {
                  const item = CATALOG.find(i => i.id === p.itemId)!;
                  return (
                    <div key={p.uid} style={{ background: "#040c18", borderLeft: "2px solid #1e3a5f", padding: "2px 4px" }}>
                      <div style={{ color: "#e2e8f0", fontSize: 7, fontFamily: "monospace" }}>
                        {item.emoji} {item.name}
                      </div>
                      <div style={{ color: "#22c55e", fontSize: 6, fontFamily: "monospace" }}>
                        ${item.cost.toLocaleString()} · ({p.gridX},{p.gridY})
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Notification Toast ── */}
      {notification && (
        <div style={{
          position: "fixed",
          bottom: 40,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#060d1a",
          border: "1px solid #1e3a5f",
          padding: "8px 18px",
          color: "#e2e8f0",
          fontSize: 9,
          fontFamily: "monospace",
          letterSpacing: 1,
          zIndex: 1000,
          boxShadow: "0 0 20px rgba(79,195,247,0.3)",
          animation: "pixelFadeIn 0.2s ease-out",
          whiteSpace: "nowrap",
        }}>
          {notification}
        </div>
      )}

      {/* ── Clear Confirm Modal ── */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#060d1a",
            border: "2px solid #ef4444",
            padding: "24px 28px",
            textAlign: "center",
            boxShadow: "0 0 30px rgba(239,68,68,0.3)",
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: "#ef4444", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 4 }}>CLEAR ALL FURNITURE?</div>
            <div style={{ color: "#475569", fontSize: 8, fontFamily: "monospace", marginBottom: 16 }}>
              This will remove all {placed.length} placed items<br />and refund ${spent.toLocaleString()} to your budget.
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => { setPlaced([]); setSpent(0); setUndoStack([]); setShowConfirm(false); notify("🗑️ All items cleared"); }}
                style={{ background: "#7f1d1d", border: "1px solid #ef4444", color: "#fca5a5", fontSize: 9, padding: "6px 16px", cursor: "pointer", fontFamily: "monospace" }}
              >
                CONFIRM CLEAR
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ background: "#0a1628", border: "1px solid #1e3a5f", color: "#60a5fa", fontSize: 9, padding: "6px 16px", cursor: "pointer", fontFamily: "monospace" }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
