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

export type Task = any;
export type SubAgent = any;
export type MeetingPresence = any;
export type CeoOfficeCall = any;
export type CrossDeptDelivery = any;
export type CliStatusMap = any;
export type MeetingReviewDecision = any;