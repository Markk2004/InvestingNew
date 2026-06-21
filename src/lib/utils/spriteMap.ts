import type { Agent } from "../api/agents";

/** Stable sprite assignment — same rules as claw-empire AgentAvatar */
export function buildSpriteMap(agents: Agent[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const agent of agents) {
    if (agent.sprite_number != null && agent.sprite_number > 0) {
      map.set(agent.id, agent.sprite_number);
    }
  }

  const rest = [...agents]
    .filter((a) => !map.has(a.id))
    .sort((a, b) => a.id.localeCompare(b.id));

  rest.forEach((agent, i) => map.set(agent.id, (i % 12) + 1));
  return map;
}

export function getSpriteNum(agent: Agent | undefined, spriteMap: Map<string, number>): number {
  if (!agent) return 1;
  if (agent.sprite_number != null && agent.sprite_number > 0) return agent.sprite_number;
  return spriteMap.get(agent.id) ?? 1;
}
