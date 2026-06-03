"use client";

// ─────────────────────────────────────────────────────────────
//  OfficeTab — Office Overview tab content
//  Wraps the existing canvas-based PixelTradeNightOffice and adds
//  a live 12-share portfolio HUD on the right sidebar.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import CharacterSprite from "@/components/CharacterSprite";
import { useOffice, CATALOG, PlacedItem, FloorTheme } from "@/components/OfficeContext";

// ── Types ──────────────────────────────────────────────────────────────────────
type AgentAction = "idle" | "typing" | "walking" | "thinking";
interface Agent {
  name: string; role: string; x: number; y: number;
  tx: number; ty: number; action: AgentAction; color: string; t: number;
}
interface Zone { label: string; x: number; y: number; w: number; h: number; }

const W = 900, H = 560;

// ── Portfolio Data ─────────────────────────────────────────────────────────────
const INITIAL_PORTFOLIO = [
  { sym: "AAPL", price: 182.30, qty: 5, cost: 165.00 },
  { sym: "NVDA", price: 875.20, qty: 2, cost: 790.00 },
  { sym: "MSFT", price: 415.60, qty: 3, cost: 380.00 },
  { sym: "GOOG", price: 172.40, qty: 4, cost: 155.00 },
  { sym: "AMZN", price: 184.70, qty: 3, cost: 170.00 },
  { sym: "TSLA", price: 178.90, qty: 2, cost: 200.00 },
  { sym: "META", price: 492.10, qty: 2, cost: 450.00 },
  { sym: "TSM", price: 152.30, qty: 4, cost: 140.00 },
  { sym: "INTC", price: 30.20, qty: 8, cost: 38.00 },
  { sym: "AMD", price: 158.40, qty: 3, cost: 145.00 },
  { sym: "PLTR", price: 23.80, qty: 10, cost: 20.00 },
  { sym: "COIN", price: 212.50, qty: 1, cost: 195.00 },
];

const INITIAL_AGENTS: Agent[] = [
  { name: "Mark", role: "trader", x: 220, y: 320, tx: 220, ty: 320, action: "idle", color: "#a8d8ea", t: 0 },
  { name: "Gemini", role: "quant", x: 460, y: 360, tx: 460, ty: 360, action: "typing", color: "#f9c784", t: 0 },
  { name: "NewInvester", role: "analyst", x: 490, y: 450, tx: 490, ty: 450, action: "walking", color: "#b0e0a8", t: 0 },
];

const ZONES: Zone[] = [
  { label: "R&D", x: 270, y: 295, w: 130, h: 80 },
  { label: "TRADING", x: 195, y: 490, w: 90, h: 50 },
  { label: "ANALYTICS", x: 295, y: 475, w: 100, h: 50 },
  { label: "SIGNALS", x: 490, y: 495, w: 95, h: 50 },
  { label: "DEALS", x: 770, y: 278, w: 80, h: 55 },
  { label: "MACRO", x: 580, y: 155, w: 60, h: 40 },
  { label: "SEARCH", x: 800, y: 445, w: 65, h: 40 },
];



// ── Drawing helpers ────────────────────────────────────────────────────────────
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, alpha = 1) {
  ctx.globalAlpha = alpha; ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1;
}

function drawFloor(ctx: CanvasRenderingContext2D, theme: FloorTheme) {
  px(ctx, 0, 0, W, H, theme.bg);
  for (let row = 0; row < 14; row++) {
    for (let col = 0; col < 18; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? theme.tile1 : theme.tile2;
      ctx.fillRect(col * 52, 178 + row * 22, 52, 22);
    }
  }
  ctx.strokeStyle = theme.border; ctx.lineWidth = 0.5;
  for (let row = 0; row < 14; row++) { ctx.beginPath(); ctx.moveTo(0, 178 + row * 22); ctx.lineTo(W, 178 + row * 22); ctx.stroke(); }
  for (let col = 0; col < 18; col++) { ctx.beginPath(); ctx.moveTo(col * 52, 178); ctx.lineTo(col * 52, H); ctx.stroke(); }
}

