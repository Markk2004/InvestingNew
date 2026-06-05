// ─────────────────────────────────────────────────────────────
//  Shared TypeScript Interfaces
//  All domain types used across API routes and UI components
// ─────────────────────────────────────────────────────────────

/**
 * Raw article pulled from the RSS feed before AI analysis.
 */
export interface RawArticle {
  title: string;
  link: string;
  publishedAt: string; // ISO 8601 string
  source: string;
}

/**
 * Market sentiment direction from Gemini analysis.
 */
export type Sentiment = "bullish" | "bearish" | "neutral";

/**
 * Fully analyzed news item after Gemini processing.
 */
export interface NewsItem {
  id: string;           // Derived from link hash
  title: string;
  link: string;
  publishedAt: string;
  source: string;
  severityScore: number;   // 1–10 (0 if analysis failed)
  summary: string;          // Thai summary from Gemini
  keywords: string[];       // Key entities/topics extracted by Gemini
  sentiment: Sentiment;     // Market direction: bullish | bearish | neutral
  shortTermImpact?: string; // Optional short-term impact note in Thai
  longTermImpact?: string;  // Optional long-term impact note in Thai
  isPending?: boolean;      // True = waiting in queue, NOT yet analyzed by Gemini
}

/**
 * Top-level API response shape returned from /api/news.
 */
export interface NewsApiResponse {
  articles: NewsItem[];        // Fully analyzed articles (severityScore >= 5)
  pendingArticles?: NewsItem[]; // Articles waiting in queue (not yet analyzed)
  averageSeverity: number;     // Mean of all severityScores
  fetchedAt: string;           // ISO timestamp of this fetch
  error?: string;              // Present only when something went wrong
}

/**
 * Generate a deterministic ID based on the article URL hash.
 */
export function generateArticleId(link: string): string {
  const input = link || "";
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Severity level helpers used for UI color coding.
 */
export type SeverityLevel = "low" | "medium" | "high" | "critical";

export function getSeverityLevel(score: number): SeverityLevel {
  if (score <= 3) return "low";
  if (score <= 6) return "medium";
  if (score <= 8) return "high";
  return "critical";
}

export function getSeverityPixelColor(score: number): string {
  const level = getSeverityLevel(score);
  const map: Record<SeverityLevel, string> = {
    low: "var(--pixel-green)",
    medium: "var(--pixel-yellow)",
    high: "var(--pixel-orange)",
    critical: "var(--pixel-red)",
  };
  return map[level];
}

export function getSeverityLabel(score: number): string {
  const level = getSeverityLevel(score);
  const map: Record<SeverityLevel, string> = {
    low: "ปลอดภัย",
    medium: "ระวัง",
    high: "อันตราย",
    critical: "วิกฤต!",
  };
  return map[level];
}

export function getSentimentEmoji(sentiment: Sentiment): string {
  const map: Record<Sentiment, string> = {
    bullish: "📈",
    bearish: "📉",
    neutral: "➡️",
  };
  return map[sentiment];
}

/** @deprecated use getSeverityPixelColor */
export function getSeverityColor(score: number): string {
  return getSeverityPixelColor(score);
}
