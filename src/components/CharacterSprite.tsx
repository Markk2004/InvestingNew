"use client";

import { useEffect, useState } from "react";

export type CharacterState = "idle" | "working" | "shocked";
export type CharacterType = "gemini" | "newinvester";

export interface CharacterSpriteProps {
  character: CharacterType;
  state: CharacterState;
  isWalking?: boolean;
  frame?: number;
  className?: string;
  style?: React.CSSProperties;
  flip?: boolean;
}

// ─── NEWINVESTER (Trader) ──────────────────────────────────────────────────

function NewinvesterWalking({ frame }: { frame: number }) {
  const legs = [
    { l: 0, r: 0 },
    { l: -3, r: 3 },
    { l: 0, r: 0 },
    { l: 3, r: -3 },
  ];
  const { l, r } = legs[frame % 4];
  const armSwing = frame % 2 === 0 ? 1 : -1;
  return (
    <svg width="66" height="93" viewBox="0 0 44 62" style={{ imageRendering: "pixelated" }}>
      {/* Hair */}
      <rect x="13" y="1" width="18" height="5" fill="#1C0F0A" />
      <rect x="11" y="4" width="22" height="3" fill="#2E1510" />
      {/* Head */}
      <rect x="11" y="6" width="22" height="18" fill="#F5C89A" />
      <rect x="9" y="9" width="2" height="12" fill="#F5C89A" />
      <rect x="33" y="9" width="2" height="12" fill="#F5C89A" />
      {/* Eyes */}
      <rect x="14" y="12" width="5" height="5" fill="#111827" />
      <rect x="25" y="12" width="5" height="5" fill="#111827" />
      <rect x="15" y="13" width="2" height="2" fill="#fff" />
      <rect x="26" y="13" width="2" height="2" fill="#fff" />
      {/* Eyebrows */}
      <rect x="14" y="10" width="5" height="2" fill="#2E1510" />
      <rect x="25" y="10" width="5" height="2" fill="#2E1510" />
      {/* Mouth */}
      <rect x="17" y="20" width="10" height="2" fill="#C07060" />
      <rect x="15" y="19" width="2" height="2" fill="#C07060" />
      <rect x="27" y="19" width="2" height="2" fill="#C07060" />
      {/* Collar */}
      <rect x="17" y="24" width="10" height="3" fill="#F8FAFC" />
      {/* Jacket body */}
      <rect x="9" y="24" width="26" height="20" fill="#1D4ED8" />
      <rect x="9" y="24" width="5" height="20" fill="#1849C5" />
      <rect x="30" y="24" width="5" height="20" fill="#1849C5" />
      {/* Shirt front */}
      <rect x="19" y="24" width="6" height="16" fill="#F8FAFC" />
      {/* Tie */}
      <rect x="20" y="26" width="4" height="12" fill="#DC2626" />
      <rect x="21" y="25" width="2" height="3" fill="#B91C1C" />
      {/* Jacket buttons */}
      <rect x="14" y="32" width="2" height="2" fill="#1849C5" />
      <rect x="28" y="32" width="2" height="2" fill="#1849C5" />
      {/* Arms */}
      <rect x="3" y="24" width="6" height="16" fill="#1D4ED8" transform={`translate(0,${armSwing})`} />
      <rect x="35" y="24" width="6" height="16" fill="#1D4ED8" transform={`translate(0,${-armSwing})`} />
      <rect x="3" y="38" width="6" height="5" fill="#F5C89A" transform={`translate(0,${armSwing})`} />
      <rect x="35" y="38" width="6" height="5" fill="#F5C89A" transform={`translate(0,${-armSwing})`} />
      {/* Belt */}
      <rect x="9" y="44" width="26" height="3" fill="#0F172A" />
      <rect x="19" y="44" width="6" height="3" fill="#D97706" />
      {/* Pants */}
      <rect x="10" y="47" width="11" height="13" fill="#1E293B" transform={`translate(0,${l})`} />
      <rect x="23" y="47" width="11" height="13" fill="#1E293B" transform={`translate(0,${r})`} />
      {/* Shoes */}
      <rect x="8" y="58" width="14" height="4" fill="#0F172A" transform={`translate(0,${l})`} rx="1" />
      <rect x="22" y="58" width="14" height="4" fill="#0F172A" transform={`translate(0,${r})`} rx="1" />
    </svg>
  );
}