function drawWall(ctx: CanvasRenderingContext2D, frame: number) {
  px(ctx, 0, 0, W, 182, "#071120");
  px(ctx, 0, 0, W, 8, "#030810");
  [90, 230, 390, 560, 720, 860].forEach(x => {
    px(ctx, x - 28, 4, 56, 6, "#0d1f35");
    const sc = 0.8 + 0.2 * Math.sin(frame * 0.04 + x * 0.01);
    ctx.fillStyle = `rgba(200,225,255,${0.75 * sc})`; ctx.fillRect(x - 26, 6, 52, 3);
  });
  px(ctx, 547, 15, 206, 136, "#0a1f3a");
  px(ctx, 550, 18, 200, 130, "#060f1e");
  px(ctx, 547, 81, 206, 4, "#0d2040");
  px(ctx, 648, 15, 4, 136, "#0d2040");
  const silBlds = [[554, 48, 16, 80], [572, 30, 18, 98], [592, 52, 12, 76], [606, 34, 14, 94], [624, 46, 16, 82], [642, 22, 20, 106], [666, 40, 14, 88], [682, 62, 12, 66], [698, 32, 16, 96], [716, 50, 14, 78]];
  silBlds.forEach(([bx, by, bw, bh]) => px(ctx, bx, by, bw, bh, "#030810"));
  [[558, 58, "#fbbf24"], [576, 40, "#93c5fd"], [596, 64, "#fff"], [612, 45, "#fde68a"], [630, 35, "#93c5fd"],
  [646, 55, "#fbbf24"], [668, 50, "#fff"], [684, 72, "#fde68a"], [702, 44, "#93c5fd"], [718, 62, "#fbbf24"]].forEach(([lx, ly, lc], i) => {
    ctx.fillStyle = lc as string; ctx.globalAlpha = 0.4 + 0.5 * Math.sin(frame * 0.08 + i * 1.3);
    ctx.fillRect(lx as number, ly as number, 2, 2); ctx.globalAlpha = 1;
  });
  ctx.fillStyle = "#cce0ff"; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(707, 32, 8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = "#060f1e"; ctx.beginPath(); ctx.arc(704, 30, 7, 0, Math.PI * 2); ctx.fill();
  [88, 298, 500, 750, 855].forEach(lx => {
    px(ctx, lx - 1, 10, 3, 30, "#0d1f35");
    px(ctx, lx - 6, 38, 13, 4, "#0d1f35");
    const lg = 0.7 + 0.3 * Math.sin(frame * 0.06 + lx);
    ctx.fillStyle = `rgba(255,190,80,${lg * 0.9})`; ctx.beginPath(); ctx.ellipse(lx + 0.5, 40, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,190,80,${lg * 0.05})`; ctx.beginPath(); ctx.ellipse(lx + 0.5, 55, 24, 28, 0, 0, Math.PI * 2); ctx.fill();
  });
}

function drawMarketBoard(ctx: CanvasRenderingContext2D) {
  const bx = 68, by = 22, bw = 190, bh = 145;
  px(ctx, bx, by, bw, bh, "#030c1a"); px(ctx, bx, by, bw, 2, "#1e3a5f");
  ctx.fillStyle = "#0a1a35"; ctx.fillRect(bx, by + 2, bw, bh - 2);
  ctx.fillStyle = "#5ba3f5"; ctx.font = "bold 7px monospace"; ctx.fillText("LIVE MARKET", bx + 8, by + 14);
  [["AAPL", "▲ +1.2%", "#22c55e"], ["MSFT", "▲ +0.9%", "#22c55e"], ["GOOG", "▼ -0.4%", "#ef4444"],
  ["NVDA", "▲ +2.1%", "#22c55e"], ["TSLA", "▼ -1.8%", "#ef4444"]].forEach(([sym, chg, col], i) => {
    ctx.fillStyle = "#3b82f6"; ctx.font = "6px monospace"; ctx.fillText(sym as string, bx + 8, by + 30 + i * 16);
    ctx.fillStyle = col as string; ctx.fillText(chg as string, bx + 48, by + 30 + i * 16);
  });
  const cx = bx + 100, cy = by + 20, cw = 82, ch = 110;
  px(ctx, cx, cy, cw, ch, "#040c18");
  ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 1.5; ctx.beginPath();
  [80, 72, 78, 65, 70, 58, 62, 50, 55, 48, 52, 44, 50, 42, 46, 38, 44, 36].forEach((v, i) => {
    const px2 = cx + 2 + i * (cw - 4) / 17, py2 = cy + ch - 4 - v;
    if (i > 0) { ctx.lineTo(px2, py2); } else { ctx.moveTo(px2, py2); }
  });
  ctx.stroke();
}

// ── Chroma-key: strip white (#fff) background from sprite sheet ───────────────
function createTransparentImage(src: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.naturalWidth; c.height = src.naturalHeight;
  const cx = c.getContext("2d")!;
  cx.drawImage(src, 0, 0);
  const d = cx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < d.data.length; i += 4) {
    if (d.data[i] > 240 && d.data[i + 1] > 240 && d.data[i + 2] > 240) d.data[i + 3] = 0;
  }
  cx.putImageData(d, 0, 0);
  return c;
}

function drawFurniture(
  ctx: CanvasRenderingContext2D,
  _frame: number,
  sheets: Record<string, HTMLCanvasElement>,
  placed: PlacedItem[]
) {
  function spr(img: HTMLCanvasElement | null, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, scale: number, flip: boolean = false) {
    if (img) {
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      if (flip) {
        ctx.translate(dx + sw * scale, dy);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, Math.round(sw * scale), Math.round(sh * scale));
      } else {
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, Math.round(sw * scale), Math.round(sh * scale));
      }
      ctx.restore();
    }
  }

  // Dynamically draw placed items mapping Grid (20x12) -> OfficeTab Canvas
  placed.forEach(p => {
    const item = CATALOG.find(i => i.id === p.itemId);
    if (!item) return;
    const dx = p.gridX * 45;
    const dy = 178 + p.gridY * 31.8;
    // slightly scale up or down depending on item
    const scale = item.category === "decor" ? 2.2 : 2.15;
    const imgPath = item.sheet || "/furniture.png";
    const img = sheets[imgPath];

    spr(img, item.sx, item.sy, item.sw, item.sh, dx, dy, scale, p.flipped);
  });
}



function drawZones(ctx: CanvasRenderingContext2D) {
  ZONES.forEach(z => {
    ctx.strokeStyle = "rgba(59,130,246,0.35)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    ctx.strokeRect(z.x, z.y, z.w, z.h); ctx.setLineDash([]);
    ctx.fillStyle = "#040c18"; ctx.globalAlpha = 0.7; ctx.fillRect(z.x + 2, z.y + 2, z.w - 4, 10); ctx.globalAlpha = 1;
    ctx.fillStyle = "#60a5fa"; ctx.font = "bold 6px monospace"; ctx.fillText(z.label, z.x + 4, z.y + 10);
  });
}

function drawAgent(ctx: CanvasRenderingContext2D, a: unknown, frame: number, outfit: unknown = {}) {
  const S = 2.4, ox = (a as Agent).x, oy = (a as Agent).y;
  const bob = (a as Agent).action === "typing" ? (frame % 2) * 0.5 : 0;
  ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(ox + 8 * S, oy + 28 * S, 10 * S, 3 * S, 0, 0, Math.PI * 2); ctx.fill();
  function r(x: number, y: number, w: number, h: number, c: string, al = 1) {
    ctx.globalAlpha = al; ctx.fillStyle = c; ctx.fillRect(ox + x * S, oy + y * S + bob, w * S, h * S); ctx.globalAlpha = 1;
  }
  const lw = Math.sin(frame * 0.15); const lleg = (a as Agent).action === "walking" ? lw * 3 : 0, rleg = (a as Agent).action === "walking" ? -lw * 3 : 0;
  r(4 + lleg / 3, 18, 5, 7, "#0d1f35"); r(9 + rleg / 3, 18, 5, 7, "#0d1f35");
  r(3, 22, 5, 5, "#030810"); r(8, 22, 5, 5, "#030810");

  // Shirt/Suit
  let shirtColor = (a as Agent).color;
  if ((outfit as Record<string, string>).shirt === "tee-gray") shirtColor = "#4a5568";
  else if ((outfit as Record<string, string>).shirt === "hoodie-green") shirtColor = "#276749";
  r(4, 11, 9, 8, shirtColor, 0.9);
  r(4, 10, 9, 2, "#1a3a6e"); // collar / belt line

  // Hands & Face
  r(3, 12, 2, 5, "#d4956a"); r(13, 12, 2, 5, "#d4956a");
  r(6, 4, 6, 6, "#d4956a"); r(6, 2, 6, 3, "#1a0a00"); // face & hair

  // Hat
  if ((outfit as Record<string, string>).hat === "tophat") {
    r(4, 2, 10, 1.5, "#1a1a2e"); // brim
    r(5.5, -4, 7, 6, "#1a1a2e"); // crown
    r(5.5, 1, 7, 1, "#4c1d95"); // purple band
  } else if ((outfit as Record<string, string>).hat === "wizard") {
    r(4, 2, 10, 1.5, "#4c1d95"); // brim
    r(6, -2, 6, 4, "#4c1d95");
    r(7, -5, 4, 3, "#4c1d95");
    r(8, -8, 2, 3, "#7c3aed");
  } else if ((outfit as Record<string, string>).hat === "cap-red") {
    r(5, 1, 8, 1.5, "#991b1b");
    r(6, -0.5, 6, 2.5, "#ef4444");
  } else if ((outfit as Record<string, string>).hat === "cap-blue") {
    r(5, 1, 8, 1.5, "#1e3a8a");
    r(6, -0.5, 6, 2.5, "#3b82f6");
  } else if ((outfit as Record<string, string>).hat === "none") {
    // No hat
  } else {
    // Default cap fallback
    r(5, 1, 8, 1.5, "#0b2046"); r(6, -0.5, 6, 2.5, (a as Agent).color);
  }

  // Eyebrows & Eyes & Smirk (default face details)
  r(7, 6, 2, 2, "#1a0a00"); r(9, 6, 2, 2, "#ffffff"); r(8, 9, 4, 1, "#a0604a");

  // Accessories
  if ((outfit as Record<string, string>).accessory === "glasses") {
    r(6.5, 5, 5, 0.8, "#3b82f6"); r(7, 5.5, 1.8, 1.8, "#00f0ff", 0.6); r(9.2, 5.5, 1.8, 1.8, "#00f0ff", 0.6);
  } else if ((outfit as Record<string, string>).accessory === "sunglasses") {
    r(6.5, 5, 5, 0.8, "#d97706"); r(7, 5.5, 1.8, 1.8, "#1a0a00", 0.9); r(9.2, 5.5, 1.8, 1.8, "#1a0a00", 0.9);
  } else if ((outfit as Record<string, string>).accessory === "bow") {
    r(7, 10.5, 4, 2, "#dc2626");
    r(8.5, 10.5, 1, 2, "#991b1b");
  }

  // Name tag
  ctx.fillStyle = "#93c5fd"; ctx.font = `bold ${Math.round(5 * S)}px monospace`; ctx.textAlign = "center";
  ctx.fillText((a as Agent).name, ox + 8 * S, oy - 4); ctx.textAlign = "left";

  // Typing or thinking indicators
  if ((a as Agent).action === "typing") { ctx.fillStyle = "rgba(147,197,253,0.8)"; ctx.font = "5px monospace"; ctx.textAlign = "center"; ctx.fillText("⌨", ox + 8 * S, oy - 12); ctx.textAlign = "left"; }
  if ((a as Agent).action === "thinking") {
    ctx.fillStyle = "rgba(147,197,253,0.5)"; ctx.beginPath(); ctx.arc(ox + 22, oy - 8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ox + 26, oy - 14, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#93c5fd"; ctx.font = "6px monospace"; ctx.textAlign = "center"; ctx.fillText("...", ox + 26, oy - 11); ctx.textAlign = "left";
  }

  // Particle Effects
  if ((outfit as Record<string, string>).effect === "aura") {
    ctx.strokeStyle = "rgba(167,139,250,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ox + 8 * S, oy + 12 * S + bob, 12 * S, 0, Math.PI * 2);
    ctx.stroke();
  } else if ((outfit as Record<string, string>).effect === "sparkle") {
    ctx.fillStyle = "rgba(251,191,36,0.8)";
    ctx.fillRect(ox + Math.sin(frame * 0.1) * 12 + 6 * S, oy - 10 + Math.cos(frame * 0.15) * 10, 2, 2);
    ctx.fillRect(ox - Math.sin(frame * 0.12) * 12 + 10 * S, oy - 5 + Math.sin(frame * 0.1) * 8, 2, 2);
  }
}

function moveAgent(a: Agent, speed: number) {
  if (a.action === "walking") {
    const dx = a.tx - a.x, dy = a.ty - a.y, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) { a.x = a.tx; a.y = a.ty; a.action = (["idle", "typing", "thinking", "idle"] as AgentAction[])[Math.floor(Math.random() * 4)]; }
    else { a.x += dx / dist * 1.2 * speed; a.y += dy / dist * 1.2 * speed; }
  }
  a.t++;
  if (a.t > 300 + Math.random() * 300) {
    a.t = 0;
    if (Math.random() < 0.3) {
      a.action = "walking";
      const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
      a.tx = zone.x + zone.w / 2 + Math.random() * 20 - 10;
      a.ty = Math.max(220, Math.min(520, zone.y + zone.h / 2 + Math.random() * 20 - 10));
    } else {
      a.action = (["idle", "typing", "thinking"] as AgentAction[])[Math.floor(Math.random() * 3)];
    }
  }
}

// ── Portfolio Share Row ────────────────────────────────────────────────────────

interface ShareRow {
  sym: string;
  price: number;
  qty: number;
  cost: number;
  prevPrice: number;
}

function ShareLine({ share }: { share: ShareRow }) {
  const pnl = (share.price - share.cost) * share.qty;
  const pct = ((share.price - share.cost) / share.cost * 100).toFixed(1);
  const up = share.price >= share.prevPrice;
  const changed = share.price !== share.prevPrice;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 46px",
        alignItems: "center",
        padding: "2px 6px",
        background: "#040c18",
        borderLeft: `2px solid ${pnl >= 0 ? "#22c55e" : "#ef4444"}`,
        gap: 4,
        marginBottom: 1,
      }}
    >
      <span style={{ color: "#60a5fa", fontSize: 8, fontFamily: "monospace", letterSpacing: 0.5 }}>
        {share.sym}
      </span>
      <span
        className={changed ? (up ? "animate-tick-up" : "animate-tick-down") : ""}
        style={{
          color: up ? "#22c55e" : "#ef4444",
          fontSize: 8,
          fontFamily: "monospace",
          textAlign: "right",
          fontWeight: 700,
        }}
      >
        ${share.price.toFixed(2)}
      </span>
      <span style={{ color: pnl >= 0 ? "#22c55e" : "#ef4444", fontSize: 7, fontFamily: "monospace", textAlign: "right" }}>
        {pnl >= 0 ? "+" : ""}{pct}%
      </span>
    </div>
  );
}

// ── Main OfficeTab Component ───────────────────────────────────────────────────

export default function OfficeTab({ outfits = {} }: { outfits?: Record<string, unknown> }) {
  const router = useRouter();
  const { placedItems, activeTheme } = useOffice();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const agentsRef = useRef<Agent[]>(INITIAL_AGENTS.map(a => ({ ...a })));
  const frameRef = useRef(0);
  const sheetsRef = useRef<Record<string, HTMLCanvasElement>>({});
  const speedRef = useRef(1);
  const [speed, setSpeedState] = useState(1);
  const [balance, setBalance] = useState(70.80);
  const [pnl, setPnl] = useState(875);
  const [clock, setClock] = useState("Night 1 · 23:44");
  const [shares, setShares] = useState<ShareRow[]>(
    INITIAL_PORTFOLIO.map(s => ({ ...s, prevPrice: s.price }))
  );
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS.map(a => ({ ...a })));
  const [frame, setFrame] = useState(0);

  const placedRef = useRef(placedItems);
  const themeRef = useRef(activeTheme);

  useEffect(() => { placedRef.current = placedItems; }, [placedItems]);
  useEffect(() => { themeRef.current = activeTheme; }, [activeTheme]);

  const outfitsRef = useRef(outfits);
  useEffect(() => {
    outfitsRef.current = outfits;
  }, [outfits]);

  // Load + chroma-key all furniture sprite sheets
  useEffect(() => {
    const paths = ["/furniture.png", "/stylish_modularfurniture.png", "/stylish_room_door_tiles.png"];
    paths.forEach(path => {
      const img = new Image();
      img.src = path;
      img.crossOrigin = "anonymous";
      img.onload = () => { sheetsRef.current[path] = createTransparentImage(img); };
    });
  }, []);

  const setSpeed = (s: number) => { speedRef.current = s; setSpeedState(s); };

  // Clock
  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date();
      setClock(`Night 1 · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  // Live price fluctuations
  useEffect(() => {
    const iv = setInterval(() => {
      setShares(prev => prev.map(s => {
        const delta = (Math.random() - 0.48) * (s.price * 0.005);
        const newPrice = Math.max(0.01, parseFloat((s.price + delta).toFixed(2)));
        return { ...s, prevPrice: s.price, price: newPrice };
      }));
      const balanceDelta = parseFloat(((Math.random() - 0.4) * 1.5).toFixed(2));
      setBalance(b => parseFloat((b + balanceDelta).toFixed(2)));
      setPnl(p => p + Math.round((Math.random() - 0.4) * 50));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    let raf: number;
    const loop = () => {
      for (let s = 0; s < speedRef.current; s++) {
        frameRef.current++;
        agentsRef.current.forEach(a => moveAgent(a, speedRef.current));
      }
      const f = frameRef.current;
      ctx.clearRect(0, 0, W, H);
      drawFloor(ctx, themeRef.current);
      drawWall(ctx, f);
      drawMarketBoard(ctx);
      drawFurniture(ctx, f, sheetsRef.current, placedRef.current);


      // Sync React state with the animated positions and frame
      setAgents(agentsRef.current.map(a => ({ ...a })));
      setFrame(f);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    if (my < 190) return;
    let closest: Agent | null = null, minD = 9999;
    agentsRef.current.forEach(a => { const d = Math.hypot(a.x - mx, a.y - my); if (d < minD) { minD = d; closest = a; } });
    if (closest) { (closest as Agent).action = "walking"; (closest as Agent).tx = mx; (closest as Agent).ty = Math.max(220, Math.min(520, my)); }
  }, []);

  const avgCost = 55.07;
  const totalPnl = shares.reduce((acc, s) => acc + (s.price - s.cost) * s.qty, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Sub-toolbar */}
      <div style={{ background: "#060d1a", borderBottom: "1px solid #0d2040", display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", height: 32, flexShrink: 0 }}>
        <div style={{ flex: 1, color: "#3b82f6", fontSize: 9, lineHeight: 1.4 }}>THE FLOOR · 3 AGENTS<br />1 working · 1 walking</div>
        <div style={{ color: "#e2e8f0", fontSize: 10, background: "#0a1628", border: "1px solid #1e3a5f", padding: "2px 8px" }}>{clock}</div>
        <div style={{ color: "#f59e0b", fontSize: 9, background: "#1c1005", border: "1px solid #92400e", padding: "2px 6px" }}>⚠ NIGHT MODE</div>
        {[1, 2, 4].map(s => (
          <button key={s} onClick={() => setSpeed(s)} style={{ background: speed === s ? "#1d4ed8" : "#0a1628", border: "1px solid #1e3a5f", color: "#60a5fa", fontSize: 9, padding: "2px 5px", cursor: "pointer" }}>{s}x</button>
        ))}
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Canvas */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <canvas
            ref={canvasRef}
            width={W} height={H}
            onClick={handleClick}
            style={{ display: "block", imageRendering: "pixelated", cursor: "crosshair", width: "100%", height: "100%" }}
          />

          {/* React-rendered high-fidelity Agents wearing their customized outfits */}
          {agents.map(a => {
            const outfit = outfits[a.name] || {};
            const state = a.action === "typing" ? "working" : a.action === "thinking" ? "shocked" : "idle";
            const flip = a.tx < a.x;
            return (
              <div
                key={a.name}
                style={{
                  position: "absolute",
                  left: `${(a.x / W) * 100}%`,
                  top: `${(a.y / H) * 100}%`,
                  transform: "translate(-50%, -100%)",
                  pointerEvents: "none",
                  zIndex: Math.round(a.y),
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                {/* Name tag */}
                <div
                  style={{
                    color: "#93c5fd",
                    fontSize: 10,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    background: "rgba(3,8,16,0.85)",
                    border: "1px solid #1e3a5f",
                    padding: "2px 6px",
                    borderRadius: 2,
                    marginBottom: 3,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {a.name}
                </div>

                {/* Typing / Thinking bubbles */}
                {a.action === "typing" && (
                  <div style={{ color: "#22c55e", fontSize: 8, lineHeight: 1, textShadow: "0 0 4px #22c55e", animation: "equipPulse 0.5s infinite alternate", marginBottom: 1 }}>⌨</div>
                )}
                {a.action === "thinking" && (
                  <div style={{ color: "#fbbf24", fontSize: 8, lineHeight: 1, textShadow: "0 0 4px #fbbf24", animation: "equipPulse 0.5s infinite alternate", marginBottom: 1 }}>...</div>
                )}

                <CharacterSprite
                  character="newinvester"
                  state={state}
                  isWalking={a.action === "walking"}
                  frame={frame}
                  outfit={outfit}
                  flip={flip}
                  style={{ height: 80 }}
                />
              </div>
            );
          })}

          {/* CRT overlay */}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)", pointerEvents: "none" }} />
        </div>

        {/* Right Sidebar */}
        <div style={{ width: 210, background: "#06101e", borderLeft: "1px solid #0d2040", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
          {/* Portfolio Header */}
          <div style={{ background: "#040c18", borderBottom: "1px solid #0d2040", padding: "6px 8px" }}>
            <div style={{ color: "#60a5fa", fontSize: 8, letterSpacing: 2, fontFamily: "monospace" }}>◈ LIVE PORTFOLIO</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <div>
                <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>AVG COST</div>
                <div style={{ color: "#e2e8f0", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>${avgCost.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>BALANCE</div>
                <div style={{ color: "#22c55e", fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>${balance.toFixed(2)}</div>
              </div>
            </div>
            <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <div style={{ color: "#475569", fontSize: 7, fontFamily: "monospace" }}>12 ACTIVE SHARES</div>
              <div style={{ color: totalPnl >= 0 ? "#22c55e" : "#ef4444", fontSize: 7, fontFamily: "monospace" }}>
                P&L {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Shares list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 2px" }}>
            {shares.map(s => <ShareLine key={s.sym} share={s} />)}
          </div>

          {/* Activity Log */}
          <div style={{ borderTop: "1px solid #0d2040", padding: "4px 6px" }}>
            <div style={{ color: "#1e3a5f", fontSize: 7, letterSpacing: 2, fontFamily: "monospace", marginBottom: 3 }}>ACTIVITY LOG</div>
            {[
              { t: "buy", title: "New LONG signal on GOOG", sub: "Iris · 12:02 PM" },
              { t: "info", title: "Focus recharged", sub: "Otis · 11:56 AM" },
              { t: "sell", title: "SELL SPY @ $282.84 +$253", sub: "Mara · 11:58 AM" },
            ].map((item, i) => (
              <div key={i} style={{ background: "#040c18", borderLeft: `2px solid ${item.t === "buy" ? "#22c55e" : item.t === "sell" ? "#ef4444" : "#3b82f6"}`, padding: "3px 5px", marginBottom: 2 }}>
                <div style={{ color: "#e2e8f0", fontSize: 7, lineHeight: 1.3 }}>{item.title}</div>
                <div style={{ color: "#3b82f6", fontSize: 6, marginTop: 1 }}>{item.sub}</div>
              </div>
            ))}
          </div>

          {/* News button */}
          <div style={{ padding: "5px 6px", borderTop: "1px solid #0d2040" }}>
            <button
              onClick={() => router.push("/news")}
              style={{ width: "100%", background: "#0a1e12", border: "1px solid #166534", color: "#22c55e", fontSize: 8, padding: "5px 8px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 5, fontFamily: "monospace" }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e", flexShrink: 0, display: "inline-block" }} />
              ◎ AnalysisNew →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
