export type AgentRole = "team_leader" | "senior" | "junior" | "intern";
export type AgentStatus = "idle" | "working" | "break" | "offline";

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface Agent {
  id: string;
  name: string;
  department_id: string;
  role: AgentRole;
  avatar_emoji: string;
  sprite_number: number | null;
  status: AgentStatus;
  personality: string | null;
  cli_provider?: string;
}

export const PIXELTRADE_DEPARTMENTS: Department[] = [
  { id: "executive", name: "Executive", icon: "👑", color: "#a77d0c", sort_order: 1 },
  { id: "ai-lab", name: "AI Lab", icon: "🤖", color: "#3b82f6", sort_order: 2 },
  { id: "trading", name: "Trading Floor", icon: "📈", color: "#22c55e", sort_order: 3 },
];

export const PIXELTRADE_AGENTS: Agent[] = [
  {
    id: "mxrk",
    name: "Mxrk",
    department_id: "executive",
    role: "team_leader",
    avatar_emoji: "👔",
    sprite_number: 1,
    status: "idle",
    personality: "CEO & workspace designer",
  },
  {
    id: "gemini",
    name: "Gemini",
    department_id: "ai-lab",
    role: "senior",
    avatar_emoji: "✨",
    sprite_number: 2,
    status: "working",
    personality: "AI analyst processing market intel",
  },
  {
    id: "newinvester",
    name: "NewInvester",
    department_id: "trading",
    role: "junior",
    avatar_emoji: "💹",
    sprite_number: 3,
    status: "working",
    personality: "Portfolio trader — 12 shares @ $55.07",
  },
  {
    id: "eve",
    name: "Evelyn",
    department_id: "executive",
    role: "senior",
    avatar_emoji: "👩‍💼",
    sprite_number: 4,
    status: "working",
    personality: "COO & Operations Lead",
  },
  {
    id: "techie",
    name: "Techie",
    department_id: "executive",
    role: "senior",
    avatar_emoji: "🛠️",
    sprite_number: 5,
    status: "idle",
    personality: "QA & SysAdmin — System health check expert",
  },
];

/**
 * A work item assigned to an agent.
 */
export interface Task {
  id: string;
  title: string;
  agent_id?: string;
  /** The agent currently working on this task (used by buildScene-final-layers). */
  assigned_agent_id?: string;
  department_id?: string;
  status?: "todo" | "in_progress" | "done" | string;
}

/**
 * A sub-process / clone spawned by a senior agent.
 */
export interface SubAgent {
  id: string;
  /** camelCase matches usage in buildScene-department-agent.ts */
  parentAgentId: string;
  name?: string;
  status?: AgentStatus;
}

/**
 * Tracks which agent is seated in the CEO meeting room and when they leave.
 * `until` is a Unix-ms timestamp.
 * `seat_index` maps to the ceoMeetingSeats array index.
 * `phase` controls the meeting badge displayed ("kickoff" | "review").
 * `decision` carries the review verdict when phase === "review".
 */
export interface MeetingPresence {
  agent_id: string;
  until: number;
  /** Seat slot index in ceoMeetingSeats array; optional for backwards-compat. */
  seat_index?: number;
  phase?: "kickoff" | "review";
  decision?: string;
}

/**
 * An event that moves an agent to the CEO office for a meeting or dismisses them.
 * `action` === "walk"    → animate agent walking to CEO room
 * `action` === "speak"   → render a speech bubble at the seat
 * `action` === "dismiss" → remove agent from CEO room
 */
export interface CeoOfficeCall {
  id: string;
  fromAgentId: string;
  action: "walk" | "speak" | "dismiss";
  seatIndex: number;
  phase?: "kickoff" | "review";
  decision?: string;
  line?: string;
  holdUntil?: number; // Unix-ms — how long the agent stays in the room
}

/**
 * A package/document delivery animation from one department to another.
 */
export interface CrossDeptDelivery {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  from_dept_id?: string;
  to_dept_id?: string;
}

/** CLI tool utilisation snapshot keyed by provider name. */
export type CliStatusMap = Record<
  string,
  {
    windows?: Array<{ utilization: number }>;
    installed?: boolean;
    authenticated?: boolean;
  }
>;

/** The outcome of a meeting-minutes review modal. */
export type MeetingReviewDecision = "approve" | "reject" | "defer" | string;