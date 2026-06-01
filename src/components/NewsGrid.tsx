"use client";

// ─────────────────────────────────────────────────────────────
//  NewsGrid — Pixel Art Game Grid
//  Renders list of NewsCard components in a grid layout.
// ─────────────────────────────────────────────────────────────

import type { NewsItem } from "@/lib/types";
import NewsCard from "./NewsCard";

interface NewsGridProps {
  articles: NewsItem[];
}

export default function NewsGrid({ articles }: NewsGridProps) {
  if (articles.length === 0) {
    return (
      <div
        className="font-pixel flex flex-col items-center justify-center p-12 text-center"
        style={{
          border: "2px solid var(--pixel-border)",
          background: "var(--pixel-panel)",
        }}
      >
        <p style={{ fontSize: "12px", color: "var(--pixel-blue)" }}>
          NO DATA SIGNAL
        </p>
        <p style={{ fontSize: "7px", color: "#64748b", marginTop: "12px" }}>
          รอการอัปเดตข้อมูลจากระบบ...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <NewsCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
}
