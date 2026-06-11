"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Agent } from "@/lib/agents";
import { PIXELTRADE_AGENTS, PIXELTRADE_DEPARTMENTS } from "@/lib/agents";
import OfficeView from "@/components/OfficeView";

const INITIAL_PORTFOLIO = [
  { sym: "AAPL", price: 182.3, qty: 5, cost: 165.0 },
  { sym: "NVDA", price: 875.2, qty: 2, cost: 790.0 },
  { sym: "MSFT", price: 415.6, qty: 3, cost: 380.0 },
  { sym: "GOOG", price: 172.4, qty: 4, cost: 155.0 },
  { sym: "AMZN", price: 184.7, qty: 3, cost: 170.0 },
  { sym: "TSLA", price: 178.9, qty: 2, cost: 200.0 },
  { sym: "META", price: 492.1, qty: 2, cost: 450.0 },
  { sym: "TSM", price: 152.3, qty: 4, cost: 140.0 },
  { sym: "INTC", price: 30.2, qty: 8, cost: 38.0 },
  { sym: "AMD", price: 158.4, qty: 3, cost: 145.0 },
  { sym: "PLTR", price: 23.8, qty: 10, cost: 20.0 },
  { sym: "COIN", price: 212.5, qty: 1, cost: 195.0 },
];

interface ShareRow {
  sym: string;
  price: number;
  qty: number;
  cost: number;
  prevPrice: number;
}

function ShareLine({ share }: { share: ShareRow }) {
  const pnl = (share.price - share.cost) * share.qty;
  const pct = ((share.price - share.cost) / share.cost * 100).toFixed(1);
  const up = share.price >= share.prevPrice;
  const changed = share.price !== share.prevPrice;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 46px",
        alignItems: "center",
        padding: "2px 6px",
        background: "#040c18",
        borderLeft: `2px solid ${pnl >= 0 ? "#22c55e" : "#ef4444"}`,
        gap: 4,
        marginBottom: 1,
      }}
    >
      <span style={{ color: "#60a5fa", fontSize: 8, fontFamily: "monospace" }}>{share.sym}</span>
      <span
        className={changed ? (up ? "animate-tick-up" : "animate-tick-down") : ""}
        style={{
          color: up ? "#22c55e" : "#ef4444",
          fontSize: 8,
          fontFamily: "monospace",
          textAlign: "right",
          fontWeight: 700,
        }}
      >
        ${share.price.toFixed(2)}
      </span>
      <span style={{ color: pnl >= 0 ? "#22c55e" : "#ef4444", fontSize: 7, fontFamily: "monospace", textAlign: "right" }}>
        {pnl >= 0 ? "+" : ""}
        {pct}%
      </span>
    </div>
  );
}

interface OfficeTabProps {
  agents?: Agent[];
  spriteOverrides?: Record<string, number>;
}

export default function OfficeTab({ agents: agentsProp, spriteOverrides = {} }: OfficeTabProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>(() =>
    (agentsProp ?? PIXELTRADE_AGENTS).map((a) => ({
      ...a,
      sprite_number: spriteOverrides[a.id] ?? a.sprite_number,
    })),
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [balance, setBalance] = useState(70.8);
  const [clock, setClock] = useState("");
  const [shares, setShares] = useState<ShareRow[]>(
    INITIAL_PORTFOLIO.map((s) => ({ ...s, prevPrice: s.price })),
  );

  useEffect(() => {
    setAgents(
      (agentsProp ?? PIXELTRADE_AGENTS).map((a) => ({
        ...a,
        sprite_number: spriteOverrides[a.id] ?? a.sprite_number,
      })),
    );
  }, [agentsProp, spriteOverrides]);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    update();
    const iv = setInterval(update, 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setShares((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.48) * (s.price * 0.005);
          const newPrice = Math.max(0.01, parseFloat((s.price + delta).toFixed(2)));
          return { ...s, prevPrice: s.price, price: newPrice };
        }),
      );
      setBalance((b) => parseFloat((b + (Math.random() - 0.4) * 1.5).toFixed(2)));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const workingCount = agents.filter((a) => a.status === "working").length;
  const avgCost = 55.07;
  const totalPnl = shares.reduce((acc, s) => acc + (s.price - s.cost) * s.qty, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <OfficeView
          departments={PIXELTRADE_DEPARTMENTS}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(agent) => setSelectedAgentId(agent.id)}
        />
      </div>
    </div>
  );
}
