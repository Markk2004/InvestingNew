"use client";

import { useEffect, useState, useMemo } from "react";
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
  const [avgCost, setAvgCost] = useState(55.07);
  const [clock, setClock] = useState("");
  const [shares, setShares] = useState<ShareRow[]>(
    INITIAL_PORTFOLIO.map((s) => ({ ...s, prevPrice: s.price })),
  );

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (typeof data.cash_balance === "number") setBalance(data.cash_balance);
          if (typeof data.average_cost === "number") setAvgCost(data.average_cost);
        }
      })
      .catch((err) => console.error("Failed to fetch portfolio from backend:", err));
  }, []);

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

  const [hasPendingNews, setHasPendingNews] = useState(false);
  const [unreadLogs, setUnreadLogs] = useState<any[]>([]);
  const [techieModal, setTechieModal] = useState<{ open: boolean; log?: any } | null>(null);
  const [diagnoseReport, setDiagnoseReport] = useState<any | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const unreadAgentIds = useMemo(() => {
    const s = new Set<string>();
    if (hasPendingNews) s.add("gemini");
    if (unreadLogs.length > 0) s.add("techie");
    return s;
  }, [hasPendingNews, unreadLogs]);

  const handleCloseModal = () => {
    setTechieModal(null);
    setDiagnoseReport(null);
    setIsDiagnosing(false);
  };

  const handleRunDiagnostics = async () => {
    if (isDiagnosing) return;
    setIsDiagnosing(true);
    setDiagnoseReport(null);
    try {
      // Simulate retro-scanning delay for cool visual effect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await fetch("http://localhost:8080/api/system/diagnose");
      const data = await res.json();
      setDiagnoseReport(data);
    } catch (e) {
      console.error("Failed to run system diagnostics:", e);
      setDiagnoseReport({
        status: "critical",
        database: { status: "error", message: "ไม่สามารถเชื่อมต่อระบบ API หลังบ้านได้" },
        gemini_api: { status: "error", message: "ตรวจสอบไม่ได้ (API ออฟไลน์)" },
        yahoo_api: { status: "error", message: "ตรวจสอบไม่ได้ (API ออฟไลน์)" },
        system_info: { php_version: "-", laravel_version: "-", memory_usage: "-" }
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  // 1. Check for pending news to trigger the NEW! emotion box on Gemini
  useEffect(() => {
    const checkNews = () => {
      fetch("/api/news")
        .then((res) => res.json())
        .then((data) => {
          setHasPendingNews(!!(data && data.pendingArticles && data.pendingArticles.length > 0));
        })
        .catch(() => {});
    };
    checkNews();
    const iv = setInterval(checkNews, 15000); // Poll every 15s (only hits DB cache via backend)
    return () => clearInterval(iv);
  }, []);

  // 1b. Poll unread error logs to trigger Alert on Techie
  useEffect(() => {
    const checkLogs = () => {
      fetch("http://localhost:8080/api/system/log/unread")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.logs)) {
            setUnreadLogs(data.logs);
          }
        })
        .catch(() => {});
    };
    checkLogs();
    const iv = setInterval(checkLogs, 10000); // Poll every 10s
    return () => clearInterval(iv);
  }, []);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgentId(agent.id);
    if (agent.id === "techie") {
      setTechieModal({
        open: true,
        log: unreadLogs.length > 0 ? unreadLogs[0] : null,
      });
    }
  };

  const handleResolveLogs = async () => {
    try {
      await fetch("http://localhost:8080/api/system/log/read", { method: "POST" }); // Marks them as read on Laravel
      setUnreadLogs([]);
      setTechieModal(null);
    } catch (e) {
      console.error("Failed to resolve logs:", e);
    }
  };



  const workingCount = agents.filter((a) => a.status === "working").length;
  const totalPnl = shares.reduce((acc, s) => acc + (s.price - s.cost) * s.qty, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <OfficeView
          departments={PIXELTRADE_DEPARTMENTS}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          unreadAgentIds={unreadAgentIds}
        />
      </div>

      {/* QA Debug Trigger for Techie Modal */}
      <button 
        id="qa-trigger-techie-modal"
        onClick={() => handleSelectAgent({ id: "techie" } as any)}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(13, 27, 48, 0.82)",
          border: "1px solid #1e3a5f",
          color: "#4fc3f7",
          fontSize: "9px",
          padding: "3px 8px",
          cursor: "pointer",
          zIndex: 9999,
          borderRadius: 2,
          fontFamily: "monospace",
          textShadow: "0 0 2px #4fc3f7"
        }}
      >
        [QA] Open Techie Modal
      </button>

      {/* Retro dialogue box for Techie diagnostics */}
      {techieModal && techieModal.open && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: 480,
            background: "#050b14",
            border: `2px solid ${
              isDiagnosing
                ? "#fbbf24"
                : diagnoseReport
                ? (diagnoseReport.status === "healthy" ? "#22c55e" : diagnoseReport.status === "warning" ? "#fbbf24" : "#ef4444")
                : (techieModal.log ? (techieModal.log.type === "error" ? "#ef4444" : "#fbbf24") : "#22c55e")
            }`,
            borderRadius: 4,
            padding: "14px 18px",
            color: "white",
            fontFamily: "monospace",
            boxShadow: `0 8px 30px rgba(0,0,0,0.8), 0 0 15px ${
              isDiagnosing || (diagnoseReport && diagnoseReport.status === "warning")
                ? "rgba(251,191,36,0.25)"
                : diagnoseReport && diagnoseReport.status === "critical"
                ? "rgba(239,68,68,0.25)"
                : (techieModal.log ? (techieModal.log.type === "error" ? "rgba(239,68,68,0.25)" : "rgba(251,191,36,0.25)") : "rgba(34,197,94,0.15)")
            }`,
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #0d2040", paddingBottom: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>🛠️</span>
            <div>
              <div style={{ 
                color: isDiagnosing 
                  ? "#fbbf24" 
                  : diagnoseReport 
                  ? (diagnoseReport.status === "healthy" ? "#22c55e" : diagnoseReport.status === "warning" ? "#fbbf24" : "#ef4444")
                  : (techieModal.log ? (techieModal.log.type === "error" ? "#ef4444" : "#fbbf24") : "#22c55e"), 
                fontWeight: "bold", 
                fontSize: 11, 
                letterSpacing: 1 
              }}>
                {isDiagnosing 
                  ? "TECHIE: RUNNING SYSTEM CHECK... 🔍" 
                  : diagnoseReport 
                  ? `TECHIE: DIAGNOSTICS REPORT - ${diagnoseReport.status.toUpperCase()} ${diagnoseReport.status === "healthy" ? "✅" : diagnoseReport.status === "warning" ? "⚠️" : "🚨"}`
                  : (techieModal.log ? (techieModal.log.type === "error" ? "TECHIE: SYSTEM ERROR ALERT! ⚠️" : "TECHIE: SYSTEM PERFORMANCE LOG ⚡") : "TECHIE: SYSTEM STATUS OK ✅")}
              </div>
              <div style={{ color: "#475569", fontSize: 8 }}>
                SYSADMIN DIAGNOSTICS & LOG MONITOR
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "#475569",
                fontSize: 14,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          {isDiagnosing ? (
            <div style={{ padding: "12px 10px", color: "#fbbf24", fontSize: 9, lineHeight: 1.8 }}>
              <div style={{ fontWeight: "bold", borderBottom: "1px dashed #fbbf2430", paddingBottom: 4, marginBottom: 8, textAlign: "center" }}>
                📡 กำลังแสกนสถานะเครือข่ายและระบบบริการ...
              </div>
              <div style={{ animation: "pulse 1.5s infinite" }}>
                · Checking MySQL database status...<br />
                · Ping Google Gemini AI services...<br />
                · Testing Yahoo Finance data feeds...
              </div>
              <div style={{ marginTop: 12, textAlign: "center", fontSize: 7, color: "#475569" }}>
                PLEASE WAIT — TESTING LATENCY
              </div>
            </div>
          ) : diagnoseReport ? (
            <div style={{ fontSize: 9, lineHeight: 1.6 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#08101c", border: "1px solid #1e3a5f", padding: "10px 12px", borderRadius: 2, marginBottom: 10 }}>
                {/* DB */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#cbd5e1" }}>📁 DATABASE (MySQL)</span>
                  <span style={{ color: diagnoseReport.database.status === "ok" ? "#22c55e" : "#ef4444", fontWeight: "bold" }}>
                    {diagnoseReport.database.status === "ok" ? `🟢 ONLINE (${diagnoseReport.database.latency_ms}ms)` : "🔴 OFFLINE"}
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: 8, paddingLeft: 10, marginTop: -2, borderLeft: "1px solid #1e3a5f", wordBreak: "break-all" }}>
                  {diagnoseReport.database.message}
                </div>

                {/* Gemini */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <span style={{ color: "#cbd5e1" }}>🤖 GEMINI AI API</span>
                  <span style={{ color: diagnoseReport.gemini_api.status === "ok" ? "#22c55e" : "#ef4444", fontWeight: "bold" }}>
                    {diagnoseReport.gemini_api.status === "ok" ? `🟢 ONLINE (${diagnoseReport.gemini_api.latency_ms}ms)` : "🔴 ERROR"}
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: 8, paddingLeft: 10, marginTop: -2, borderLeft: "1px solid #1e3a5f", wordBreak: "break-all" }}>
                  {diagnoseReport.gemini_api.message}
                </div>

                {/* Yahoo */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  <span style={{ color: "#cbd5e1" }}>📈 YAHOO FINANCE FEED</span>
                  <span style={{ color: diagnoseReport.yahoo_api.status === "ok" ? "#22c55e" : "#ef4444", fontWeight: "bold" }}>
                    {diagnoseReport.yahoo_api.status === "ok" ? `🟢 ONLINE (${diagnoseReport.yahoo_api.latency_ms}ms)` : "🔴 ERROR"}
                  </span>
                </div>
                <div style={{ color: "#64748b", fontSize: 8, paddingLeft: 10, marginTop: -2, borderLeft: "1px solid #1e3a5f", wordBreak: "break-all" }}>
                  {diagnoseReport.yahoo_api.message}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#1e3a5f", margin: "4px 0" }} />

                {/* System info */}
                <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", fontSize: 7.5 }}>
                  <span>PHP: {diagnoseReport.system_info.php_version}</span>
                  <span>Laravel: {diagnoseReport.system_info.laravel_version}</span>
                  <span>RAM: {diagnoseReport.system_info.memory_usage}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={handleRunDiagnostics}
                  style={{
                    background: "#0f172a",
                    border: "1px solid #3b82f6",
                    color: "#3b82f6",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  🔄 RE-RUN CHECK
                </button>
                <button
                  onClick={() => setDiagnoseReport(null)}
                  style={{
                    background: "transparent",
                    border: "1px solid #1e3a5f",
                    color: "#475569",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  ◀ BACK
                </button>
              </div>
            </div>
          ) : techieModal.log ? (
            <div>
              <div style={{ 
                background: "#08101c", 
                border: `1px solid ${techieModal.log.type === "error" ? "#ef444420" : "#fbbf2420"}`, 
                padding: "8px 10px", 
                borderRadius: 2, 
                marginBottom: 10 
              }}>
                <div style={{ color: "#fbbf24", fontSize: 8, textTransform: "uppercase", marginBottom: 2 }}>
                  [Source]: {techieModal.log.url || "Unknown"}
                </div>
                <div style={{ color: techieModal.log.type === "error" ? "#fca5a5" : "#fef08a", fontSize: 10, fontWeight: "bold", wordBreak: "break-all" }}>
                  {techieModal.log.message}
                </div>
                {techieModal.log.stack_trace && (
                  <div
                    style={{
                      marginTop: 6,
                      background: "#03080f",
                      border: "1px solid #0d2040",
                      padding: 5,
                      maxHeight: 100,
                      overflowY: "auto",
                      fontSize: 8,
                      color: "#64748b",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                    }}
                  >
                    {techieModal.log.stack_trace}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  onClick={handleRunDiagnostics}
                  style={{
                    background: "#071a30",
                    border: "1px solid #1e3a5f",
                    color: "#4fc3f7",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  🔍 DIAGNOSE SYSTEM
                </button>
                <button
                  onClick={handleResolveLogs}
                  style={{
                    background: "#0d2e13",
                    border: "1px solid #22c55e",
                    color: "#22c55e",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#14532d")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#0d2e13")}
                >
                  ✓ RESOLVE & CLEAR ERROR
                </button>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: "transparent",
                    border: "1px solid #1e3a5f",
                    color: "#475569",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  IGNORE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ padding: "8px 0", color: "#4ade80", fontSize: 10, textAlign: "center", lineHeight: 1.6 }}>
                "ระบบทั้งหมดทำงานเป็นปกติครับท่าน! ไม่มีข้อผิดพลาดที่ยังไม่ได้รับการแก้ไขในขณะนี้"
                <div style={{ color: "#475569", fontSize: 7, marginTop: 2 }}>
                  (System status: NORMAL. All services online. No unread logs.)
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  onClick={handleRunDiagnostics}
                  style={{
                    background: "#071a30",
                    border: "1px solid #1e3a5f",
                    color: "#4fc3f7",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginRight: "auto",
                  }}
                >
                  🔍 DIAGNOSE SYSTEM
                </button>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: "#071a30",
                    border: "1px solid #1e3a5f",
                    color: "#4fc3f7",
                    fontSize: 9,
                    padding: "4px 12px",
                    cursor: "pointer",
                  }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
