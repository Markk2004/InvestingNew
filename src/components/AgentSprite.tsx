"use client";

import { useEffect, useState } from "react";
import type { AgentStatus } from "@/lib/agents";

interface AgentSpriteProps {
  spriteNum: number;
  status?: AgentStatus;
  name?: string;
  taskLabel?: string;
  flip?: boolean;
  height?: number;
  onClick?: () => void;
  className?: string;
}

export default function AgentSprite({
  spriteNum,
  status = "idle",
  name,
  taskLabel,
  flip = false,
  height = 52,
  onClick,
  className = "",
}: AgentSpriteProps) {
  const [frame, setFrame] = useState(1);
  const isWorking = status === "working";
  const isOffline = status === "offline";
  const isBreak = status === "break";

  useEffect(() => {
    if (!isWorking) {
      setFrame(1);
      return;
    }
    const id = setInterval(() => setFrame((f) => (f % 3) + 1), 280);
    return () => clearInterval(id);
  }, [isWorking]);

  return (
    <div
      className={`office-agent ${className}`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        transform: flip ? "scaleX(-1)" : undefined,
        opacity: isOffline ? 0.35 : 1,
        filter: isOffline ? "grayscale(0.8)" : undefined,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {name && (
        <span className="office-agent-name" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
          {name}
        </span>
      )}

      {isWorking && taskLabel && (
        <div className="office-speech-bubble" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
          💬 {taskLabel}
        </div>
      )}

      {isBreak && (
        <span className="office-status-emoji" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
          ☕
        </span>
      )}
      {isOffline && (
        <span className="office-status-emoji" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
          💤
        </span>
      )}

      <img
        src={`/sprites/${spriteNum}-D-${frame}.svg`}
        alt={name ?? "agent"}
        className={isWorking ? "office-agent-sprite-working" : ""}
        style={{
          height,
          width: "auto",
          imageRendering: "pixelated",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
        draggable={false}
      />
    </div>
  );
}
