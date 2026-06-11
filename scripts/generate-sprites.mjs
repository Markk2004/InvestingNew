/**
 * Generates claw-empire-style staff sprites as SVG (D-1/D-2/D-3 frames).
 * Run: node scripts/generate-sprites.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "..", "public", "sprites");
fs.mkdirSync(outDir, { recursive: true });

const PALETTES = [
  { skin: "#e8b88a", hair: "#1a0a00", shirt: "#1e3a6e", pants: "#16304e", accent: "#3b82f6" },
  { skin: "#d4a574", hair: "#2c1810", shirt: "#0e7490", pants: "#134e4a", accent: "#22d3ee" },
  { skin: "#c9926a", hair: "#0f0f0f", shirt: "#166534", pants: "#14532d", accent: "#22c55e" },
  { skin: "#e0a882", hair: "#3d2314", shirt: "#7c2d12", pants: "#431407", accent: "#f97316" },
  { skin: "#ddb090", hair: "#1a1020", shirt: "#581c87", pants: "#3b0764", accent: "#c084fc" },
  { skin: "#c88860", hair: "#201008", shirt: "#991b1b", pants: "#7f1d1d", accent: "#ef4444" },
  { skin: "#e8c4a0", hair: "#302010", shirt: "#854d0e", pants: "#713f12", accent: "#fbbf24" },
  { skin: "#b88058", hair: "#101820", shirt: "#1e40af", pants: "#1e3a8a", accent: "#60a5fa" },
  { skin: "#dca878", hair: "#281808", shirt: "#065f46", pants: "#064e3b", accent: "#34d399" },
  { skin: "#e4b890", hair: "#180c20", shirt: "#6b21a8", pants: "#581c87", accent: "#a78bfa" },
  { skin: "#cc9868", hair: "#0a1420", shirt: "#0f766e", pants: "#115e59", accent: "#2dd4bf" },
  { skin: "#daa070", hair: "#201010", shirt: "#b45309", pants: "#92400e", accent: "#fcd34d" },
  { skin: "#ffb7c5", hair: "#333", shirt: "#e75480", pants: "#e75480", accent: "#ffd700" },
];

function px(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
}

function drawCharacter(palette, frame) {
  const bob = frame === 2 ? 1 : frame === 3 ? 0.5 : 0;
  const armL = frame === 2 ? -1 : frame === 3 ? 1 : 0;
  const armR = frame === 2 ? 1 : frame === 3 ? -1 : 0;
  const y = 8 + bob;

  return `
    <ellipse cx="16" cy="46" rx="10" ry="3" fill="rgba(0,0,0,0.25)"/>
    ${px(10, 34 + bob, 4, 8, palette.pants)}
    ${px(18, 34 + bob, 4, 8, palette.pants)}
    ${px(9, 40 + bob, 5, 4, "#0a0a14")}
    ${px(18, 40 + bob, 5, 4, "#0a0a14")}
    ${px(8, 22 + y, 16, 14, palette.shirt)}
    ${px(8, 22 + y, 3, 14, palette.accent)}
    ${px(21, 22 + y, 3, 14, "#0a1428")}
    ${px(13, 24 + y, 6, 4, "#eaf2ff")}
    ${px(5 + armL, 24 + y, 4, 10, palette.shirt)}
    ${px(23 + armR, 24 + y, 4, 10, palette.shirt)}
    ${px(5 + armL, 32 + y, 4, 3, palette.skin)}
    ${px(23 + armR, 32 + y, 4, 3, palette.skin)}
    ${px(10, 10 + y, 12, 12, palette.skin)}
    ${px(10, 8 + y, 12, 4, palette.hair)}
    ${px(8, 10 + y, 3, 4, palette.hair)}
    ${px(21, 10 + y, 3, 4, palette.hair)}
    ${px(12, 14 + y, 2, 2, "#1a1008")}
    ${px(18, 14 + y, 2, 2, "#fff")}
    ${px(14, 18 + y, 4, 1, "#a0604a")}
    ${px(9, 7 + y, 14, 2, palette.accent)}
  `;
}

for (let n = 1; n <= 13; n++) {
  const palette = PALETTES[n - 1];
  for (let frame = 1; frame <= 3; frame++) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 52" width="32" height="52" shape-rendering="crispEdges">
  ${drawCharacter(palette, frame)}
</svg>`;
    fs.writeFileSync(path.join(outDir, `${n}-D-${frame}.svg`), svg.trim());
  }
}

console.log(`Generated ${13 * 3} sprites in public/sprites/`);
