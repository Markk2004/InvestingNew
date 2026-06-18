// ─────────────────────────────────────────────────────────────
//  News Dashboard Page — /news
//  Pixel Art 8-bit HUD themed news analysis dashboard.
//  Moved from / to allow Home to be the office scene.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import type { NewsApiResponse } from "@/lib/types";
import Header from "@/components/Header";
import MarketGauge from "@/components/MarketGauge";
import NewsGrid from "@/components/NewsGrid";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorBanner from "@/components/ErrorBanner";
import CyberHudDashboard from "@/components/CyberHudDashboard";
import { useTheme } from "@/components/ThemeProvider";

// ── SWR fetcher ──────────────────────────────────────────────

const fetcher = (url: string): Promise<NewsApiResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

const SWR_CONFIG = {
  refreshInterval: 10 * 60 * 1000, // 10 min — balanced for daily news cache
  revalidateOnFocus: false,
  dedupingInterval: 5 * 60 * 1000, // 5 min dedup window
} as const;

// ── Toast Types ─────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning";
interface Toast { id: number; message: string; type: ToastType; }

// ── Page Component ────────────────────────────────────────────

export default function NewsDashboardPage() {
  const { theme } = useTheme();
  const isCrimson = theme === "crimson";
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formattedDate, setFormattedDate] = useState<string>("");

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormattedDate(
        new Date().toLocaleDateString("th-TH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<NewsApiResponse>(`/api/news?page=${page}`, fetcher, SWR_CONFIG);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // Show toast if background fetch hits token limit
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (data?.error && data.error.includes("TOKEN_LIMIT_REACHED")) {
      timer = setTimeout(() => {
        showToast("⚠️ Token ถึง limit แล้ว — ไม่สามารถดึงข่าวใหม่ได้ทั้งหมดในขณะนี้", "warning");
      }, 0);
    } else if (data?.error && data.error.includes("INSUFFICIENT_BALANCE")) {
      timer = setTimeout(() => {
        showToast("❌ ยอดเงินในบัญชี DeepSeek ของคุณไม่เพียงพอ (Insufficient Balance)", "error");
      }, 0);
    } else if (data?.error && data.error.includes("INVALID_API_KEY")) {
      timer = setTimeout(() => {
        showToast("❌ API Key ของ DeepSeek ไม่ถูกต้องหรือหมดอายุ", "error");
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [data?.error, showToast]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPage(1);
    try {
      const result = await mutate(
        fetcher("/api/news?force=true&page=1"),
        { revalidate: false }
      );

      // Check if API indicates token limit reached
      if (result?.error && result.error.includes("TOKEN_LIMIT_REACHED")) {
        showToast("⚠️ Token ถึง limit แล้ว — ไม่สามารถดึงข่าวใหม่ได้ทั้งหมดในขณะนี้", "warning");
      } else if (result?.error && result.error.includes("INSUFFICIENT_BALANCE")) {
        showToast("❌ ยอดเงินในบัญชี DeepSeek ของคุณไม่เพียงพอ (Insufficient Balance)", "error");
      } else if (result?.error && result.error.includes("INVALID_API_KEY")) {
        showToast("❌ API Key ของ DeepSeek ไม่ถูกต้องหรือหมดอายุ", "error");
      } else {
        const count = result?.articles?.length ?? 0;
        const pending = result?.pendingArticles?.length ?? 0;
        showToast(`✅ อัปเดตแล้ว: ${count} ข่าว${pending > 0 ? ` (+${pending} รอคิว)` : ""}`, "success");
      }
    } catch (err) {
      console.error("Failed to force refresh news:", err);
      showToast("❌ เกิดข้อผิดพลาดในการดึงข้อมูล", "error");
    } finally {
      setIsRefreshing(false);
    }
  };

  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false);

  // Automatically trigger scan and analysis on mount ONLY if the DB cache is empty
  useEffect(() => {
    if (data && data.articles && data.articles.length === 0 && !isRefreshing && !hasAutoRefreshed) {
      setHasAutoRefreshed(true);
      handleRefresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isRefreshing, hasAutoRefreshed]);

  // Auto-process queue if there are pending articles
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (data?.pendingArticles && data.pendingArticles.length > 0) {
      interval = setInterval(async () => {
        try {
          // Process the queue directly without hitting RSS cooldowns
          await fetch("/api/news?process_queue=true");
          mutate(); // Seamlessly update UI with newly analyzed articles
        } catch (e) {
          console.error("Failed to process news queue:", e);
        }
      }, 300000); // Check every 5 minutes (300,000 ms)
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data?.pendingArticles, mutate]);

  const hasError = !!error || (data?.error != null && data.articles.length === 0);
  const errorMessage = error?.message ?? data?.error;
  const isUpdating = isLoading || isValidating || isRefreshing;

  const renderContent = () => (
    <div
      className="min-h-screen relative"
      style={{ background: isCrimson ? "transparent" : "var(--color-bg-page)", color: "var(--foreground)" }}
    >
      {/* ── Toast Notifications ───────────────────────────── */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="font-pixel px-4 py-3 animate-pixel-fade-in"
            style={{
              fontSize: "12px",
              background: "var(--color-news-bg-toast)",
              border: `2px solid ${
                toast.type === "success"
                  ? "var(--pixel-green)"
                  : toast.type === "warning"
                  ? "var(--pixel-yellow)"
                  : "var(--pixel-red)"
              }`,
              color:
                toast.type === "success"
                  ? "var(--pixel-green)"
                  : toast.type === "warning"
                  ? "var(--pixel-yellow)"
                  : "var(--pixel-red)",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              minWidth: "240px",
              maxWidth: "340px",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      {/* ── Refresh Loading Overlay ────────────────────────── */}
      {isRefreshing && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: "var(--color-news-bg-toast)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex flex-col items-center gap-4 p-8"
            style={{
               background: "var(--color-bg-header-toast)",
               border: "2px solid var(--color-news-border)",
               boxShadow: "0 0 30px var(--color-news-border)"
            }}
          >
            <div className="font-pixel text-xl animate-pulse" style={{ color: "var(--color-accent-primary)" }}>
              SCANNING GLOBAL NEWS...
            </div>
            <div className="font-pixel text-[10px] text-slate-400 tracking-widest">
              PLEASE WAIT — ANALYZING MARKET IMPACT
            </div>
            <div className="flex gap-2 mt-4">
              <div className="w-3 h-3 animate-bounce" style={{ backgroundColor: "var(--color-accent-primary)", animationDelay: "0ms" }}></div>
              <div className="w-3 h-3 animate-bounce" style={{ backgroundColor: "var(--color-accent-primary)", animationDelay: "150ms" }}></div>
              <div className="w-3 h-3 animate-bounce" style={{ backgroundColor: "var(--color-accent-primary)", animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pixel HUD Header ───────────────────────────────── */}
      {/* Header is now rendered globally inside CyberHudDashboard via headerProps */}

      {/* ── Back to Office Button ──────────────────────────── */}
      <div className="fixed bottom-5 left-5 z-50">
        <Link
          href="/"
          id="back-to-office-btn"
          className="back-office-btn font-pixel flex items-center gap-2 px-3 py-2 hover:scale-105 active:scale-95 transition-transform"
          style={{
            fontSize: "11px",
            background: "var(--color-button-bg)",
            border: "1px solid var(--color-button-border)",
            color: "var(--color-button-text)",
            boxShadow: "0 0 8px var(--color-button-border)",
            textDecoration: "none",
          }}
        >
          ◀ ESC กลับออฟฟิศ
        </Link>
      </div>

      {/* ── Main Content ──────────────────────────────────── */}
      <main className="pb-20">
        {/* Loading skeleton on first load */}
        {isLoading && !data && <LoadingSkeleton />}

        {/* Error state */}
        {hasError && !data?.articles.length && (
          <ErrorBanner message={errorMessage} onRetry={handleRefresh} />
        )}

        {/* Dashboard content */}
        {data && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* ── Top Row: Gauge + Stats ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <MarketGauge
                  averageSeverity={data.averageSeverity}
                  articleCount={data.articles.length}
                />
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  label="ข่าวที่วิเคราะห์"
                  value={`${data.articles.length}`}
                  sub="รายการ"
                  accent="blue"
                />
                <StatCard
                  label="ความเสี่ยงสูง"
                  value={`${data.articles.filter((a) => a.severityScore >= 7).length}`}
                  sub="คะแนน ≥ 7"
                  accent="red"
                />
                <StatCard
                  label="ปลอดภัย"
                  value={`${data.articles.filter((a) => a.severityScore < 7).length}`}
                  sub="คะแนน < 7"
                  accent="green"
                />
              </div>
            </div>

            {data.error && data.articles.length > 0 && (
              <div
                className="font-pixel px-4 py-3 flex items-center gap-2"
                style={{
                  fontSize: "11px",
                  border: "2px solid var(--pixel-yellow)",
                  background: "rgba(255,215,64,0.05)",
                  color: "var(--pixel-yellow)",
                }}
              >
                <span>⚠</span>
                <span>{data.error} — แสดงข้อมูล cache ล่าสุด</span>
              </div>
            )}

            {/* ── Today's Date Badge ────────────────────── */}
            <div
              className="date-badge-container flex items-center gap-3 px-4 py-2"
              style={{
                border: "1px solid rgba(79,195,247,0.2)",
                background: "rgba(79,195,247,0.04)",
              }}
            >
              <span className="font-pixel" style={{ fontSize: "11px", color: "var(--pixel-blue)" }}>
                📅 ข่าวล่าสุด:
              </span>
              <span className="font-pixel" style={{ fontSize: "11px", color: "#94a3b8" }}>
                {formattedDate}
              </span>
              <span
                className="font-pixel ml-auto"
                style={{ fontSize: "9px", color: "rgba(100,116,139,0.8)" }}
              >
                * โชว์ข่าวที่วิเคราะห์แล้วของวันนี้และเมื่อวาน
              </span>
            </div>

            {/* ── Status Line / AI Usage Status ────────── */}
            {data?.usage && (
              <div
                className="ai-status-container flex items-center gap-3 px-4 py-1.5"
                style={{
                  border: "1px dashed rgba(79,195,247,0.3)",
                  background: "rgba(79,195,247,0.02)",
                  marginTop: -16, // pull it up close to the date badge
                  borderTop: "none"
                }}
              >
                <span className="font-pixel text-[var(--pixel-blue)]" style={{ fontSize: "9px" }}>
                  ⚡ AI STATUS:
                </span>
                <span className="font-pixel text-slate-400" style={{ fontSize: "9px" }}>
                  Model: {data.usage.model} · Input: {data.usage.prompt_tokens.toLocaleString()} tokens · Output: {data.usage.completion_tokens.toLocaleString()} tokens · Est. Cost: ${data.usage.cost.toFixed(5)}
                </span>
                <span className="font-pixel text-emerald-400 ml-auto" style={{ fontSize: "8px" }}>
                  ● Connection OK (Balance Refilled)
                </span>
              </div>
            )}

            {/* ── News Grid (Analyzed only) ─────────────── */}
            <NewsGrid articles={data.articles} />

            {/* ── Pagination UI ───────────────────────────── */}
            {data.totalPages && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <button
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  className="pagination-btn font-pixel px-4 py-2 hover:bg-[rgba(79,195,247,0.1)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  style={{
                    fontSize: "12px",
                    border: "2px solid var(--pixel-blue)",
                    color: "var(--pixel-blue)",
                  }}
                >
                  ◀ PREV
                </button>
                <span className="font-pixel" style={{ fontSize: "12px", color: "var(--pixel-blue)" }}>
                  PAGE {page} / {data.totalPages}
                </span>
                <button
                  onClick={() => {
                    setPage(p => Math.min(data.totalPages || 1, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === data.totalPages}
                  className="pagination-btn font-pixel px-4 py-2 hover:bg-[rgba(79,195,247,0.1)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  style={{
                    fontSize: "12px",
                    border: "2px solid var(--pixel-blue)",
                    color: "var(--pixel-blue)",
                  }}
                >
                  NEXT ▶
                </button>
              </div>
            )}

            {/* ── Pending Queue Section ───────────────────── */}
            {data.pendingArticles && data.pendingArticles.length > 0 && (
              <div className="space-y-3">
                <div
                  className="pending-queue-header flex items-center gap-3 px-4 py-2"
                  style={{
                    border: "1px solid rgba(255,215,64,0.25)",
                    background: "rgba(255,215,64,0.04)",
                  }}
                >
                  <span
                    className="font-pixel animate-pulse"
                    style={{ fontSize: "11px", color: "var(--pixel-yellow)" }}
                  >
                    ⏳ ANALYSIS QUEUE
                  </span>
                  <span
                    className="font-pixel"
                    style={{ fontSize: "11px", color: "#94a3b8" }}
                  >
                    {data.pendingArticles.length} ข่าวรอคิววิเคราะห์ (จะถูกวิเคราะห์ในรอบถัดไป)
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {data.pendingArticles.map((article, index) => (
                    <a
                      key={`${article.id}-${index}`}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pending-queue-item flex items-center gap-3 px-4 py-2.5 hover:brightness-125 transition-all"
                      style={{
                        border: "1px solid rgba(255,215,64,0.2)",
                        background: "rgba(255,215,64,0.03)",
                        textDecoration: "none",
                      }}
                    >
                      <span
                        className="font-pixel flex-shrink-0"
                        style={{
                          fontSize: "9px",
                          color: "var(--pixel-yellow)",
                          border: "1px solid var(--pixel-yellow)",
                          padding: "2px 5px",
                        }}
                      >
                        PENDING
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#94a3b8",
                          fontFamily: "var(--font-mono), monospace",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {article.title}
                      </span>
                      <span
                        className="font-pixel flex-shrink-0 ml-auto"
                        style={{ fontSize: "10px", color: "#475569" }}
                      >
                        {article.source}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

  if (isCrimson) {
    return (
      <CyberHudDashboard 
        activeTab="news" 
        setActiveTab={() => {}}
        headerProps={{
          fetchedAt: data?.fetchedAt,
          isLoading: isUpdating,
          hasError: hasError,
          onRefresh: handleRefresh,
          usage: data?.usage
        }}
      >
        {renderContent()}
      </CyberHudDashboard>
    );
  }

  return renderContent();
}

// ── Pixel StatCard ───────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent: "blue" | "red" | "green";
}

const ACCENT_MAP: Record<StatCardProps["accent"], { border: string; color: string; bg: string }> = {
  blue:  { border: "var(--pixel-blue)",   color: "var(--pixel-blue)",   bg: "rgba(79,195,247,0.05)" },
  red:   { border: "var(--pixel-red)",    color: "var(--pixel-red)",    bg: "rgba(255,82,82,0.05)" },
  green: { border: "var(--pixel-green)",  color: "var(--pixel-green)",  bg: "rgba(105,255,71,0.05)" },
};

function StatCard({ label, value, sub, accent }: StatCardProps) {
  const s = ACCENT_MAP[accent];
  return (
    <div
      className="stat-card flex flex-col justify-between p-4"
      style={{
        border: `2px solid ${s.border}`,
        background: s.bg,
        boxShadow: `0 0 12px ${s.border}40`,
      }}
    >
      <p
        className="font-pixel uppercase tracking-wider"
        style={{ fontSize: "11px", color: "#94a3b8" }}
      >
        {label}
      </p>
      <div className="mt-3">
        <p
          className="font-pixel"
          style={{ fontSize: "24px", color: s.color, lineHeight: 1 }}
        >
          {value}
        </p>
        <p
          className="font-pixel mt-1.5"
          style={{ fontSize: "10px", color: "#64748b" }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}
