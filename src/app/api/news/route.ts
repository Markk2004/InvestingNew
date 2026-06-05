// ─────────────────────────────────────────────────────────────
//  API Route — GET /api/news
//  Orchestrates RssFetcher → GeminiAnalyzer and returns a
//  structured NewsApiResponse JSON.
//
//  Next.js 16 App Router: uses Response.json() pattern.
//  dynamic = 'force-dynamic' ensures no static caching.
// ─────────────────────────────────────────────────────────────

import type { NextRequest } from "next/server";
import { RssFetcher } from "@/lib/rss";
import { GeminiAnalyzer } from "@/lib/gemini";
import { FirebaseDb } from "@/lib/firebase";
import { generateArticleId, type NewsApiResponse, type NewsItem, type RawArticle } from "@/lib/types";

// Opt out of Next.js static caching — always fetch fresh data
export const dynamic = "force-dynamic";



export async function GET(_req: NextRequest): Promise<Response> {
  const fetchedAt = new Date().toISOString();
  const apiKey = process.env.GEMINI_API_KEY ?? "";
  const db = new FirebaseDb();
  const forceRefresh = _req.nextUrl.searchParams.get("force") === "true";

  // ── Always cleanup old news first (keep today and yesterday) ─────────
  // Fire-and-forget: explicitly void the promise to signal intentional non-await.
  // On serverless (Vercel), this runs best-effort before the response is sent.
  void db.cleanupOldNews(1).catch((e) =>
    console.warn("[GET /api/news] Background cleanup failed:", e)
  );

  try {
    // ── Step 1: Check Cloud Firestore for Recent articles ────────────
    if (!forceRefresh) {
      // Retrieve recent analyzed articles from Firestore (today & yesterday)
      const cachedArticles = await db.getRecentNewsItems(50, 1);

      if (cachedArticles.length > 0) {
        // Separate pending articles from fully analyzed ones
        const pendingArticles = cachedArticles.filter((a) => a.isPending === true);
        const analyzedArticles = cachedArticles.filter(
          (a) => !a.isPending && a.severityScore >= 5
        );
        console.log(
          `[GET /api/news] Cache Hit: ${analyzedArticles.length} analyzed, ${pendingArticles.length} pending (from ${cachedArticles.length} total recent).`
        );

        const averageSeverity = computeAverage(analyzedArticles.map((a) => a.severityScore));
        return Response.json({
          articles: analyzedArticles.slice(0, 15), // Limit to 15 analyzed articles for UI layout
          pendingArticles: pendingArticles.slice(0, 10), // Separate pending queue (max 10)
          averageSeverity,
          fetchedAt,
          cached: true,
        });
      }
    }

    // ── Step 2: Cache Miss or Force Refresh ───────────
    if (process.env.NODE_ENV !== "development") {
      console.log(
        "[GET /api/news] SWR Cache Miss/Force Refresh in Production: Serving empty articles since RSS fetch is dev-only."
      );
      return Response.json(
        buildEmptyResponse(
          fetchedAt,
          "RSS fetch is disabled in production to conserve API quota. Please seed the database in development mode first."
        )
      );
    }

    console.log(
      `[GET /api/news] Cache Miss / Force Refresh: Executing synchronous fetch, deduplication, and AI analysis (force=${forceRefresh})...`
    );

    const fetcher = new RssFetcher();
    const rawArticles = await fetcher.fetchAllSources();

    if (rawArticles.length === 0) {
      return Response.json(buildEmptyResponse(fetchedAt, "RSS feed returned no articles"));
    }

    // Process and analyze articles — returns analyzed and pending separately
    const { analyzed, pending } = await processAndAnalyzeArticles(rawArticles, db, apiKey);
    const averageSeverity = computeAverage(analyzed.map((a) => a.severityScore));

    const response: NewsApiResponse = {
      articles: analyzed.slice(0, 15), // Limit to 15 fully analyzed articles
      pendingArticles: pending.slice(0, 10), // Pending articles shown separately
      averageSeverity,
      fetchedAt,
    };

    return Response.json(response);
  } catch (error) {
    console.error("[GET /api/news] Unhandled error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return Response.json(
      buildEmptyResponse(fetchedAt, errorMessage),
      { status: 200 } // Return 200 so SWR doesn't treat it as a hard failure
    );
  }
}

