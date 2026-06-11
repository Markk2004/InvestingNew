import type { Agent, Department } from "@/lib/agents";

export interface Coordinates {
  x: number;
  y: number;
}

export interface CeoState {
  pos: Coordinates;
  sprite: number;
  agent: Agent;
}
