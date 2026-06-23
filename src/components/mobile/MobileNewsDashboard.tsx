"use client";

import { useMemo } from "react";
import { NewsHeader, NewsSubTabs } from "@/components/news/NewsHeader";
import { MarketRiskCard } from "@/components/news/MarketRiskCard";
import { RiskTrendsCard } from "@/components/news/RiskTrendsCard";
import { NewsCard } from "@/components/news/NewsCard";
import type { NewsItem } from "@/lib/types";

interface MobileNewsDashboardProps {
  articles: NewsItem[];
  averageSeverity: number;
  activeCategory: 'general' | 'market';
  setActiveCategory: (cat: 'general' | 'market') => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export default function MobileNewsDashboard({ 
  articles, 
  averageSeverity,
  activeCategory,
  setActiveCategory,
  activeSubTab,
  setActiveSubTab
}: MobileNewsDashboardProps) {

  const filteredArticles = useMemo(() => {
    switch (activeSubTab) {
      case "ไฮไลต์":
        const highlights = articles.filter(a => a.severityScore >= 7);
        return highlights.length > 0 ? highlights : articles;
      case "หัวข้อ":
        return articles;
      case "ข่าวด่วน":
        return articles.filter(a => a.severityScore >= 8 || a.isPending);
      case "ข้อมูลเชิงลึก":
        return articles.filter(a => !!a.market_analysis || (a.summary && a.summary.includes("AI Analysis")));
      case "รายการเฝ้าดู":
        return articles.filter(a => a.assetImpact && a.assetImpact.length > 0);
      default:
        return articles;
    }
  }, [articles, activeSubTab]);

  return (
    <div className="flex flex-col h-full bg-[#050508] text-white overflow-hidden pb-20">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <NewsHeader activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        <NewsSubTabs activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
        
        <MarketRiskCard score={averageSeverity} />
        
        <RiskTrendsCard data={filteredArticles} />
        
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
        
        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center text-[#888888] font-mono text-sm">
            ไม่มีข่าวล่าสุดในขณะนี้
          </div>
        ) : (
          filteredArticles.map((article, i) => (
            <NewsCard key={`${article.id || article.link}-${i}`} article={article} />
          ))
        )}
      </div>
    </div>
  );
}
