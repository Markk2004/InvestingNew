// ─────────────────────────────────────────────────────────────
//  News Dashboard Page — /news
//  Pixel Art 8-bit HUD themed news analysis dashboard.
//  Moved from / to allow Home to be the office scene.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import type { NewsApiResponse } from "@/lib/types";
import Header from "@/components/Header";
import MarketGauge from "@/components/MarketGauge";
import NewsGrid from "@/components/NewsGrid";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorBanner from "@/components/ErrorBanner";

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

// ── Page Component ───────────────────────────────────────────

export default function NewsDashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<NewsApiResponse>("/api/news", fetcher, SWR_CONFIG);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const result = await mutate(
        fetcher("/api/news?force=true"),
        { revalidate: false }
      );
      
      // Check if API indicates token limit reached
      if (result?.error && result.error.includes("TOKEN_LIMIT_REACHED")) {
        alert("Token ถึง limit แล้ว");
      } else {
        alert("นี่คือข่าวล่าสุดตอนนี้");
      }
    } catch (err) {
      console.error("Failed to force refresh news:", err);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasError = !!error || (data?.error != null && data.articles.length === 0);
  const errorMessage = error?.message ?? data?.error;
  const isUpdating = isLoading || isValidating || isRefreshing;

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--pixel-dark)", color: "var(--foreground)" }}
    >
      {/* ── Refresh Loading Overlay ────────────────────────── */}
      {isRefreshing && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: "rgba(13, 13, 43, 0.7)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex flex-col items-center gap-4 p-8"
            style={{
               background: "rgba(13, 13, 43, 0.95)",
               border: "2px solid var(--pixel-blue)",
               boxShadow: "0 0 30px rgba(79, 195, 247, 0.2)"
            }}
          >
            <div className="font-pixel text-xl animate-pulse" style={{ color: "var(--pixel-blue)" }}>
              SCANNING GLOBAL NEWS...
            </div>
            <div className="font-pixel text-[10px] text-slate-400 tracking-widest">
              PLEASE WAIT — ANALYZING MARKET IMPACT
            </div>
            <div className="flex gap-2 mt-4">
              <div className="w-3 h-3 bg-[var(--pixel-blue)] animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-3 h-3 bg-[var(--pixel-blue)] animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-3 h-3 bg-[var(--pixel-blue)] animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pixel HUD Header ───────────────────────────────── */}
      <Header
        fetchedAt={data?.fetchedAt}
        isLoading={isUpdating}
        hasError={hasError}
        onRefresh={handleRefresh}
      />

      {/* ── Back to Office Button ──────────────────────────── */}
      <div className="fixed bottom-5 left-5 z-50">
        <Link
          href="/"
          id="back-to-office-btn"
          className="font-pixel flex items-center gap-2 px-3 py-2 hover:scale-105 active:scale-95 transition-transform"
          style={{
            fontSize: "11px",
            background: "var(--pixel-dark)",
            border: "2px solid var(--pixel-border)",
            color: "var(--pixel-blue)",
            boxShadow: "0 0 8px rgba(79,195,247,0.3)",
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
              className="flex items-center gap-3 px-4 py-2"
              style={{
                border: "1px solid rgba(79,195,247,0.2)",
                background: "rgba(79,195,247,0.04)",
              }}
            >
              <span className="font-pixel" style={{ fontSize: "11px", color: "var(--pixel-blue)" }}>
                📅 ข่าวล่าสุด:
              </span>
              <span className="font-pixel" style={{ fontSize: "11px", color: "#94a3b8" }}>
                {new Date().toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span
                className="font-pixel ml-auto"
                style={{ fontSize: "9px", color: "rgba(100,116,139,0.8)" }}
              >
                * โชว์ข่าวที่วิเคราะห์แล้วของวันนี้และเมื่อวาน
              </span>
            </div>

            {/* ── News Grid ─────────────────────────────── */}
            <NewsGrid articles={data.articles} />
          </div>
        )}
      </main>
    </div>
  );
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
      className="flex flex-col justify-between p-4"
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
