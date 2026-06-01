// ─────────────────────────────────────────────────────────────
//  RssFetcher — Backend Concurrent Fetching Class
//  Pulls news from 3 distinct sources concurrently using Promise.all:
//  - Source 1: Google News RSS (Trump OR Politics)
//  - Source 2: Reddit Investing JSON (/r/investing/new.json) with RSS proxy fallback
//  - Source 3: Google News RSS targeted to Bloomberg (Economy site:bloomberg.com)
// ─────────────────────────────────────────────────────────────

import Parser from "rss-parser";
import type { RawArticle } from "./types";

/** Fields we care about from each RSS entry */
interface RssEntry {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  creator?: string;
  source?: { _?: string; url?: string };
}

export class RssFetcher {
  private readonly parser: Parser<object, RssEntry>;

  constructor() {
    this.parser = new Parser<object, RssEntry>({
      customFields: {
        item: [["source", "source"]],
      },
      timeout: 10_000,
    });
  }

  /**
   * Fetch from all 3 sources concurrently using Promise.all()
   * Merges and sorts chronologically.
   */
  async fetchAllSources(): Promise<RawArticle[]> {
    console.log("[RssFetcher] Starting concurrent fetch from 3 sources...");

    const [source1, source2, source3] = await Promise.all([
      this.fetchGoogleNews("Trump OR Politics", 5),
      this.fetchReddit(5),
      this.fetchGoogleNews("Economy site:bloomberg.com", 5)
    ]);

    console.log(
      `[RssFetcher] Fetch completed. (Source1: ${source1.length}, Source2: ${source2.length}, Source3: ${source3.length})`
    );

    // Merge all articles
    const merged = [...source1, ...source2, ...source3];

    // Sort chronologically (newest first)
    return merged.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  // ── Source 1 & 3: Google News RSS Fetcher ───────────────────

  private async fetchGoogleNews(query: string, limitCount = 5): Promise<RawArticle[]> {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const feed = await this.parser.parseURL(url);

      return feed.items.slice(0, limitCount).map((item, index) => ({
        title: this.cleanTitle(item.title ?? `Article ${index + 1}`),
        link: item.link ?? "",
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source: this.extractSource(item),
      }));
    } catch (error) {
      console.error(`[RssFetcher] Failed to fetch Google News query "${query}":`, error);
      return []; // Return empty array so Promise.all doesn't crash on single failure
    }
  }

  // ── Source 2: Reddit JSON Fetcher ──────────────────────────

  private async fetchReddit(limitCount = 5): Promise<RawArticle[]> {
    try {
      const url = `https://www.reddit.com/r/investing/new.json?limit=${limitCount}`;
      
      const response = await fetch(url, {
        headers: {
          // Premium User Agent to avoid 429/403 rate limit blocks from Reddit
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API returned HTTP status ${response.status}`);
      }

      const payload = await response.json();
      const posts = payload?.data?.children || [];

      return posts.map((post: any) => {
        const data = post.data;
        const link = data.permalink 
          ? `https://www.reddit.com${data.permalink}` 
          : (data.url || "https://www.reddit.com/r/investing");

        return {
          title: data.title || "Reddit Discussion",
          link: link,
          publishedAt: data.created_utc 
            ? new Date(data.created_utc * 1000).toISOString() 
            : new Date().toISOString(),
          source: `Reddit /r/${data.subreddit || "investing"}`
        };
      });
    } catch (error) {
      console.warn(
        `[RssFetcher] Reddit JSON API failed (likely blocked with 403). Falling back to Google News RSS proxy for Reddit sentiment. Error: ${(error as Error).message}`
      );
      // Fallback: Fetch Reddit discussions indexed on Google News RSS
      try {
        const fallbackArticles = await this.fetchGoogleNews("reddit investing OR r/investing", limitCount);
        return fallbackArticles.map((a) => ({
          ...a,
          source: `Reddit (via News)`
        }));
      } catch (fallbackError) {
        console.error("[RssFetcher] Reddit fallback also failed:", fallbackError);
        return [];
      }
    }
  }

  // ── Private Utility Helpers ─────────────────────────────────

  /** Google News prepends the source name to the title like "Title - Source". Strip it. */
  private cleanTitle(raw: string): string {
    const parts = raw.split(" - ");
    if (parts.length > 1) parts.pop(); // remove last segment (source)
    return parts.join(" - ").trim();
  }

  /** Extract a human-readable source name from the RSS item */
  private extractSource(item: RssEntry): string {
    if (item.source?._) return item.source._;
    
    // Fallback: parse from the raw title's trailing segment
    const titleParts = (item.title ?? "").split(" - ");
    if (titleParts.length > 1) return titleParts[titleParts.length - 1].trim();
    
    // Last resort: extract hostname from link
    try {
      const url = new URL(item.link ?? "");
      return url.hostname.replace("www.", "");
    } catch {
      return "Unknown Source";
    }
  }
}
