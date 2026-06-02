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

  try {
    // ── Step 1: Check Cloud Firestore Cache first ────────────
    if (!forceRefresh) {
      // Retrieve up to 100 items from Firestore to have a good pool of analyzed articles
      const cachedArticles = await db.getNewsItems(100);

      if (cachedArticles.length > 0) {
        // Filter to only keep articles with severityScore >= 5
        const filteredArticles = cachedArticles.filter((a) => a.severityScore >= 5);
        console.log(
          `[GET /api/news] SWR Cache Hit: Serving ${filteredArticles.length} filtered articles (from ${cachedArticles.length} total) instantly.`
        );

        const averageSeverity = computeAverage(filteredArticles.map((a) => a.severityScore));
        return Response.json({
          articles: filteredArticles.slice(0, 15), // Limit to 15 articles for UI layout
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

    // Process and analyze articles (saves newly analyzed ones to Firestore, filters to >= 5)
    const articles = await processAndAnalyzeArticles(rawArticles, db, apiKey);
    const averageSeverity = computeAverage(articles.map((a) => a.severityScore));

    const response: NewsApiResponse = {
      articles: articles.slice(0, 15), // Limit to 15 articles for UI layout
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
 * Reuses existing NewsItems (guaranteeing stable scores), and sends 
 * only NEW ones to the Gemini API. Saves only new ones and purges old entries.
 */
async function processAndAnalyzeArticles(
  rawArticles: RawArticle[],
  db: FirebaseDb,
  apiKey: string
): Promise<NewsItem[]> {
  // Load existing news items from Firestore to check for duplicates
  const existingItems = await db.getNewsItems(100);
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
    
    // Save ALL newly analyzed news items to Firestore (so we don't re-analyze them next time!)
    await db.saveNewsItems(newlyAnalyzedItems);
  } else {
    console.log("[News Orchestrator] All fetched articles are already in cache. Bypassing Gemini API.");
    // Run cleanup of old news manually since saveNewsItems is bypassed
    await db.cleanupOldNews(3);
  }

  // Merge together and sort chronologically (newest first)
  const merged = [...reusedNewsItems, ...newlyAnalyzedItems];

  // Filter to keep only articles with severityScore >= 5
  const filtered = merged.filter((item) => item.severityScore >= 5);

  return filtered.sort(
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
