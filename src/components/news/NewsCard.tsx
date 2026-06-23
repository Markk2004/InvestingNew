import { Newspaper, AlertTriangle } from "lucide-react";
import { type NewsItem, getSeverityLabel, getSeverityPixelColor } from "@/lib/types";

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return `เพิ่งเกิด`;
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

export function NewsCard({ article }: { article: NewsItem }) {
  const severityColor = getSeverityPixelColor(article.severityScore);
  const severityLabel = getSeverityLabel(article.severityScore);

  return (
    <a 
      href={article.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block mx-4 mb-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0a0a0f]/40 p-4 transition-colors hover:bg-[rgba(255,255,255,0.05)]"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="text-[15px] leading-snug font-semibold text-white flex-1">
          {article.title}
        </h3>
        {/* Severity Badge like PC */}
        {article.severityScore > 0 && (
          <div 
            className="flex-shrink-0 flex flex-col items-center justify-center rounded-md font-mono"
            style={{ 
              minWidth: "44px",
              height: "44px",
              border: `1px solid ${severityColor}60`,
              backgroundColor: `${severityColor}15`, 
              boxShadow: `0 0 8px ${severityColor}30`,
              marginTop: "2px"
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: "bold", color: severityColor, lineHeight: 1 }}>
              {article.severityScore}
            </span>
            <span style={{ fontSize: "8px", fontWeight: "bold", color: severityColor, marginTop: 2, letterSpacing: 0.5 }}>
              {severityLabel.toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {/* Assuming we show translated badge if translation or analysis exists */}
      <div className="mt-1 flex flex-wrap gap-2">
        {article.summary && (
          <span className="rounded-md border border-[#4fc3f7]/50 px-2 py-0.5 text-[10px] text-[#4fc3f7] bg-[#4fc3f7]/10">
            แปลอัตโนมัติ / AI วิเคราะห์
          </span>
        )}
      </div>
      
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#888888] flex-wrap">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#4fc3f7]/20 flex-shrink-0">
          <Newspaper className="h-3 w-3 text-[#4fc3f7]" />
        </span>
        <span className="font-medium text-white/80">{article.source}</span>
        <span>·</span>
        <span>{new Date(article.publishedAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: '2-digit' })} {new Date(article.publishedAt).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit'})}</span>
        <span>·</span>
        <span className="text-[#4fc3f7]">{formatRelativeTime(article.publishedAt)}</span>
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
      
      {/* Pure Facts */}
      {(article.summary_en || article.summary) && (
        <div className="mt-3 text-[13px] text-[#cccccc] leading-relaxed">
          {article.summary_en || article.summary}
        </div>
      )}

      {/* AI Insights Gold/Orange Box */}
      {article.market_analysis && (
        <div 
          className="mt-3 p-3 border rounded-lg font-mono"
          style={{
            borderColor: "rgba(251, 191, 36, 0.3)",
            background: "linear-gradient(135deg, rgba(251, 191, 36, 0.03) 0%, rgba(245, 158, 11, 0.05) 100%)",
            boxShadow: "0 0 8px rgba(251, 191, 36, 0.1)",
            borderStyle: "dashed",
          }}
        >
          <div className="text-[10px] font-pixel text-[#fbbf24] mb-1.5 flex items-center gap-1">
            <span>✨</span> AI INSIGHTS
          </div>
          <p
            style={{
              fontSize: "12px",
              color: "#fef08a",
              lineHeight: "1.5",
            }}
          >
            {article.market_analysis}
          </p>
        </div>
      )}
    </a>
  );
}
