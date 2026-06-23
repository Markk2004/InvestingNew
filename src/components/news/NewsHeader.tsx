"use client";

interface NewsHeaderProps {
  activeCategory?: 'general' | 'market';
  setActiveCategory?: (cat: 'general' | 'market') => void;
}

export function NewsHeader({ activeCategory = 'general', setActiveCategory }: NewsHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-3">
      <div className="mx-auto flex w-fit rounded-full bg-[#111111]/80 p-1 border border-[rgba(255,255,255,0.05)]">
        <button 
          onClick={() => setActiveCategory?.('general')}
          className={`rounded-full px-8 py-2 text-sm font-bold transition-all ${
            activeCategory === 'general'
              ? "bg-[#2a2a30] text-white shadow-sm"
              : "text-[#888888] hover:text-white"
          }`}
        >
          ข่าวทั่วไป
        </button>
        <button 
          onClick={() => setActiveCategory?.('market')}
          className={`rounded-full px-8 py-2 text-sm font-bold transition-all ${
            activeCategory === 'market'
              ? "bg-[#2a2a30] text-white shadow-sm"
              : "text-[#888888] hover:text-white"
          }`}
        >
          ข่าวหุ้น
        </button>
      </div>
    </div>
  );
}

interface NewsSubTabsProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const tabs = ["ไฮไลต์", "หัวข้อ", "ข่าวด่วน", "ข้อมูลเชิงลึก", "รายการเฝ้าดู"];

export function NewsSubTabs({ activeTab = "ไฮไลต์", setActiveTab }: NewsSubTabsProps) {
  return (
    <div className="no-scrollbar flex gap-6 overflow-x-auto px-4 pb-3 pt-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActiveTab?.(t)}
          className={`shrink-0 pb-2 text-[15px] transition-all ${
            activeTab === t
              ? "font-bold text-white border-b-2 border-[#4fc3f7]"
              : "text-[#888888] font-medium hover:text-white"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
