"use client";

import type { Agent } from "@/lib/agents";
import { buildSpriteMap, getSpriteNum } from "@/lib/spriteMap";

interface AgentAvatarProps {
  agent: Agent | undefined;
  agents?: Agent[];
  spriteMap?: Map<string, number>;
  size?: number;
  className?: string;
}

export default function AgentAvatar({
  agent,
  agents,
  spriteMap,
  size = 28,
  className = "",
}: AgentAvatarProps) {
  const map = spriteMap ?? (agents ? buildSpriteMap(agents) : new Map());
  const spriteNum = getSpriteNum(agent, map);

  if (spriteNum) {
    return (
      <div
        className={`overflow-hidden rounded-full bg-gray-800 flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={`/sprites/${spriteNum}-D-1.png`}
          alt={agent?.name ?? ""}
          className="h-full w-full object-cover object-bottom"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gray-800 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {agent?.avatar_emoji ?? "🤖"}
    </div>
  );
}
