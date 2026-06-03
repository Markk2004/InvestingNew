// ─────────────────────────────────────────────────────────────
//  GeminiAnalyzer — Backend Class
//  Sends all fetched articles in a single batched prompt to
//  Gemini 2.5 Flash for severity scoring, Thai summarization,
//  keyword extraction, sentiment, and impact analysis.
// ─────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  generateArticleId,
  type RawArticle,
  type NewsItem,
  type Sentiment,
} from "./types";

/** Shape expected back from Gemini for each article */
interface GeminiArticleResult {
  index: number;
  severityScore: number;
  summary: string;
  keywords: string[];
  sentiment: Sentiment;
  shortTermImpact: string;
  longTermImpact: string;
}

/** Full JSON structure we expect Gemini to return */
interface GeminiResponse {
  results: GeminiArticleResult[];
}

export class GeminiAnalyzer {
  private readonly primaryModel;
  private readonly backupModel;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.primaryModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.backupModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  }

  /**
   * Analyze an array of raw articles in one batched Gemini call.
   * Returns NewsItem[] with severityScore, summary, sentiment, keywords, and impact.
   * Falls back to score=0 on any parsing failure.
   */
  async analyzeArticles(articles: RawArticle[]): Promise<NewsItem[]> {
    if (articles.length === 0) return [];

    const prompt = this.buildPrompt(articles);

    try {
      // Attempt using the primary model first
      const result = await this.primaryModel.generateContent(prompt);
      const responseText = result.response.text();
      return this.parseResponse(responseText, articles);
    } catch (primaryError) {
      console.warn(
        "[GeminiAnalyzer] Primary model (gemini-2.5-flash) failed/overloaded. Attempting backup model (gemini-2.5-flash-lite)...",
        primaryError
      );

      try {
        // Attempt using the backup model (gemini-2.5-flash-lite)
        const result = await this.backupModel.generateContent(prompt);
        const responseText = result.response.text();
        return this.parseResponse(responseText, articles);
      } catch (backupError) {
        console.error(
          "[GeminiAnalyzer] Both primary and backup models failed:",
          backupError
        );
        
        // Detect Quota/Token limit
        const errMsg = backupError instanceof Error ? backupError.message.toLowerCase() : String(backupError).toLowerCase();
        if (errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("exhausted") || errMsg.includes("limit")) {
          throw new Error("TOKEN_LIMIT_REACHED");
        }

        // Graceful fallback — return articles with score 0
        return this.buildFallback(articles);
      }
    }
  }

  // ── Private Helpers ─────────────────────────────────────────

  private buildPrompt(articles: RawArticle[]): string {
    const articleList = articles
      .map(
        (a, i) =>
          `Article ${i}:\nTitle: ${a.title}\nSource: ${a.source}\nDate: ${a.publishedAt}`
      )
      .join("\n\n");

    return `You are an expert financial risk analyst specializing in global markets with focus on impact for retail investors holding US stocks (S&P 500, NYSE, NASDAQ) and Gold assets (XAU/USD).
Focus your analysis heavily on how events related to War, Geopolitics, Donald Trump, or the US Federal Reserve (FED) directly impact US equity markets and Gold prices.

Analyze the following news articles and return a structured JSON object.

For each article, provide:
- severityScore: integer 1-10
  * 1-2: Normal background news, zero market impact
  * 3-4: Minor event, minimal impact, only sector-specific
  * 5-6: Moderate concern, some volatility expected, worth monitoring
  * 7-8: High alert — significant market reaction likely, affects US stocks/gold portfolios noticeably
  * 9-10: EXTREME — policy shock, geopolitical crisis, systemic risk, major crash trigger
- sentiment: MUST be exactly one of: "bullish", "bearish", or "neutral"
  * "bullish" = positive signal, market/gold likely to rise
  * "bearish" = negative signal, market/gold likely to fall or panic
  * "neutral" = ambiguous or no clear directional bias
- summary: concise 2-sentence explanation IN THAI LANGUAGE — must explain WHY this affects markets (especially related to War/Trump/FED if applicable) and HOW retail investors holding US stocks or Gold should think about it/prepare
- shortTermImpact: 1-sentence Thai language note on immediate (1-7 day) market reaction expectation for US stocks/Gold
- longTermImpact: 1-sentence Thai language note on longer-term (weeks/months) implications
- keywords: array of 3-5 key entities, organizations, or policy areas (in English)

${articleList}

CRITICAL: Respond ONLY with valid JSON, no markdown, no explanation:
{
  "results": [
    {
      "index": 0,
      "severityScore": 7,
      "sentiment": "bearish",
      "summary": "สรุปภาษาไทย 2 ประโยค...",
      "shortTermImpact": "ผลกระทบระยะสั้น...",
      "longTermImpact": "ผลกระทบระยะยาว...",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}`;
  }

  private parseResponse(rawText: string, articles: RawArticle[]): NewsItem[] {
    try {
      // Strip markdown code fences if Gemini wraps the JSON
      const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const parsed: GeminiResponse = JSON.parse(cleaned);

      return articles.map((article, i) => {
        const geminiData = parsed.results.find((r) => r.index === i);
        return this.buildNewsItem(article, i, geminiData);
      });
    } catch (error) {
      console.error("[GeminiAnalyzer] Failed to parse response:", error);
      return this.buildFallback(articles);
    }
  }

  private buildNewsItem(
    article: RawArticle,
    index: number,
    geminiData?: GeminiArticleResult
  ): NewsItem {
    const rawSentiment = geminiData?.sentiment ?? "neutral";
    const sentiment: Sentiment =
      rawSentiment === "bullish" || rawSentiment === "bearish"
        ? rawSentiment
        : "neutral";

    return {
      id: this.generateId(article.link || String(index)),
      title: article.title,
      link: article.link,
      publishedAt: article.publishedAt,
      source: article.source,
      severityScore: geminiData ? this.clampScore(geminiData.severityScore) : 5,
      summary: geminiData?.summary ?? "ไม่สามารถวิเคราะห์ข่าวนี้ได้ในขณะนี้ (ระบบ AI มีผู้ใช้งานเกินกำหนด)",
      keywords: geminiData?.keywords ?? [],
      sentiment,
      shortTermImpact: geminiData?.shortTermImpact,
      longTermImpact: geminiData?.longTermImpact,
    };
  }

  private buildFallback(articles: RawArticle[]): NewsItem[] {
    return articles.map((article, i) => this.buildNewsItem(article, i));
  }

  /** Ensure score stays in 0–10 range */
  private clampScore(score: number): number {
    return Math.max(0, Math.min(10, Math.round(score)));
  }

  /** Simple hash for deterministic IDs from URLs */
  private generateId(input: string): string {
    return generateArticleId(input);
  }
}
