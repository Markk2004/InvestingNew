// ─────────────────────────────────────────────────────────────
//  RssFetcher — Backend Concurrent Fetching Class
//  Pulls news from 3 distinct sources concurrently using Promise.all:
//  - Source 1: Google News RSS (Trump OR Politics)
//  - Source 2: Reddit Investing JSON (/r/investing/new.json) with RSS proxy fallback
//  - Source 3: Google News RSS targeted to Bloomberg (Economy site:bloomberg.com)
// ─────────────────────────────────────────────────────────────

import Parser from "rss-parser";
import type { RawArticle } from "../db/types";

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
   * Fetch from 2 specific, user-requested queries for Trump, FED, US politics, and economic market impacts.
   * Merges, whitelists by domain, filters out opinion/sports/gossip, deduplicates, and sorts chronologically.
   */
  async fetchAllSources(): Promise<RawArticle[]> {
    console.log("[RssFetcher] Starting concurrent fetch from 2 specialized US news feeds...");

    // 3 high-precision queries targeting the intersection of (Trump/FED/War/Politics) AND (US Stocks/Gold)
    const query1 = "(Trump OR FED OR War OR Politics) AND (Stock OR Market OR Gold OR XAU OR S&P)";
    const query2 = "(Trump OR FED OR Inflation OR Geopolitics) AND (Nasdaq OR NYSE OR Gold OR Economy)";
    const queryForex = "site:forexfactory.com (Trump OR FED OR War OR Politics OR Gold OR Economy OR Inflation)";

    // Fetch from all sources in parallel
    const [source1, source2, sourceForex, sourceTruth] = await Promise.all([
      this.fetchGoogleNews(query1, 25),
      this.fetchGoogleNews(query2, 25),
      this.fetchGoogleNews(queryForex, 25),
      this.fetchDirectRss("https://trumpstruth.org/feed", "Truth Social (@realDonaldTrump)", 10)
    ]);

    console.log(
      `[RssFetcher] Raw Fetch completed. (Source1: ${source1.length}, Source2: ${source2.length}, ForexFactory: ${sourceForex.length}, TruthSocial: ${sourceTruth.length})`
    );

    // Merge all articles
    const merged = [...source1, ...source2, ...sourceForex, ...sourceTruth];

    // Apply strict quality, domain, and deduplication filters
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    const filteredArticles: RawArticle[] = [];

    for (const article of merged) {
      // 1. Strict Domain Whitelist Filter (allows only highly reputable news sites)
      if (!this.isTrustedSource(article.source, article.link)) {
        continue;
      }

      // 2. Title Quality / Keyword Blacklist Filter
      if (!this.passesQualityFilter(article.title)) {
        continue;
      }

      // 3. Deduplication
      const normalizedTitle = article.title.toLowerCase().trim();
      const url = article.link.trim();

      if (!seenUrls.has(url) && !seenTitles.has(normalizedTitle)) {
        seenUrls.add(url);
        seenTitles.add(normalizedTitle);
        filteredArticles.push(article);
      }
    }

    console.log(
      `[RssFetcher] Filtering complete. Went from ${merged.length} raw articles down to ${filteredArticles.length} premium, verified articles.`
    );

    // Sort chronologically (newest first)
    const sorted = filteredArticles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Slice to top 15 most recent premium articles to maintain concise high-quality news
    return sorted.slice(0, 15);
  }

  // ── Google News RSS Fetcher ───────────────────

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

  private async fetchDirectRss(url: string, sourceName: string, limitCount = 5): Promise<RawArticle[]> {
    try {
      const feed = await this.parser.parseURL(url);
      return feed.items.slice(0, limitCount).map((item, index) => ({
        title: item.title ?? `Article ${index + 1}`,
        link: item.link ?? url,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        source: sourceName,
      }));
    } catch (error) {
      console.error(`[RssFetcher] Failed to fetch direct RSS "${url}":`, error);
      return [];
    }
  }

  // ── Private Filtering & Utility Helpers ─────────────────────────────────

  /** Check if the article source or link belongs to a trusted, reputable publisher */
  private isTrustedSource(sourceName: string, link: string): boolean {
    const lowercaseSource = sourceName.toLowerCase();
    
    const TRUSTED_SOURCES = [
      "bloomberg",
      "reuters",
      "cnbc",
      "wall street journal",
      "wsj",
      "financial times",
      "ft",
      "marketwatch",
      "yahoo finance",
      "yahoo",
      "investing.com",
      "barron",
      "techcrunch",
      "economist",
      "new york times",
      "nytimes",
      "forbes",
      "associated press",
      "ap news",
      "washington post",
      "bbc",
      "cnn",
      "guardian",
      "time",
      "truth social",
      "truthsocial",
      "forex factory",
      "forexfactory"
    ];

    const isSourceTrusted = TRUSTED_SOURCES.some(src => lowercaseSource.includes(src));
    if (isSourceTrusted) return true;

    try {
      const url = new URL(link);
      const hostname = url.hostname.toLowerCase();
      
      const TRUSTED_DOMAINS = [
        // Top financial and economic publishers
        "bloomberg.com",
        "reuters.com",
        "cnbc.com",
        "wsj.com",
        "ft.com",
        "marketwatch.com",
        "finance.yahoo.com",
        "yahoo.com",
        "investing.com",
        "barrons.com",
        "techcrunch.com",
        "economist.com",
        "nytimes.com",
        "forbes.com",
        // Top general news publishers (highly reliable for political & policy updates)
        "apnews.com",
        "washingtonpost.com",
        "bbc.com",
        "bbc.co.uk",
        "cnn.com",
        "theguardian.com",
        "time.com",
        "forexfactory.com",
        // Truth Social whitelist
        "truthsocial.com",
        "trumpstruth.org"
      ];

      return TRUSTED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith("." + domain)
      );
    } catch {
      return false;
    }
  }

  /** Check if the title passes quality criteria and contains no banned buzzwords/non-financial noise */
  private passesQualityFilter(title: string): boolean {
    const lowercaseTitle = title.toLowerCase();

    // Filter out short or non-substantive titles
    if (title.trim().length < 15) return false;

    // Strict keyword blacklist to filter out opinion columns, local crime, gossip, sports, etc.
    const BANNED_TITLE_KEYWORDS = [
      "opinion:", "opinion |", "sports", "football", "soccer", "gossip", "lifestyle",
      "horoscope", "recipe", "fashion", "celebrity", "movie", "gaming", "esports",
      "review:", "unboxing", "obituary", "deal of the day", "op-ed", "travel",
      "relationship", "entertainment", "culture", "horoscopes", "recipes"
    ];

    if (BANNED_TITLE_KEYWORDS.some(kw => lowercaseTitle.includes(kw))) {
      return false;
    }

    return true;
  }

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
