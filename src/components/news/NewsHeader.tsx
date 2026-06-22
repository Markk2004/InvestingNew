"use client";

export function NewsHeader() {
  return (
    <div className="px-4 pt-4 pb-3">
      <div className="mx-auto flex w-fit rounded-full bg-[#111111]/80 p-1 border border-[rgba(255,255,255,0.05)]">
        <button className="rounded-full bg-[#2a2a30] px-8 py-2 text-sm font-bold text-white shadow-sm">
          ข่าว
        </button>
        <button className="rounded-full px-8 py-2 text-sm font-medium text-[#888888] hover:text-white transition-colors">
          เรียนรู้
        </button>
      </div>
    </div>
  );
}

const tabs = ["ไฮไลต์", "หัวข้อ", "ข่าวเด่น", "ข้อมูลเชิงลึก", "รายการเฝ้าดู"];
export function NewsSubTabs() {
  return (
    <div className="no-scrollbar flex gap-6 overflow-x-auto px-4 pb-3 pt-1">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={`shrink-0 pb-2 text-[15px] ${
            i === 0
              ? "font-bold text-white border-b-2 border-[#4fc3f7]"
              : "text-[#888888] font-medium"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
