"use client";

import { useMemo, useState } from "react";
import { PIXELTRADE_AGENTS } from "@/lib/agents";
import AgentAvatar from "@/components/AgentAvatar";
import AgentSprite from "@/components/AgentSprite";

const SPRITE_POOL = Array.from({ length: 13 }, (_, i) => i + 1);

interface CharacterTabProps {
  spriteOverrides: Record<string, number>;
  setSpriteOverrides: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default function CharacterTab({ spriteOverrides, setSpriteOverrides }: CharacterTabProps) {
  const [selectedId, setSelectedId] = useState(PIXELTRADE_AGENTS[0].id);
  const [saved, setSaved] = useState(false);

  const agents = useMemo(
    () =>
      PIXELTRADE_AGENTS.map((a) => ({
        ...a,
        sprite_number: spriteOverrides[a.id] ?? a.sprite_number,
      })),
    [spriteOverrides],
  );

  const selected = agents.find((a) => a.id === selectedId) ?? agents[0];
  const previewSprite = spriteOverrides[selectedId] ?? selected.sprite_number ?? 1;

  const handlePickSprite = (num: number) => {
    setSpriteOverrides((prev) => ({ ...prev, [selectedId]: num }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        background: "linear-gradient(135deg, #0a0a1a 0%, #040c18 50%, #050510 100%)",
      }}
    >
      {/* Preview stage */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRight: "1px solid #1e2a3a",
          position: "relative",
        }}
      >
        <div style={{ color: "#1e3a5f", fontSize: 8, letterSpacing: 3, marginBottom: 16 }}>◈ STAFF PREVIEW ◈</div>

        <div style={{ position: "relative", marginBottom: 8 }}>
          <AgentSprite spriteNum={previewSprite} status="idle" name={selected.name} height={120} />
        </div>

        <div style={{ color: "#475569", fontSize: 8, fontFamily: "monospace", marginBottom: 16 }}>
          Sprite #{previewSprite} · {selected.role}
        </div>

        <button
          type="button"
          onClick={handleSave}
          style={{
            background: saved ? "#15803d" : "#7c3aed",
            border: `2px solid ${saved ? "#22c55e" : "#a78bfa"}`,
            color: "#fff",
            fontSize: 8,
            fontWeight: "bold",
            fontFamily: "monospace",
            padding: "8px 24px",
            cursor: "pointer",
            letterSpacing: 2,
          }}
        >
          {saved ? "✓ SAVED" : "CONFIRM SPRITE"}
        </button>
      </div>

      {/* Sprite picker */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e2a3a", background: "#060d1a" }}>
          <div style={{ color: "#3b82f6", fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>
            ◈ SELECT STAFF MEMBER
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {agents.map((agent) => {
              const isSelected = agent.id === selectedId;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedId(agent.id)}
                  style={{
                    background: isSelected ? "rgba(192,132,252,0.08)" : "#040c18",
                    border: `2px solid ${isSelected ? "#c084fc" : "#1e2a3a"}`,
                    borderRadius: 4,
                    padding: "8px 6px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AgentAvatar agent={agent} agents={agents} size={36} />
                  <span style={{ color: isSelected ? "#c084fc" : "#94a3b8", fontSize: 8, fontWeight: 700 }}>
                    {agent.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          <div style={{ color: "#3b82f6", fontSize: 9, letterSpacing: 2, marginBottom: 10 }}>
            ◈ SPRITE LIBRARY (claw-empire style)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SPRITE_POOL.map((num) => {
              const isPicked = previewSprite === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePickSprite(num)}
                  style={{
                    width: 64,
                    height: 80,
                    background: isPicked ? "rgba(255,215,64,0.1)" : "#0a0a1a",
                    border: `2px solid ${isPicked ? "#fbbf24" : "#1e2a3a"}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: 4,
                    gap: 2,
                  }}
                >
                  <img
                    src={`/sprites/${num}-D-1.svg`}
                    alt={`Sprite ${num}`}
                    style={{ height: 52, imageRendering: "pixelated" }}
                  />
                  <span style={{ color: isPicked ? "#fbbf24" : "#475569", fontSize: 7, fontFamily: "monospace" }}>
                    #{num}
                  </span>
                </button>
              );
            })}
          </div>

          <p style={{ color: "#475569", fontSize: 8, marginTop: 16, lineHeight: 1.5 }}>
            Pick a pixel sprite for each staff member. Sprites use the same {`{n}-D-{frame}`} format as claw-empire
            and animate while working in the office.
          </p>
        </div>
      </div>
    </div>
  );
}
