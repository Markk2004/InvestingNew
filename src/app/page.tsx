"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  Percent, 
  Cpu, 
  Search, 
  Bell, 
  ArrowUpRight, 
  Activity, 
  Sparkles, 
  Plus, 
  RefreshCw,
  Newspaper,
  ChevronRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

// Mock data for the portfolio performance chart
const chartData = [
  { name: "Jan", Value: 42000, Profit: 1200 },
  { name: "Feb", Value: 45000, Profit: 3000 },
  { name: "Mar", Value: 43500, Profit: 1500 },
  { name: "Apr", Value: 48000, Profit: 4500 },
  { name: "May", Value: 52000, Profit: 4000 },
  { name: "Jun", Value: 56500, Profit: 4500 },
  { name: "Jul", Value: 62450, Profit: 5950 },
];

// Mock data for assets
const initialAssets = [
  { id: 1, name: "NVIDIA Corp.", ticker: "NVDA", type: "Stock", balance: "0.24 BTC value equiv.", amount: "12 Shares", price: "$1,120.45", change: "+6.82%", isPositive: true },
  { id: 2, name: "Apple Inc.", ticker: "AAPL", type: "Stock", amount: "15 Shares", price: "$189.30", change: "-0.45%", isPositive: false },
  { id: 3, name: "Bitcoin", ticker: "BTC", type: "Crypto", amount: "0.45 BTC", price: "$68,240.00", change: "+12.40%", isPositive: true },
  { id: 4, name: "Ethereum", ticker: "ETH", type: "Crypto", amount: "2.5 ETH", price: "$3,820.15", change: "+4.15%", isPositive: true },
  { id: 5, name: "Microsoft Corp.", ticker: "MSFT", type: "Stock", amount: "8 Shares", price: "$415.60", change: "+1.25%", isPositive: true },
];

