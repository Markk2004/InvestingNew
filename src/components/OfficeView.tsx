"use client";

import { useMemo } from "react";
import type { Agent, Department } from "@/lib/agents";
import { useOfficeSetup } from "./office-view/useOfficeSetup";
import VirtualPadOverlay from "./office-view/VirtualPadOverlay";

export interface OfficeViewProps {
  departments: Department[];
  agents: Agent[];
  selectedAgentId?: string | null;
  onSelectAgent?: (agent: Agent) => void;
  onSelectDepartment?: (dept: Department) => void;
}

const EMPTY_TASKS: any[] = [];
const EMPTY_SUBAGENTS: any[] = [];

export default function OfficeView({
  departments,
  agents,
}: OfficeViewProps) {
  const sortedDepts = useMemo(
    () => [...departments].sort((a, b) => a.sort_order - b.sort_order),
    [departments]
  );

  const { containerRef, keysRef } = useOfficeSetup({
    departments: sortedDepts,
    agents,
    tasks: EMPTY_TASKS,
    subAgents: EMPTY_SUBAGENTS
  });

  const workingCount = agents.filter((a) => a.status === "working").length;
  const staffCount = agents.length;

  const setMove = (code: string, pressed: boolean) => {
    keysRef.current[code] = pressed;
  };

  return (
    <div className="font-body-md text-on-surface flex flex-1 flex-col overflow-hidden bg-[#fcf9ef] h-full w-full relative">

      {/* ── OFFICE CANVAS ── */}
      <div
        className="flex-1 overflow-auto custom-scrollbar relative"
        tabIndex={0}
        style={{ background: "#0a0a1a" }}
      >
        <div ref={containerRef} className="w-full h-full relative" />
      </div>

      <VirtualPadOverlay setMove={setMove} />
    </div>
  );
}
