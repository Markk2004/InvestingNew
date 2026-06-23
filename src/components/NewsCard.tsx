"use client";

// ─────────────────────────────────────────────────────────────
//  NewsCard — Pixel Art 8-bit styled news article card
//  Shows: severity score, sentiment, title, summary,
//         short/long-term impact, keywords, source link
// ─────────────────────────────────────────────────────────────

import type { NewsItem } from "@/lib/types";
import { getSeverityLevel, getSentimentEmoji } from "@/lib/types";

interface NewsCardProps {
  article: NewsItem;
  index: number;
}

const SEVERITY_CONFIG = {
  low:      { color: "var(--pixel-green)",  label: "LOW",      bg: "rgba(105,255,71,0.06)" },
  medium:   { color: "var(--pixel-yellow)", label: "MED",      bg: "rgba(255,215,64,0.06)" },
  high:     { color: "var(--pixel-orange)", label: "HIGH",     bg: "rgba(255,171,64,0.08)" },
  critical: { color: "var(--pixel-red)",    label: "CRITICAL", bg: "rgba(255,82,82,0.1)"   },
};

const SENTIMENT_CONFIG = {
  bullish: { color: "var(--pixel-green)",  label: "BULLISH 📈" },
  bearish: { color: "var(--pixel-red)",    label: "BEARISH 📉" },
  neutral: { color: "#64748b",             label: "NEUTRAL ➡️" },
};

const ASSET_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  "Gold":           { emoji: "🪙", color: "var(--pixel-yellow)",   bg: "rgba(255,215,64,0.08)" },
  "Crude Oil":      { emoji: "🛢️", color: "var(--pixel-orange)",   bg: "rgba(255,171,64,0.08)" },
  "USD (DXY)":      { emoji: "💵", color: "var(--pixel-green)",    bg: "rgba(105,255,71,0.08)" },
  "US Stocks":      { emoji: "📈", color: "var(--pixel-blue)",     bg: "rgba(79,195,247,0.08)" },
  "Crypto":         { emoji: "🪙", color: "#a855f7",               bg: "rgba(168,85,247,0.08)" },
  "Bond Yields":    { emoji: "📊", color: "#64748b",               bg: "rgba(100,116,139,0.08)" },
  "Global Markets": { emoji: "🌍", color: "#38bdf8",               bg: "rgba(56,189,248,0.08)" },
};