function NewinvesterSitting() {
  return (
    <svg width="78" height="84" viewBox="0 0 52 56" style={{ imageRendering: "pixelated" }}>
      {/* Hair */}
      <rect x="16" y="0" width="20" height="5" fill="#1C0F0A" />
      <rect x="14" y="3" width="24" height="3" fill="#2E1510" />
      {/* Head */}
      <rect x="14" y="5" width="24" height="18" fill="#F5C89A" />
      <rect x="12" y="8" width="2" height="12" fill="#F5C89A" />
      <rect x="38" y="8" width="2" height="12" fill="#F5C89A" />
      {/* Eyes - focused down */}
      <rect x="17" y="11" width="5" height="4" fill="#111827" />
      <rect x="30" y="11" width="5" height="4" fill="#111827" />
      <rect x="18" y="12" width="2" height="2" fill="#fff" />
      <rect x="31" y="12" width="2" height="2" fill="#fff" />
      <rect x="17" y="14" width="5" height="1" fill="#1C0F0A" />
      <rect x="30" y="14" width="5" height="1" fill="#1C0F0A" />
      {/* Mouth slight smile */}
      <rect x="20" y="19" width="8" height="2" fill="#C07060" />
      {/* Collar/shirt */}
      <rect x="22" y="23" width="8" height="3" fill="#F8FAFC" />
      {/* Jacket body */}
      <rect x="12" y="23" width="28" height="16" fill="#1D4ED8" />
      <rect x="12" y="23" width="6" height="16" fill="#1849C5" />
      <rect x="34" y="23" width="6" height="16" fill="#1849C5" />
      <rect x="22" y="23" width="8" height="12" fill="#F8FAFC" />
      <rect x="24" y="25" width="4" height="9" fill="#DC2626" />
      {/* Arms forward (typing) */}
      <rect x="4" y="25" width="8" height="12" fill="#1D4ED8" />
      <rect x="40" y="25" width="8" height="12" fill="#1D4ED8" />
      <rect x="4" y="35" width="8" height="5" fill="#F5C89A" />
      <rect x="40" y="35" width="8" height="5" fill="#F5C89A" />
      {/* Legs sitting */}
      <rect x="14" y="39" width="11" height="12" fill="#1E293B" />
      <rect x="27" y="39" width="11" height="12" fill="#1E293B" />
      {/* Shoes */}
      <rect x="12" y="49" width="14" height="5" fill="#0F172A" rx="1" />
      <rect x="26" y="49" width="14" height="5" fill="#0F172A" rx="1" />
    </svg>
  );
}

// ─── GEMINI (AI) ────────────────────────────────────────────────────────────

