import { Newspaper } from "lucide-react";
import type { NewsItem } from "@/lib/types";

export function NewsCard({ article }: { article: NewsItem }) {
  return (
    <a 
      href={article.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block mx-4 mb-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0a0a0f]/40 p-4 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
    >
      <h3 className="text-[15px] leading-snug font-semibold text-white">
        {article.title}
      </h3>
      
      {/* Assuming we show translated badge if translation or analysis exists */}
      {article.summary && (
        <div className="mt-2">
          <span className="rounded-md border border-[#4fc3f7]/50 px-2 py-0.5 text-[10px] text-[#4fc3f7] bg-[#4fc3f7]/10">
            แปลอัตโนมัติ / AI วิเคราะห์
          </span>
        </div>
      )}
      
      <div className="mt-3 flex items-center gap-2 text-[12px] text-[#888888]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4fc3f7]/20">
          <Newspaper className="h-3 w-3 text-[#4fc3f7]" />
        </span>
        <span className="font-medium text-white/80">{article.source}</span>
        <span>·</span>
        <span>{new Date(article.publishedAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit'})}</span>
      </div>
      
      {/* Asset Impacts (Alternative to Tickers) */}
      {article.assetImpact && article.assetImpact.length > 0 && (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {article.assetImpact.map((asset) => (
            <span
              key={asset}
              className={`flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-bold tabular-nums border ${article.sentiment === "bullish" ? "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10" : article.sentiment === "bearish" ? "text-[var(--color-accent-primary)] border-[var(--color-accent-primary)]/30 bg-[var(--color-accent-primary)]/10" : "text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10"}`}
            >
              {asset}
            </span>
          ))}
        </div>
      )}
      
      {/* Analysis summary if available */}
      {article.summary && (
        <div className="mt-3 text-[13px] text-[#aaaaaa] line-clamp-2 leading-relaxed">
          {article.summary}
        </div>
      )}
    </a>
  );
}
