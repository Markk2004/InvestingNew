"use client";

import type { Agent, Department } from "@/lib/agents";
import { getSpriteNum } from "@/lib/spriteMap";
import AgentSprite from "@/components/AgentSprite";
import { COLS_PER_ROW, ROOM_PAD, SLOT_H, SLOT_W, type RoomTheme } from "./constants";

interface OfficeRoomProps {
  department: Department;
  agents: Agent[];
  theme: RoomTheme;
  spriteMap: Map<string, number>;
  onSelectDepartment?: (dept: Department) => void;
  onSelectAgent?: (agent: Agent) => void;
}

export default function OfficeRoom({
  department,
  agents,
  theme,
  spriteMap,
  onSelectDepartment,
  onSelectAgent,
}: OfficeRoomProps) {
  const deptAgents = agents.filter((a) => a.department_id === department.id);

  return (
    <section
      className="office-room office-dept-room"
      style={
        {
          "--floor-1": theme.floor1,
          "--floor-2": theme.floor2,
          "--room-wall": theme.wall,
          "--room-accent": theme.accent,
          "--room-accent-glow": `${theme.accent}22`,
        } as React.CSSProperties
      }
    >
      <div className="office-room-floor" />
      <div className="office-room-glow" />

      <button
        type="button"
        className="office-room-sign"
        style={{ background: theme.accent }}
        onClick={() => onSelectDepartment?.(department)}
      >
        {department.icon} {department.name}
      </button>

      <div className="office-wall-clock" title="Wall clock">
        🕐
      </div>
      <div className="office-window" style={{ left: 12 }} />
      <div className="office-window" style={{ right: 12 }} />
      <span className="office-dept-decor office-plant" style={{ left: 8 }}>
        🪴
      </span>
      <span className="office-dept-decor office-plant" style={{ right: 8 }}>
        🌿
      </span>

      {deptAgents.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9a8a7a",
            fontSize: 10,
            zIndex: 1,
          }}
        >
          No agents assigned
        </div>
      )}

      {deptAgents.map((agent, idx) => {
        const col = idx % COLS_PER_ROW;
        const row = Math.floor(idx / COLS_PER_ROW);
        const left = ROOM_PAD + col * SLOT_W + SLOT_W / 2 - 50;
        const top = 38 + row * SLOT_H;
        const spriteNum = getSpriteNum(agent, spriteMap);
        const isWorking = agent.status === "working";

        return (
          <div
            key={agent.id}
            className="office-desk-slot"
            style={{ left, top, zIndex: top + 10 }}
          >
            <div className="office-chair" />
            <AgentSprite
              spriteNum={spriteNum}
              status={agent.status}
              name={agent.name}
              taskLabel={isWorking ? "Analyzing..." : undefined}
              height={52}
              onClick={() => onSelectAgent?.(agent)}
            />
            <div className={`office-desk ${isWorking ? "working" : ""}`} />
          </div>
        );
      })}
    </section>
  );
}