function GeminiWalking({ frame }: { frame: number }) {
  const legs = [
    { l: 0, r: 0 },
    { l: -3, r: 3 },
    { l: 0, r: 0 },
    { l: 3, r: -3 },
  ];
  const { l, r } = legs[frame % 4];
  const armSwing = frame % 2 === 0 ? 1 : -1;
  const glow = frame % 2 === 0 ? "#60A5FA" : "#93C5FD";
  return (
    <svg width="60" height="90" viewBox="0 0 40 60" style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 4px ${glow})` }}>
      {/* Antenna */}
      <rect x="17" y="0" width="6" height="5" fill="#7DD3FC" />
      <rect x="14" y="3" width="12" height="3" fill="#60A5FA" />
      <rect x="18" y="0" width="4" height="2" fill="#BAE6FD" />
      {/* Head */}
      <rect x="7" y="6" width="26" height="20" fill="#DBEAFE" />
      <rect x="5" y="9" width="2" height="14" fill="#BAE6FD" />
      <rect x="33" y="9" width="2" height="14" fill="#BAE6FD" />
      {/* Ear sensors */}
      <rect x="3" y="11" width="2" height="6" fill="#60A5FA" />
      <rect x="35" y="11" width="2" height="6" fill="#60A5FA" />
      {/* Visor */}
      <rect x="9" y="10" width="22" height="10" fill="#0C2044" />
      <rect x="10" y="11" width="20" height="8" fill="#0369A1" opacity="0.8" />
      {/* Visor scan line */}
      <rect x="10" y={11 + (frame % 8)} width="20" height="2" fill="#7DD3FC" opacity="0.9" />
      {/* Visor dots */}
      <rect x="12" y="12" width="2" height="2" fill="#22D3EE" />
      <rect x="18" y="12" width="2" height="2" fill="#22D3EE" />
      <rect x="26" y="12" width="2" height="2" fill="#22D3EE" />
      {/* Mouth grid */}
      <rect x="11" y="22" width="18" height="3" fill="#60A5FA" opacity="0.5" />
      <rect x="13" y="20" width="2" height="5" fill="#60A5FA" opacity="0.4" />
      <rect x="17" y="20" width="2" height="5" fill="#60A5FA" opacity="0.4" />
      <rect x="21" y="20" width="2" height="5" fill="#60A5FA" opacity="0.4" />
      <rect x="25" y="20" width="2" height="5" fill="#60A5FA" opacity="0.4" />
      {/* Neck */}
      <rect x="15" y="26" width="10" height="4" fill="#BAE6FD" />
      {/* Body */}
      <rect x="7" y="30" width="26" height="18" fill="#DBEAFE" />
      <rect x="7" y="30" width="5" height="18" fill="#BAE6FD" />
      <rect x="28" y="30" width="5" height="18" fill="#BAE6FD" />
      {/* Chest panel */}
      <rect x="13" y="32" width="14" height="10" fill="#0C2044" rx="1" />
      <rect x="15" y="34" width="4" height="3" fill="#22C55E" />
      <rect x="15" y="38" width="7" height="1" fill="#F59E0B" />
      <rect x="15" y="40" width="5" height="1" fill="#EF4444" />
      <rect x="23" y="34" width="3" height="3" fill="#60A5FA" opacity="0.8" />
      {/* Arms */}
      <rect x="1" y="30" width="6" height="14" fill="#DBEAFE" transform={`translate(0,${armSwing})`} />
      <rect x="33" y="30" width="6" height="14" fill="#DBEAFE" transform={`translate(0,${-armSwing})`} />
      <rect x="1" y="42" width="6" height="5" fill="#7DD3FC" transform={`translate(0,${armSwing})`} />
      <rect x="33" y="42" width="6" height="5" fill="#7DD3FC" transform={`translate(0,${-armSwing})`} />
      {/* Legs */}
      <rect x="9" y="48" width="9" height="10" fill="#BAE6FD" transform={`translate(0,${l})`} />
      <rect x="22" y="48" width="9" height="10" fill="#BAE6FD" transform={`translate(0,${r})`} />
      {/* Feet */}
      <rect x="7" y="56" width="13" height="4" fill="#60A5FA" transform={`translate(0,${l})`} rx="1" />
      <rect x="20" y="56" width="13" height="4" fill="#60A5FA" transform={`translate(0,${r})`} rx="1" />
    </svg>
  );
}

function GeminiTyping({ frame }: { frame: number }) {
  const armY = frame % 2 === 0 ? 0 : 2;
  const glow = frame % 2 === 0 ? "#60A5FA" : "#93C5FD";
  return (
    <svg width="78" height="84" viewBox="0 0 52 56" style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 5px ${glow})` }}>
      {/* Antenna */}
      <rect x="22" y="0" width="8" height="4" fill="#7DD3FC" />
      <rect x="20" y="2" width="12" height="3" fill="#60A5FA" />
      {/* Head */}
      <rect x="10" y="5" width="32" height="20" fill="#DBEAFE" />
      <rect x="8" y="8" width="2" height="14" fill="#BAE6FD" />
      <rect x="42" y="8" width="2" height="14" fill="#BAE6FD" />
      {/* Ear sensors */}
      <rect x="5" y="10" width="3" height="7" fill="#60A5FA" />
      <rect x="44" y="10" width="3" height="7" fill="#60A5FA" />
      {/* Visor */}
      <rect x="12" y="9" width="28" height="11" fill="#0C2044" />
      <rect x="13" y="10" width="26" height="9" fill="#0369A1" opacity="0.8" />
      <rect x="13" y={10 + (frame % 9)} width="26" height="2" fill="#7DD3FC" opacity="0.9" />
      {/* Visor dots */}
      <rect x="16" y="11" width="3" height="3" fill="#22D3EE" />
      <rect x="23" y="11" width="3" height="3" fill="#22D3EE" />
      <rect x="34" y="11" width="3" height="3" fill="#22D3EE" />
      {/* Mouth */}
      <rect x="14" y="21" width="24" height="3" fill="#60A5FA" opacity="0.5" />
      {[16, 21, 26, 31, 36].map(x => (
        <rect key={x} x={x} y="19" width="2" height="5" fill="#60A5FA" opacity="0.4" />
      ))}
      {/* Neck */}
      <rect x="20" y="25" width="12" height="4" fill="#BAE6FD" />
      {/* Body */}
      <rect x="10" y="29" width="32" height="16" fill="#DBEAFE" />
      <rect x="10" y="29" width="6" height="16" fill="#BAE6FD" />
      <rect x="36" y="29" width="6" height="16" fill="#BAE6FD" />
      {/* Chest panel */}
      <rect x="18" y="31" width="16" height="10" fill="#0C2044" rx="1" />
      <rect x="20" y="33" width="5" height="3" fill="#22C55E" />
      <rect x="20" y="37" width="8" height="1" fill="#F59E0B" />
      <rect x="28" y="33" width="4" height="3" fill="#60A5FA" opacity="0.8" />
      {/* Arms typing */}
      <rect x="2" y="29" width="8" height="12" fill="#DBEAFE" transform={`translate(0,${armY})`} />
      <rect x="42" y="29" width="8" height="12" fill="#DBEAFE" transform={`translate(0,${armY})`} />
      <rect x="2" y="39" width="8" height="5" fill="#7DD3FC" transform={`translate(0,${armY})`} />
      <rect x="42" y="39" width="8" height="5" fill="#7DD3FC" transform={`translate(0,${armY})`} />
      {/* Legs sitting */}
      <rect x="12" y="45" width="12" height="10" fill="#BAE6FD" />
      <rect x="28" y="45" width="12" height="10" fill="#BAE6FD" />
      <rect x="10" y="52" width="16" height="4" fill="#60A5FA" rx="1" />
      <rect x="26" y="52" width="16" height="4" fill="#60A5FA" rx="1" />
    </svg>
  );
}

// ─── COMPONENT WRAPPER ────────────────────────────────────────────────────────

export default function CharacterSprite({
  character,
  state,
  isWalking = false,
  frame = 0,
  className = "",
  style,
  flip = false,
}: CharacterSpriteProps) {
  const isShocked = state === "shocked";

  let content = null;
  if (character === "gemini") {
    content = isWalking ? <GeminiWalking frame={frame} /> : <GeminiTyping frame={frame} />;
  } else {
    // newinvester
    content = isWalking ? <NewinvesterWalking frame={frame} /> : <NewinvesterSitting />;
  }

  return (
    <div
      className={`${className} ${isShocked ? "animate-pixel-shake" : ""}`}
      style={{
        transition: "all 0.1s ease",
        zIndex: 10,
        transform: flip ? "scaleX(-1)" : "none",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        ...style,
      }}
    >
      {content}
    </div>
  );
}
