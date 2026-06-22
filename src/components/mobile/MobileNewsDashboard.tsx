"use client";

import { NewsHeader, NewsSubTabs } from "@/components/news/NewsHeader";
import { MarketRiskCard } from "@/components/news/MarketRiskCard";
import { RiskTrendsCard } from "@/components/news/RiskTrendsCard";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsItem } from "@/lib/types";

interface MobileNewsDashboardProps {
  articles: NewsItem[];
  averageSeverity: number;
}

export default function MobileNewsDashboard({ articles, averageSeverity }: MobileNewsDashboardProps) {
  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden pb-20">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <NewsHeader />
        <NewsSubTabs />
        
        <MarketRiskCard score={averageSeverity} />
        
        <RiskTrendsCard />
        
        <div className="mb-2 px-4 text-[13px] text-[#888888] flex items-center">
          <span className="text-[var(--color-accent-primary)] font-bold">● ข่าวล่าสุด</span>
          <span className="ml-2 font-mono text-[11px]">
            {new Date().toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        
        {articles.length === 0 ? (
          <div className="p-8 text-center text-[#888888] font-mono text-sm">
            ไม่มีข่าวล่าสุดในขณะนี้
          </div>
        ) : (
          articles.map((article, i) => (
            <NewsCard key={`${article.id || article.link}-${i}`} article={article} />
          ))
        )}
      </div>
    </div>
  );
}