/**
 * Deduplicates raw articles against existing database entries.
 * Returns analyzed and pending articles in separate lists so the UI can
 * display them independently — fixing the "pending pollutes top-15" bug.
 * Also saves pending article IDs to Firestore so they won't be re-queued
 * on the next refresh — fixing the "duplicate analysis loop" bug.
 */
async function processAndAnalyzeArticles(
  rawArticles: RawArticle[],
  db: FirebaseDb,
  apiKey: string
): Promise<{ analyzed: NewsItem[]; pending: NewsItem[] }> {
  // Load recent existing news items from Firestore (includes previously saved pending stubs)
  const existingItems = await db.getRecentNewsItems(100, 1);
  const existingMap = new Map(existingItems.map((item) => [item.id, item]));

  const newRawArticles: RawArticle[] = [];
  const reusedAnalyzedItems: NewsItem[] = [];
  const reusedPendingItems: NewsItem[] = [];

  rawArticles.forEach((raw) => {
    const id = generateArticleId(raw.link);
    const existing = existingMap.get(id);
    if (existing) {
      // Article already in DB — check if it's still pending or fully analyzed
      if (existing.isPending) {
        reusedPendingItems.push(existing);
      } else {
        reusedAnalyzedItems.push(existing);
      }
    } else {
      newRawArticles.push(raw);
    }
  });

  console.log(
    `[News Orchestrator] Deduplication: ${reusedAnalyzedItems.length} analyzed, ${reusedPendingItems.length} pending (reused), ${newRawArticles.length} brand-new articles.`
  );

  let newlyAnalyzedItems: NewsItem[] = [];
  let newPendingItems: NewsItem[] = [];

  if (newRawArticles.length > 0) {
    // Analyze up to 8 new articles per refresh — balanced between speed and coverage
    const limit = 8;
    const articlesToAnalyze = newRawArticles.slice(0, limit);
    const articlesToQueue = newRawArticles.slice(limit);

    console.log(
      `[News Orchestrator] Analyzing ${articlesToAnalyze.length} articles, queuing ${articlesToQueue.length} as pending.`
    );

    const analyzer = new GeminiAnalyzer(apiKey);
    newlyAnalyzedItems = await analyzer.analyzeArticles(articlesToAnalyze);

    // Save newly analyzed items to Firestore
    await db.saveNewsItems(newlyAnalyzedItems);

    // ── FIX: Save pending article STUBS to Firestore ──────────────────────
    // This prevents duplicate analysis on the next refresh. These stubs will
    // be detected via existingMap and returned as pending instead of being
    // treated as brand-new and re-queued again.
    newPendingItems = articlesToQueue.map((raw) => ({
      id: generateArticleId(raw.link),
      title: raw.title,
      link: raw.link,
      publishedAt: raw.publishedAt,
      source: raw.source,
      severityScore: 0,
      summary: "กำลังรอการวิเคราะห์จากระบบ... (Pending Analysis)",
      keywords: [],
      sentiment: "neutral" as const,
      isPending: true,
    }));

    if (newPendingItems.length > 0) {
      // Save pending stubs to DB so they're tracked and not re-queued next time
      await db.saveNewsItems(newPendingItems);
      console.log(`[News Orchestrator] Saved ${newPendingItems.length} pending stubs to Firestore.`);
    }
  } else {
    console.log("[News Orchestrator] All fetched articles are already tracked. Bypassing Gemini API.");
  }

  // ── Merge and return separately ─────────────────────────────────────────
  const allAnalyzed = [...reusedAnalyzedItems, ...newlyAnalyzedItems]
    .filter((item) => item.severityScore >= 5)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const allPending = [...reusedPendingItems, ...newPendingItems]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return { analyzed: allAnalyzed, pending: allPending };
}

// ── Helper Functions ───────────────────────────────────────────

function computeAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s, 0);
  return Math.round((sum / scores.length) * 10) / 10; // 1 decimal place
}

function buildEmptyResponse(fetchedAt: string, error: string): NewsApiResponse {
  return {
    articles: [],
    averageSeverity: 0,
    fetchedAt,
    error,
  };
}
