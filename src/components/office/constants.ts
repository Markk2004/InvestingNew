/** Layout constants adapted from claw-empire office-view/model.ts */
export const MIN_OFFICE_W = 360;
export const CEO_ZONE_H = 110;
export const HALLWAY_H = 32;
export const BREAK_ROOM_H = 110;
export const BREAK_ROOM_GAP = 24;
export const SLOT_W = 100;
export const SLOT_H = 120;
export const COLS_PER_ROW = 3;
export const ROOM_PAD = 16;
export const CEO_SPEED = 7;

export interface RoomTheme {
  floor1: string;
  floor2: string;
  wall: string;
  accent: string;
}

export const DEPT_THEMES: Record<string, RoomTheme> = {
  executive: { floor1: "#1a1810", floor2: "#16140c", wall: "#4a3c18", accent: "#a77d0c" },
  "ai-lab": { floor1: "#0e1420", floor2: "#0c121c", wall: "#1e3a5f", accent: "#3b82f6" },
  trading: { floor1: "#081410", floor2: "#06120e", wall: "#14532d", accent: "#22c55e" },
};

export const CEO_THEME: RoomTheme = {
  floor1: "#101020",
  floor2: "#0e0e1c",
  wall: "#2a2450",
  accent: "#fbbf24",
};

export const BREAK_THEME: RoomTheme = {
  floor1: "#141210",
  floor2: "#10100e",
  wall: "#302a20",
  accent: "#f0c878",
};