export default function NewsCard({ article, index }: NewsCardProps) {
  const level = getSeverityLevel(article.severityScore);
  const severity = SEVERITY_CONFIG[level];
  const sentiment = SENTIMENT_CONFIG[article.sentiment ?? "neutral"];
  const sentimentEmoji = getSentimentEmoji(article.sentiment ?? "neutral");

  const relativeTime = (() => {
    if (!article.publishedAt) return "";
    const now = new Date();
    const pubDate = new Date(article.publishedAt);
    const diffMs = now.getTime() - pubDate.getTime();
    const absDiffMs = Math.max(0, diffMs);
    const diffMins = Math.floor(absDiffMs / (1000 * 60));
    const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "เมื่อครู่นี้";
    } else if (diffMins < 60) {
      return `${diffMins} นาทีที่แล้ว`;
    } else if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    } else {
      return `${diffDays} วันที่แล้ว`;
    }
  })();

  const dateFormatted = article.publishedAt
    ? new Intl.DateTimeFormat("th-TH", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Bangkok",
      }).format(new Date(article.publishedAt))
    : "";

  return (
    <article
      id={`news-card-${article.id}`}
      className="news-card animate-pixel-fade-in flex flex-col"
      style={{
        animationDelay: `${Math.min(index * 60, 500)}ms`,
        animationFillMode: "both",
        border: `2px solid ${severity.color}`,
        background: `${severity.bg}`,
        boxShadow: `0 0 12px ${severity.color}30, inset 0 0 0 1px ${severity.color}15`,
      }}
    >
      {/* ── Card Header ─────────────────────────────────── */}
      <div
        className="flex items-start justify-between gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${severity.color}30` }}
      >
        {/* Score Badge */}
        <div
          className="news-score-badge flex-shrink-0 flex flex-col items-center justify-center font-pixel"
          style={{
            minWidth: "50px",
            height: "50px",
            border: `2px solid ${severity.color}`,
            background: `${severity.color}15`,
            boxShadow: `0 0 8px ${severity.color}50`,
          }}
        >
          <span style={{ fontSize: "20px", color: severity.color, lineHeight: 1 }}>
            {article.severityScore}
          </span>
          <span style={{ fontSize: "8px", color: severity.color, marginTop: 2 }}>
            {severity.label}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline line-clamp-2 leading-snug"
            style={{
              fontSize: "15px",
              color: "#ffffff",
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {article.title}
          </a>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel hover:underline flex items-center gap-1"
              style={{
                fontSize: "11px",
                color: "var(--pixel-blue)",
                textDecoration: "none",
              }}
            >
              <span>🔗 {article.source}</span>
            </a>
            {dateFormatted && (
              <span
                className="font-pixel"
                style={{ fontSize: "11px", color: "#f8fafc" }}
              >
                · 📅 {dateFormatted} ({relativeTime})
              </span>
            )}
          </div>
          {article.assetImpact && article.assetImpact.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {article.assetImpact.map((asset) => {
                const conf = ASSET_CONFIG[asset] || { emoji: "💼", color: "#cbd5e1", bg: "rgba(203,213,225,0.08)" };
                return (
                  <span
                    key={asset}
                    className="font-pixel flex items-center gap-1 px-1.5 py-0.5"
                    style={{
                      fontSize: "9px",
                      border: `1px solid ${conf.color}`,
                      color: conf.color,
                      background: conf.bg,
                      lineHeight: 1,
                    }}
                  >
                    {conf.emoji} {asset.toUpperCase()}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Sentiment Badge */}
        <div
          className="news-sentiment-badge flex-shrink-0 font-pixel px-2 py-1"
          style={{
            fontSize: "10px",
            border: `1px solid ${sentiment.color}`,
            color: sentiment.color,
            whiteSpace: "nowrap",
            background: `${sentiment.color}10`,
          }}
        >
          {sentimentEmoji} {article.sentiment?.toUpperCase() ?? "NEUTRAL"}
        </div>
      </div>

      {/* ── Summary & AI Insights ─────────────────────────── */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-3">
        {(article.summary_en || article.summary) && (
          <p
            style={{
              fontSize: "14px",
              color: "#cbd5e1",
              lineHeight: 1.7,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {article.summary_en || article.summary}
          </p>
        )}

        {article.market_analysis && (
          <div 
            className="p-3 border font-mono rounded-lg transition-all hover:scale-[1.01]"
            style={{
              borderColor: "rgba(251, 191, 36, 0.4)",
              background: "linear-gradient(135deg, rgba(251, 191, 36, 0.04) 0%, rgba(245, 158, 11, 0.07) 100%)",
              boxShadow: "0 0 10px rgba(251, 191, 36, 0.15), inset 0 0 0 1px rgba(251, 191, 36, 0.05)",
              borderStyle: "dashed",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-pixel tracking-wider text-[#fbbf24] animate-pulse">
                ✨ AI INSIGHTS
              </span>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#fef08a",
                lineHeight: "1.6",
              }}
            >
              {article.market_analysis}
            </p>
          </div>
        )}
      </div>

      {/* ── Card Footer (Keywords & Source Link) ──────────── */}
      <div
        className="px-4 py-2 flex items-center justify-between flex-wrap gap-3"
        style={{
          borderTop: `1px solid ${severity.color}20`,
          background: "rgba(10, 10, 26, 0.2)"
        }}
      >
        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5">
          {article.keywords && article.keywords.length > 0 ? (
            article.keywords.map((kw) => (
              <span
                key={kw}
                className="keyword-badge font-pixel px-2 py-0.5"
                style={{
                  fontSize: "11px",
                  border: `1px solid var(--pixel-border)`,
                  color: "#cbd5e1",
                  background: "rgba(58,58,110,0.3)",
                }}
              >
                #{kw}
              </span>
            ))
          ) : (
            <span
              className="font-pixel text-slate-300"
              style={{
                fontSize: "11px",
              }}
            >
              #no-keywords
            </span>
          )}
        </div>

        {/* Source Link Button */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="news-source-btn font-pixel flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all"
          style={{
            fontSize: "10px",
            border: `2px solid var(--pixel-blue)`,
            color: "var(--pixel-dark)",
            background: "var(--pixel-blue)",
            boxShadow: `0 0 8px rgba(79, 195, 247, 0.4)`,
            padding: "3px 10px",
            textDecoration: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <span>🔗 ดูที่มาข่าว</span>
        </a>
      </div>
    </article>
  );
}