// Predefined AI recommendations
const aiInsightsList = [
  "พอร์ตของคุณเติบโตได้ดีในกลุ่ม Tech หุ้น NVDA ทำกำไรสูงสุด แนะนำให้ทยอยสะสมหุ้นกลุ่ม Defensive เพิ่มเติมเพื่อลดความเสี่ยงผันผวน",
  "อัตราการถือครองเงินสดของคุณอยู่ที่ 8% ซึ่งค่อนข้างต่ำ ควรสำรองเงินสดเพิ่มเป็น 12-15% เพื่อรอโอกาสช้อนซื้อสินทรัพย์ราคาถูกในช่วงย่อตัว",
  "จากการวิเคราะห์ข้อมูลล่าสุดโดย Gemini AI หุ้น AAPL มีแนวโน้มฟื้นตัวในระยะสั้นเนื่องจากยอดสั่งซื้อสินค้าใหม่ แนะนำถือรอลุ้นผลประกอบการไตรมาสถัดไป",
  "ค่าความผันผวนพอร์ต (Volatility Score) อยู่ในเกณฑ์ปานกลาง-สูง ควรหลีกเลี่ยงการเปิดสถานะเก็งกำไรในตลาด Crypto ในช่วงสัปดาห์นี้"
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"All" | "Stock" | "Crypto">("All");
  const [assets, setAssets] = useState(initialAssets);
  const [aiInsight, setAiInsight] = useState("คลิกที่ปุ่ม 'วิเคราะห์ด้วย AI' เพื่อรับคำแนะนำการลงทุนส่วนตัวจาก Gemini AI");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAiAnalysis = () => {
    setIsAnalyzing(true);
    setAiInsight("กำลังใช้ Gemini 1.5 Flash วิเคราะห์แนวโน้มตลาดและพอร์ตโฟลิโอของคุณ...");
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * aiInsightsList.length);
      setAiInsight(aiInsightsList[randomIndex]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesTab = activeTab === "All" || asset.type === activeTab;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">InvestingNew</h1>
            <p className="text-xs text-indigo-400/90 font-medium">Smart AI Portfolio Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="ค้นหาสินทรัพย์ในพอร์ต..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors w-64 placeholder:text-slate-500 text-slate-200"
            />
          </div>

          <button className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-slate-800 transition-colors relative">
            <Bell className="h-4 w-4 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
          </button>

          <div className="flex items-center gap-3 border-l border-slate-900 pl-4">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-sm text-indigo-400">
              MK
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-300">Markk2004</p>
              <p className="text-[10px] text-slate-500">Premium Account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left 2 columns) */}
        <section className="lg:col-span-2 space-y-8">
          
          {/* Portfolio Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Total Balance Card */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">มูลค่าพอร์ตทั้งหมด</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">$62,450.00</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
                <TrendingUp className="h-3 w-3" /> +14.5% เดือนนี้
              </p>
            </div>

            {/* Daily Profit Card */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">กำไรสะสม (ROI)</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">+$7,850.50</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                ต้นทุนรวม $54,599.50
              </p>
            </div>

            {/* Win Rate/Health Card */}
            <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-800 transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">สุขภาพพอร์ต (AI Health)</span>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Percent className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">85 / 100</h3>
              <p className="text-xs text-purple-400 flex items-center gap-1 mt-1 font-semibold">
                ความเสี่ยง: ระดับปานกลาง
              </p>
            </div>
            
          </div>

          {/* Charts Area */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" /> ผลตอบแทนย้อนหลัง
                </h2>
                <p className="text-xs text-slate-400">แสดงแนวโน้มมูลค่าพอร์ตการลงทุน (USD) รายเดือน</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                <button className="px-3 py-1.5 rounded-lg bg-slate-800 text-white">1 ม.ค. - ปัจจุบัน</button>
                <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors">1 ปี</button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="Value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assets List */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">รายการสินทรัพย์</h2>
                <p className="text-xs text-slate-400">สัดส่วนสินทรัพย์ดิจิทัลและหุ้นในครอบครองของคุณ</p>
              </div>
              <button className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
                <Plus className="h-3.5 w-3.5" /> เพิ่มสินทรัพย์
              </button>
            </div>

            {/* Tabs for Filtering */}
            <div className="flex gap-2 mb-4">
              {(["All", "Stock", "Crypto"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTab === tab 
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
                      : "bg-slate-900/60 text-slate-400 border border-slate-900 hover:text-slate-200"
                  }`}
                >
                  {tab === "All" ? "ทั้งหมด" : tab === "Stock" ? "หุ้น" : "Crypto"}
                </button>
              ))}
            </div>

            {/* Asset Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">ชื่อสินทรัพย์</th>
                    <th className="pb-3 text-right">จำนวน</th>
                    <th className="pb-3 text-right">ราคาต่อหน่วย</th>
                    <th className="pb-3 text-right pr-2">การเปลี่ยนเเปลง 24ชม.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="group hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 pl-2 flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          asset.type === "Crypto" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {asset.ticker}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{asset.name}</p>
                          <p className="text-xs text-slate-500 uppercase">{asset.type}</p>
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-medium text-slate-300">{asset.amount}</td>
                      <td className="py-3.5 text-right font-semibold text-slate-200">{asset.price}</td>
                      <td className={`py-3.5 text-right font-bold pr-2 ${
                        asset.isPositive ? "text-emerald-400" : "text-rose-500"
                      }`}>
                        {asset.change}
                      </td>
                    </tr>
                  ))}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                        ไม่พบข้อมูลสินทรัพย์ตามเงื่อนไขที่คุณเลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* Sidebar / AI Assistant (Right 1 column) */}
        <section className="space-y-8">
          
          {/* Gemini AI Recommendation Box */}
          <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-28 w-28 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  Gemini Portfolio Analyst <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-indigo-400 font-semibold uppercase">Powered by Google AI</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 min-h-[120px] flex items-center justify-center text-slate-300 text-xs leading-relaxed">
              <p>{aiInsight}</p>
            </div>

            <button 
              onClick={handleAiAnalysis}
              disabled={isAnalyzing}
              className="w-full mt-4 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-indigo-500/20 active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? "กำลังประมวลผล..." : "วิเคราะห์ด้วย AI"}
            </button>
          </div>

          {/* Market News Feed (Mock RSS) */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-indigo-400" /> ข่าวสารและบทวิเคราะห์ข่าว
              </h3>
              <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400">RSS Feeds</span>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 hover:border-slate-800 transition-colors group cursor-pointer">
                <p className="text-xs text-indigo-400 font-bold mb-1">NASDAQ.COM • 20 นาทีที่แล้ว</p>
                <h4 className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-white transition-colors">
                  ดัชนี Nasdaq ทะยานทำสถิติสูงสุดใหม่ นำโดยหุ้นกลุ่มเซมิคอนดักเตอร์และชิปประมวลผล AI
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                  <span>อ่านต่อ</span> <ChevronRight className="h-3 w-3" />
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 hover:border-slate-800 transition-colors group cursor-pointer">
                <p className="text-xs text-indigo-400 font-bold mb-1">COINBASE INSIGHTS • 1 ชั่วโมงที่แล้ว</p>
                <h4 className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-white transition-colors">
                  Bitcoin ทรงตัวเหนือระดับ $68,000 ด้านนักวิเคราะห์ชี้มีแรงซื้อหนุนเพิ่มก่อนตลาดเปิดสัปดาห์หน้า
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                  <span>อ่านต่อ</span> <ChevronRight className="h-3 w-3" />
                </div>
              </div>

              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 hover:border-slate-800 transition-colors group cursor-pointer">
                <p className="text-xs text-indigo-400 font-bold mb-1">BLOOMBERG • 3 ชั่วโมงที่แล้ว</p>
                <h4 className="text-xs font-semibold text-slate-200 leading-snug group-hover:text-white transition-colors">
                  FED ส่งสัญญาณคงอัตราดอกเบี้ยนโยบาย ส่งผลให้นักลงทุนต่างชาติเริ่มไหลเงินทุนกลับเข้าหุ้นปลอดภัย
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                  <span>อ่านต่อ</span> <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guide to start coding */}
          <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-6 text-center">
            <h4 className="text-xs font-bold text-slate-300 mb-1">เริ่มปรับแต่งโปรเจกต์นี้ด้วยตัวคุณเอง</h4>
            <p className="text-[11px] text-slate-500 mb-3">คุณสามารถเปิดและแก้ไขไฟล์เพื่อเพิ่มระบบดึงข้อมูลจริงและการเรียกใช้ AI ได้ทันที</p>
            <div className="flex flex-col gap-2">
              <a 
                href="file:///e:/Antigravity/Invester/src/app/page.tsx"
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-1"
              >
                แก้ไขไฟล์หน้า Dashboard หลัก (page.tsx)
              </a>
              <a 
                href="file:///e:/Antigravity/Invester/.env.local"
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-slate-300 transition-all flex items-center justify-center gap-1"
              >
                เปิดไฟล์ตั้งค่าคีย์ AI (.env.local)
              </a>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
