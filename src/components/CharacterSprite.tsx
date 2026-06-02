"use client";

import React from "react";

export type CharacterState = "idle" | "working" | "shocked";
export type CharacterType = "gemini" | "newinvester";

export type HatStyle = "cap-blue" | "cap-red" | "tophat" | "wizard" | "none";
export type ShirtStyle = "suit" | "tee-gray" | "hoodie-green" | "none";
export type AccessoryStyle = "glasses" | "sunglasses" | "bow" | "none";
export type EffectStyle = "sparkle" | "aura" | "none";

export interface OutfitConfig {
  hat?: HatStyle;
  shirt?: ShirtStyle;
  accessory?: AccessoryStyle;
  effect?: EffectStyle;
}

export interface CharacterSpriteProps {
  character: CharacterType;
  state: CharacterState;
  isWalking?: boolean;
  frame?: number;
  className?: string;
  style?: React.CSSProperties;
  flip?: boolean;
  outfit?: OutfitConfig;
}

// ─── Dimensional Newinvester Pixel Character ──────────────────────────────────
// Uses layered rects for shading: base → shadow → highlight → rim light

function NewinvesterCharacter({
  state,
  isWalking,
  frame,
  outfit = {},
}: {
  state: CharacterState;
  isWalking: boolean;
  frame: number;
  outfit?: OutfitConfig;
}) {
  // ── Animation offsets ──────────────────────────────────────────────────────
  const isTyping     = state === "working" && !isWalking;
  const isCelebrating = state === "shocked"; // reuse celebrating anim for shocked
  const isWalk       = isWalking;

  // Arm Y offsets
  const leftArmY  = isTyping      ? 36 + (frame % 2) * 2
                  : isCelebrating ? 24 - (frame % 2) * 8
                  : 28;
  const rightArmY = isTyping      ? 36 + ((frame + 1) % 2) * 2
                  : isCelebrating ? 24 - ((frame + 1) % 2) * 8
                  : 28;

  // Leg X offsets (walk swing)
  const swing     = isWalk ? Math.sin(frame * 0.8) * 3 : 0;
  const leftLegX  = 6  + swing;
  const rightLegX = 17 - swing;
  const legBob    = isWalk ? Math.abs(Math.sin(frame * 0.8)) * 1.5 : 0;

  // Body vertical bob
  const bodyBob   = isTyping ? (frame % 2) * 0.5
                  : isWalk   ? legBob * 0.3
                  : 0;

  // Head tilt (shocked = -12 deg)
  const headRotate = isCelebrating ? -12 * (frame % 2 === 0 ? 1 : 0)
                   : 0;

  // Blink
  const blink = !isCelebrating && frame % 20 === 0;
  const eyeH  = blink ? 1 : 4;

  // Arm length (celebrating = shorter = raised)
  const armH  = isCelebrating ? 8 : 13;

  // Shadow opacity pulses slightly
  const shadowA = 0.35 + 0.1 * Math.sin(frame * 0.05);

  // Monitor/keyboard glow when typing
  const kbGlow = isTyping;

  // Thinking bubble when idle and not walking
  const showBubble = state === "idle" && !isWalking && frame % 60 > 40;

  // Celebrating sparks
  const showSparks = isCelebrating;

  // Scale factor — character is drawn on 34×80 viewBox
  const scale = 3;
  const W = 34 * scale;
  const H = 80 * scale;

  return (
    <svg
      viewBox="0 0 34 80"
      width="100%"
      height="100%"
      style={{ imageRendering: "pixelated", overflow: "visible" }}
    >
      {/* ── DROP SHADOW ── */}
      <ellipse
        cx="17"
        cy={73 + legBob}
        rx={13 - legBob * 0.5}
        ry={2.5}
        fill="#010408"
        opacity={shadowA}
      />

      {/* ── LEGS ── */}
      {/* Left leg — base + right-side highlight + left shadow */}
      <rect x={leftLegX}     y={47 + bodyBob} width={9}  height={17} fill="#16304e" />
      <rect x={leftLegX + 6} y={47 + bodyBob} width={2}  height={17} fill="#1a3a5f" />
      <rect x={leftLegX}     y={47 + bodyBob} width={2}  height={17} fill="#0e2035" />
      {/* Right leg */}
      <rect x={rightLegX}     y={47 + bodyBob} width={9}  height={17} fill="#16304e" />
      <rect x={rightLegX + 6} y={47 + bodyBob} width={2}  height={17} fill="#1a3a5f" />
      <rect x={rightLegX}     y={47 + bodyBob} width={2}  height={17} fill="#0e2035" />
      {/* Leg crease */}
      <rect x={6} y={58 + bodyBob} width={22} height={2} fill="#102540" />

      {/* ── SHOES ── */}
      {/* Left shoe */}
      <rect x={leftLegX - 2}  y={62 + bodyBob} width={13} height={5} fill="#0c1a2e" />
      <rect x={leftLegX - 2}  y={62 + bodyBob} width={13} height={2} fill="#142340" />
      <rect x={leftLegX + 8}  y={63 + bodyBob} width={2}  height={3} fill="#08121e" />
      {/* Right shoe */}
      <rect x={rightLegX - 2} y={62 + bodyBob} width={13} height={5} fill="#0c1a2e" />
      <rect x={rightLegX - 2} y={62 + bodyBob} width={13} height={2} fill="#142340" />
      <rect x={rightLegX + 8} y={63 + bodyBob} width={2}  height={3} fill="#08121e" />

      {/* ── BELT ── */}
      <rect x="6"  y={45 + bodyBob} width={22} height={3} fill="#1d50a0" />
      <rect x="6"  y={45 + bodyBob} width={22} height={1} fill="#2563c8" />
      {/* Belt buckle */}
      <rect x="14" y={45 + bodyBob} width={6}  height={3} fill="#4b91f5" />
      <rect x="15" y={45 + bodyBob} width={4}  height={1} fill="#a0c8ff" />

      {/* ── JACKET / BODY ── */}
      {/* Main jacket */}
      <rect x="6"  y={27 + bodyBob} width={22} height={19} fill="#1a3a6e" />
      {/* Left jacket side shadow */}
      <rect x="6"  y={27 + bodyBob} width={3}  height={19} fill="#122d56" />
      {/* Right jacket side shadow */}
      <rect x="25" y={27 + bodyBob} width={3}  height={19} fill="#122d56" />
      {/* Left lapel */}
      <rect x="9"  y={27 + bodyBob} width={4}  height={18} fill="#2060a8" />
      <rect x="10" y={27 + bodyBob} width={2}  height={18} fill="#2868b4" />
      {/* Right lapel */}
      <rect x="21" y={27 + bodyBob} width={4}  height={18} fill="#2060a8" />
      <rect x="22" y={27 + bodyBob} width={2}  height={18} fill="#2868b4" />
      {/* White shirt */}
      <rect x="13" y={27 + bodyBob} width={8}  height={5}  fill="#eaf2ff" />
      <rect x="13" y={27 + bodyBob} width={8}  height={2}  fill="#ffffff" />
      {/* Tie */}
      <rect x="15" y={32 + bodyBob} width={4}  height={11} fill="#2563c8" />
      <rect x="16" y={32 + bodyBob} width={2}  height={11} fill="#3b82f6" />
      {/* Tie knot */}
      <rect x="14" y={41 + bodyBob} width={6}  height={4}  fill="#1d50a0" />
      <rect x="15" y={41 + bodyBob} width={4}  height={2}  fill="#2563c8" />
      {/* Jacket button */}
      <rect x="13" y={36 + bodyBob} width={2}  height={2}  fill="#0e254a" />
      <rect x="19" y={36 + bodyBob} width={2}  height={2}  fill="#0e254a" />
      {/* Shoulder highlight */}
      <rect x="6"  y={27 + bodyBob} width={22} height={2}  fill="#2563c8" opacity={0.6} />
      {/* Center highlight stripe */}
      <rect x="17" y={28 + bodyBob} width={1}  height={16} fill="#2563c8" opacity={0.2} />

      {/* ── ARMS ── */}
      {/* Left arm — base + highlights */}
      <rect x="0" y={leftArmY  + bodyBob} width={6} height={armH} fill="#1a3a6e" />
      <rect x="4" y={leftArmY  + bodyBob} width={2} height={armH} fill="#122d56" />
      <rect x="0" y={leftArmY  + bodyBob} width={2} height={armH} fill="#2060a8" />
      {/* Right arm */}
      <rect x="28" y={rightArmY + bodyBob} width={6} height={armH} fill="#1a3a6e" />
      <rect x="28" y={rightArmY + bodyBob} width={2} height={armH} fill="#2060a8" />
      <rect x="32" y={rightArmY + bodyBob} width={2} height={armH} fill="#122d56" />

      {/* ── HANDS ── */}
      {/* Left hand */}
      <rect x="0" y={leftArmY  + bodyBob + armH} width={6} height={4} fill="#c8824a" />
      <rect x="0" y={leftArmY  + bodyBob + armH} width={2} height={4} fill="#d49060" />
      <rect x="4" y={leftArmY  + bodyBob + armH} width={2} height={4} fill="#a86030" />
      {/* Right hand */}
      <rect x="28" y={rightArmY + bodyBob + armH} width={6} height={4} fill="#c8824a" />
      <rect x="28" y={rightArmY + bodyBob + armH} width={2} height={4} fill="#d49060" />
      <rect x="32" y={rightArmY + bodyBob + armH} width={2} height={4} fill="#a86030" />

      {/* ── KEYBOARD (typing only) ── */}
      {isTyping && (
        <g transform={`translate(0, ${68 + bodyBob})`}>
          <rect x="1" y="0" width="32" height="9" fill="#0b1a2e" rx="1" />
          <rect x="1" y="0" width="32" height="2" fill="#112440" rx="1" />
          {kbGlow && (
            <rect x="1" y="0" width="32" height="9" fill="#3b82f6" opacity={0.12} rx="1" />
          )}
          {/* Key rows */}
          {[0, 1, 2, 3].map((i) => (
            <rect key={`k0-${i}`} x={2 + i * 8} y="2" width="6" height="2" fill="#1a3050" rx="0.5" />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={`k1-${i}`} x={5 + i * 8} y="5" width="6" height="2" fill="#1a3050" rx="0.5" />
          ))}
          {/* Pressed key highlight */}
          {frame % 4 < 2 && (
            <rect x={2 + (frame % 4) * 8} y="2" width="6" height="2" fill="#3b82f6" opacity={0.5} rx="0.5" />
          )}
        </g>
      )}

      {/* ── HEAD ── */}
      <g transform={`rotate(${headRotate}, 17, ${18 + bodyBob})`}>
        {/* Neck */}
        <rect x="13" y={25 + bodyBob} width={8} height={3} fill="#b87040" />
        <rect x="14" y={25 + bodyBob} width={6} height={3} fill="#c8824a" />

        {/* Head base */}
        <rect x="8"  y={9  + bodyBob} width={18} height={17} fill="#c8824a" />
        {/* Head left/right cheeks */}
        <rect x="6"  y={11 + bodyBob} width={2}  height={11} fill="#c8824a" />
        <rect x="26" y={11 + bodyBob} width={2}  height={11} fill="#c8824a" />
        {/* Left face shadow */}
        <rect x="8"  y={9  + bodyBob} width={3}  height={17} fill="#a86030" opacity={0.5} />
        {/* Right face shadow */}
        <rect x="23" y={9  + bodyBob} width={3}  height={17} fill="#a86030" opacity={0.35} />
        {/* Forehead highlight */}
        <rect x="11" y={9  + bodyBob} width={12} height={3}  fill="#d8966a" opacity={0.6} />
        {/* Cheek blush */}
        <rect x="9"  y={19 + bodyBob} width={3}  height={2}  fill="#e8806a" opacity={0.35} />
        <rect x="22" y={19 + bodyBob} width={3}  height={2}  fill="#e8806a" opacity={0.35} />

        {/* ── HAIR ── */}
        <rect x="8"  y={7  + bodyBob} width={18} height={4}  fill="#1a0a00" />
        <rect x="6"  y={9  + bodyBob} width={4}  height={4}  fill="#1a0a00" />
        <rect x="24" y={9  + bodyBob} width={4}  height={4}  fill="#1a0a00" />
        {/* Hair highlights */}
        <rect x="10" y={7  + bodyBob} width={8}  height={2}  fill="#2c140a" />
        <rect x="11" y={8  + bodyBob} width={4}  height={1}  fill="#3a1c0c" />

        {/* ── HAT (BASEBALL CAP) ── */}
        {/* Cap dome */}
        <rect x="8" y={1 + bodyBob} width={18} height={7} fill="#1e3a8a" />
        <rect x="10" y={0 + bodyBob} width={14} height={2} fill="#3b82f6" />
        {/* Cap brim */}
        <rect x="5" y={7 + bodyBob} width={24} height={2} fill="#1e3a8a" />
        <rect x="5" y={8 + bodyBob} width={24} height={1} fill="#172554" />

        {/* ── GLASSES FRAMES ── */}
        <rect x="9"  y={14 + bodyBob} width={7}  height={6}  fill="none" stroke="#3b82f6" strokeWidth="1.2" />
        <rect x="18" y={14 + bodyBob} width={7}  height={6}  fill="none" stroke="#3b82f6" strokeWidth="1.2" />
        {/* Bridge */}
        <rect x="16" y={16 + bodyBob} width={2}  height={1.5} fill="#3b82f6" />
        {/* Side arms */}
        <rect x="7"  y={16 + bodyBob} width={2}  height={1}  fill="#3b82f6" />
        <rect x="25" y={16 + bodyBob} width={2}  height={1}  fill="#3b82f6" />
        {/* Lens tint */}
        <rect x="9.6" y={14.6 + bodyBob} width={5.8} height={4.8} fill="#00ffff" opacity={0.25} />
        <rect x="18.6" y={14.6 + bodyBob} width={5.8} height={4.8} fill="#00ffff" opacity={0.25} />
        {/* Lens sheen */}
        <rect x="11" y={15 + bodyBob} width={2}  height={2}  fill="#ffffff" opacity={0.5} />
        <rect x="20" y={15 + bodyBob} width={2}  height={2}  fill="#ffffff" opacity={0.5} />

        {/* ── EYES ── */}
        {isCelebrating ? (
          /* wide-open shocked eyes */
          <>
            <rect x="10" y={15 + bodyBob} width={5} height={5} fill="#1a1008" />
            <rect x="19" y={15 + bodyBob} width={5} height={5} fill="#1a1008" />
            <rect x="11" y={16 + bodyBob} width={2} height={2} fill="#ffffff" />
            <rect x="20" y={16 + bodyBob} width={2} height={2} fill="#ffffff" />
            <rect x="11" y={16 + bodyBob} width={1} height={1} fill="#60a5fa" />
            <rect x="20" y={16 + bodyBob} width={1} height={1} fill="#60a5fa" />
          </>
        ) : (
          /* normal eyes */
          <>
            <rect x="10" y={15 + bodyBob} width={5} height={eyeH} fill="#1a1008" />
            <rect x="19" y={15 + bodyBob} width={5} height={eyeH} fill="#1a1008" />
            {!blink && (
              <>
                {/* eye whites */}
                <rect x="11" y={16 + bodyBob} width={2} height={2} fill="#ffffff" />
                <rect x="20" y={16 + bodyBob} width={2} height={2} fill="#ffffff" />
                {/* pupils — blue tint at night */}
                <rect x="11" y={16 + bodyBob} width={1} height={1} fill="#93c5fd" />
                <rect x="20" y={16 + bodyBob} width={1} height={1} fill="#93c5fd" />
              </>
            )}
          </>
        )}

        {/* ── EYEBROWS ── */}
        <rect
          x="10"
          y={13 + bodyBob + (isCelebrating ? -2 : 0)}
          width={5}
          height={1}
          fill="#1a0a00"
        />
        <rect
          x="19"
          y={13 + bodyBob + (isCelebrating ? -2 : 0)}
          width={5}
          height={1}
          fill="#1a0a00"
        />

        {/* ── MOUTH ── */}
        {isCelebrating ? (
          /* open O mouth for shock */
          <>
            <rect x="12" y={21 + bodyBob} width={10} height={3} fill="#8a3a2a" />
            <rect x="12" y={21 + bodyBob} width={10} height={1} fill="#c05040" />
            <rect x="13" y={22 + bodyBob} width={8}  height={1} fill="#ffffff" opacity={0.3} />
          </>
        ) : (
          /* neutral / slight smirk */
          <>
            <rect x="12" y={21 + bodyBob} width={10} height={2} fill="#8a3a2a" />
            <rect x="11" y={20 + bodyBob} width={2}  height={2} fill="#8a3a2a" />
            <rect x="21" y={20 + bodyBob} width={2}  height={2} fill="#8a3a2a" />
          </>
        )}
      </g>

      {/* ── THINKING BUBBLE ── */}
      {showBubble && (
        <g opacity={0.9}>
          <circle cx="29" cy={7  + bodyBob} r="1.5" fill="#bfdbfe" opacity={0.7} />
          <circle cx="32" cy={3  + bodyBob} r="2.5" fill="#bfdbfe" opacity={0.7} />
          {/* thought box */}
          <rect x="22" y={-9 + bodyBob} width={22} height={10} fill="#1e3a5f" rx="2"
            stroke="#3b82f6" strokeWidth="0.5" />
          <text x="33" y={-3 + bodyBob} textAnchor="middle" fontSize="4" fill="#93c5fd">📈 ...</text>
        </g>
      )}

      {/* ── CELEBRATING SPARKS ── */}
      {showSparks && (
        <g>
          {[
            { cx: -3, cy: 12, r: 1.5, c: "#fbbf24" },
            { cx: 37, cy: 10, r: 2,   c: "#ef4444" },
            { cx: 31, cy: 16, r: 1,   c: "#22c55e" },
            { cx:  3, cy: 18, r: 1,   c: "#a78bfa" },
          ].map((s, i) => (
            <circle
              key={i}
              cx={s.cx + (frame % 6) * (i % 2 === 0 ? 0.5 : -0.5)}
              cy={s.cy - (frame % 6) * 0.8}
              r={s.r}
              fill={s.c}
              opacity={0.8}
            />
          ))}
        </g>
      )}

      {/* ── OUTFIT OVERLAYS ── */}

      {/* ── SHIRT OVERLAY ── */}
      {outfit.shirt === "tee-gray" && (
        <g>
          {/* Gray casual tee over jacket */}
          <rect x="6"  y={27 + bodyBob} width={22} height={19} fill="#4a5568" />
          <rect x="6"  y={27 + bodyBob} width={22} height={2}  fill="#718096" opacity={0.8} />
          <rect x="13" y={27 + bodyBob} width={8}  height={5}  fill="#e2e8f0" />
          <rect x="0"  y={leftArmY  + bodyBob} width={6} height={armH} fill="#4a5568" />
          <rect x="28" y={rightArmY + bodyBob} width={6} height={armH} fill="#4a5568" />
        </g>
      )}
      {outfit.shirt === "hoodie-green" && (
        <g>
          {/* Green hoodie */}
          <rect x="5"  y={26 + bodyBob} width={24} height={21} fill="#276749" />
          <rect x="5"  y={26 + bodyBob} width={24} height={2}  fill="#38a169" opacity={0.8} />
          {/* Hood */}
          <rect x="8"  y={24 + bodyBob} width={18} height={5}  fill="#276749" />
          <rect x="10" y={22 + bodyBob} width={14} height={4}  fill="#2f855a" />
          {/* Pocket */}
          <rect x="12" y={36 + bodyBob} width={10} height={6}  fill="#22543d" />
          <rect x="0"  y={leftArmY  + bodyBob} width={6} height={armH} fill="#276749" />
          <rect x="28" y={rightArmY + bodyBob} width={6} height={armH} fill="#276749" />
        </g>
      )}

      {/* ── HAT OVERLAY ── */}
      {outfit.hat === "tophat" && (
        <g>
          {/* Classic top hat — replaces cap */}
          <rect x="6"  y={7  + bodyBob} width={22} height={2}  fill="#1a1a2e" />{/* brim */}
          <rect x="5"  y={8  + bodyBob} width={24} height={2}  fill="#16213e" />{/* brim shadow */}
          <rect x="9"  y={-4 + bodyBob} width={16} height={12} fill="#1a1a2e" />{/* crown */}
          <rect x="9"  y={-4 + bodyBob} width={16} height={2}  fill="#2d2d4a" />{/* crown top */}
          <rect x="9"  y={-4 + bodyBob} width={2}  height={12} fill="#2d2d4a" />{/* left edge */}
          <rect x="23" y={-4 + bodyBob} width={2}  height={12} fill="#0d0d1a" />{/* right shadow */}
          {/* Hat band */}
          <rect x="9"  y={4  + bodyBob} width={16} height={2}  fill="#4c1d95" />
          <rect x="10" y={4  + bodyBob} width={14} height={1}  fill="#7c3aed" opacity={0.7} />
        </g>
      )}
      {outfit.hat === "cap-red" && (
        <g>
          {/* Red baseball cap */}
          <rect x="8"  y={1  + bodyBob} width={18} height={7}  fill="#991b1b" />
          <rect x="10" y={0  + bodyBob} width={14} height={2}  fill="#ef4444" />
          <rect x="5"  y={7  + bodyBob} width={24} height={2}  fill="#991b1b" />
          <rect x="5"  y={8  + bodyBob} width={24} height={1}  fill="#7f1d1d" />
          {/* Logo on cap */}
          <rect x="15" y={3  + bodyBob} width={4}  height={3}  fill="#ef4444" opacity={0.0} />
          <rect x="16" y={3  + bodyBob} width={2}  height={3}  fill="#fca5a5" opacity={0.8} />
        </g>
      )}
      {outfit.hat === "wizard" && (
        <g>
          {/* Wizard hat */}
          <rect x="6"  y={7  + bodyBob} width={22} height={2}  fill="#4c1d95" />{/* wide brim */}
          <rect x="5"  y={8  + bodyBob} width={24} height={2}  fill="#3b0764" />
          {/* Tall conical crown — approximated with pixel steps */}
          <rect x="12" y={0  + bodyBob} width={10} height={8}  fill="#4c1d95" />
          <rect x="13" y={-7 + bodyBob} width={8}  height={8}  fill="#4c1d95" />
          <rect x="15" y={-13+ bodyBob} width={4}  height={7}  fill="#4c1d95" />
          <rect x="16" y={-17+ bodyBob} width={2}  height={5}  fill="#7c3aed" />
          {/* Stars on hat */}
          <rect x="13" y={2  + bodyBob} width={2}  height={2}  fill="#fbbf24" opacity={0.9} />
          <rect x="18" y={-2 + bodyBob} width={2}  height={2}  fill="#a78bfa" opacity={0.9} />
          <rect x="15" y={-10+ bodyBob} width={2}  height={2}  fill="#fbbf24" opacity={0.9} />
        </g>
      )}

      {/* ── ACCESSORY OVERLAY ── */}
      {outfit.accessory === "sunglasses" && (
        <g>
          {/* Gold-tinted shades */}
          <rect x="9"  y={14 + bodyBob} width={7}  height={5}  fill="none" stroke="#d97706" strokeWidth="1.2" />
          <rect x="18" y={14 + bodyBob} width={7}  height={5}  fill="none" stroke="#d97706" strokeWidth="1.2" />
          <rect x="16" y={16 + bodyBob} width={2}  height={1.5} fill="#d97706" />
          <rect x="7"  y={16 + bodyBob} width={2}  height={1}  fill="#d97706" />
          <rect x="25" y={16 + bodyBob} width={2}  height={1}  fill="#d97706" />
          {/* Dark tinted lenses */}
          <rect x="9.5" y={14.5 + bodyBob} width={6} height={4} fill="#1a0a00" opacity={0.75} />
          <rect x="18.5" y={14.5 + bodyBob} width={6} height={4} fill="#1a0a00" opacity={0.75} />
          {/* Lens sheen */}
          <rect x="11" y={15 + bodyBob} width={2} height={1} fill="#fbbf24" opacity={0.4} />
          <rect x="20" y={15 + bodyBob} width={2} height={1} fill="#fbbf24" opacity={0.4} />
        </g>
      )}
      {outfit.accessory === "bow" && (
        <g>
          {/* Bow tie at neck */}
          <rect x="12" y={26 + bodyBob} width={10} height={3}  fill="#dc2626" />
          <rect x="16" y={26 + bodyBob} width={2}  height={3}  fill="#991b1b" />
          <rect x="12" y={26 + bodyBob} width={4}  height={3}  fill="#ef4444" opacity={0.6} />
          <rect x="18" y={26 + bodyBob} width={4}  height={3}  fill="#ef4444" opacity={0.6} />
        </g>
      )}

      {/* ── EFFECT OVERLAY ── */}
      {outfit.effect === "aura" && (
        <g opacity={0.5 + 0.2 * Math.sin(frame * 0.1)}>
          <ellipse cx="17" cy={30 + bodyBob} rx={22} ry={40} fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity={0.6} />
          <ellipse cx="17" cy={30 + bodyBob} rx={18} ry={34} fill="none" stroke="#a78bfa" strokeWidth="1"   opacity={0.4} />
          {[0,1,2,3,4,5].map(i => (
            <circle
              key={i}
              cx={17 + Math.cos(frame * 0.06 + i * 1.05) * 22}
              cy={30 + bodyBob + Math.sin(frame * 0.06 + i * 1.05) * 38}
              r={1.5}
              fill="#c4b5fd"
              opacity={0.7}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

// ─── GEMINI (AI) — unchanged ──────────────────────────────────────────────────

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
    <svg width="100%" height="100%" viewBox="0 0 40 60" style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 4px ${glow})`, overflow: "visible" }}>
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
    <svg width="100%" height="100%" viewBox="0 0 52 56" style={{ imageRendering: "pixelated", filter: `drop-shadow(0 0 5px ${glow})`, overflow: "visible" }}>
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
  outfit = {},
}: CharacterSpriteProps) {
  const isShocked = state === "shocked";

  let content: React.ReactNode = null;

  if (character === "gemini") {
    content = isWalking
      ? <GeminiWalking frame={frame} />
      : <GeminiTyping frame={frame} />;
  } else {
    // newinvester — fully dimensional character
    content = (
      <NewinvesterCharacter
        state={state}
        isWalking={isWalking}
        frame={frame}
        outfit={outfit}
      />
    );
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
