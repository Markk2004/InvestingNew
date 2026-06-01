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

  try {
    // ── Step 1: Check Cloud Firestore Cache first ────────────
    const cachedArticles = await db.getNewsItems(15);

    if (cachedArticles.length > 0) {
      console.log(`[GET /api/news] SWR Cache Hit: Serving ${cachedArticles.length} articles instantly (under 100ms).`);

      // Trigger fresh RSS pull, deduplicate and analyze new items in background (NON-blocking)
      triggerBackgroundUpdate(db, apiKey).catch((err) => {
        console.error("[GET /api/news] Asynchronous revalidation failed:", err);
      });

      const averageSeverity = computeAverage(cachedArticles.map((a) => a.severityScore));
      return Response.json({
        articles: cachedArticles,
        averageSeverity,
        fetchedAt,
        cached: true
      });
    }

    // ── Step 2: Cache Miss (First run or empty DB) ───────────
    console.log("[GET /api/news] SWR Cache Miss: Executing synchronous fetch, deduplication, and AI analysis...");
    
    const fetcher = new RssFetcher();
    const rawArticles = await fetcher.fetchAllSources();

    if (rawArticles.length === 0) {
      return Response.json(buildEmptyResponse(fetchedAt, "RSS feed returned no articles"));
    }

    // Deduplicate and process
    const articles = await processAndAnalyzeArticles(rawArticles, db, apiKey);
    const averageSeverity = computeAverage(articles.map((a) => a.severityScore));

    const response: NewsApiResponse = {
      articles,
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
 * Perform asynchronous background updates: pulls fresh RSS news, 
 * runs Gemini AI analysis on NEW articles only, and purges old entries.
 * Does not block the HTTP client response.
 */
async function triggerBackgroundUpdate(db: FirebaseDb, apiKey: string): Promise<void> {
  try {
    const fetcher = new RssFetcher();
    const rawArticles = await fetcher.fetchAllSources();
    if (rawArticles.length === 0) return;

    // Run deduplication & processing (only new items will call Gemini API!)
    await processAndAnalyzeArticles(rawArticles, db, apiKey);
    console.log("[GET /api/news] Asynchronous revalidation completed successfully.");
  } catch (error) {
    console.error("[GET /api/news] Error during asynchronous revalidation:", error);
  }
}

/**
 * Deduplicates raw articles against existing database entries.
 * Reuses existing NewsItems (guaranteeing stable scores), and sends 
 * only NEW ones to the Gemini API. Saves only new ones and purges old entries.
 */
async function processAndAnalyzeArticles(
  rawArticles: RawArticle[],
  db: FirebaseDb,
  apiKey: string
): Promise<NewsItem[]> {
  // Load existing news items from Firestore to check for duplicates
  const existingItems = await db.getNewsItems(30);
  const existingMap = new Map(existingItems.map((item) => [item.id, item]));

  const newRawArticles: RawArticle[] = [];
  const reusedNewsItems: NewsItem[] = [];

  rawArticles.forEach((raw) => {
    const id = generateArticleId(raw.link);
    if (existingMap.has(id)) {
      reusedNewsItems.push(existingMap.get(id)!);
    } else {
      newRawArticles.push(raw);
    }
  });

  console.log(
    `[News Orchestrator] Deduplication: ${reusedNewsItems.length} articles already analyzed. ${newRawArticles.length} new articles to analyze.`
  );

  let newlyAnalyzedItems: NewsItem[] = [];

  if (newRawArticles.length > 0) {
    const analyzer = new GeminiAnalyzer(apiKey);
    newlyAnalyzedItems = await analyzer.analyzeArticles(newRawArticles);
    
    // Save ONLY the newly analyzed news items to Firestore (this also purges old items!)
    await db.saveNewsItems(newlyAnalyzedItems);
  } else {
    console.log("[News Orchestrator] All fetched articles are already in cache. Bypassing Gemini API and saving.");
    // Run cleanup of old news manually since saveNewsItems is bypassed
    await db.cleanupOldNews(3);
  }

  // Merge together and sort chronologically (newest first)
  const merged = [...reusedNewsItems, ...newlyAnalyzedItems];
  return merged.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
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
