"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useWatchlist } from "@/lib/useWatchlist";
import { useTheme } from "@/components/ThemeProvider";
import { Building2, User, Newspaper, BarChart2, LineChart, Star, ShieldAlert, MessageSquare, ChevronRight, ChevronLeft, Send, Bell, Menu } from "lucide-react";
import Header from "@/components/Header";

type Tab = "office" | "character";

interface CyberHudDashboardProps {
  activeTab: Tab | string;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
  headerProps?: any;
}

function SysTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")} UTC`
      );
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span className="text-[var(--color-accent-primary)]">{time}</span>;
}

export default function CyberHudDashboard({ activeTab, setActiveTab, children, headerProps }: CyberHudDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useWatchlist();
  const { toggleTheme } = useTheme();

  // Navigation state
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Chatbox state
  const [isChatOpen, setIsChatOpen] = useState(true);

  const [isLoaded, setIsLoaded] = useState(false);

  // Persist HUD sidebar states
  useEffect(() => {
    const savedNav = localStorage.getItem("cyberhud_nav_open");
    if (savedNav !== null) setIsNavOpen(savedNav === "true");

    const savedChat = localStorage.getItem("cyberhud_chat_open");
    if (savedChat !== null) setIsChatOpen(savedChat === "true");

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("cyberhud_nav_open", String(isNavOpen));
  }, [isNavOpen, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("cyberhud_chat_open", String(isChatOpen));
  }, [isChatOpen, isLoaded]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "SYSTEM", text: "Nexus OS Initialized.", time: "08:00 UTC", type: "system" },
    { id: 2, sender: "Gemini", text: "Market scans show high volatility in NVDA.", time: "08:42 UTC", type: "agent" },
    { id: 3, sender: "NewInvester", text: "Ready to deploy capital on your command.", time: "08:45 UTC", type: "agent" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const unreadCount = isChatOpen ? 0 : 2; // Mock unread count when closed

  const renderNavButton = ({ id, label, icon, path, active }: { id: string, label: string, icon: React.ReactNode, path?: string, active?: boolean }) => {
    const isActive = activeTab === id || active;
    return (
      <button
        key={id}
        onMouseEnter={() => path && router.prefetch(path.split("?")[0])}
        onClick={(e) => {
          if (path && pathname !== path.split("?")[0]) {
            router.push(path);
          } else {
            setActiveTab(id as Tab);
          }
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 mb-2 fui-cut-corner transition-all duration-300 ${
          isActive 
            ? "bg-[rgba(255,0,60,0.15)] border-l-4 border-[var(--color-accent-primary)] text-white fui-text-glow" 
            : "bg-[rgba(10,10,12,0.6)] border-l-4 border-transparent text-[#888] hover:bg-[rgba(255,0,60,0.05)] hover:border-[rgba(255,0,60,0.5)] hover:text-[#ccc]"
        }`}
        style={{ fontFamily: "var(--font-fui)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px" }}
      >
        <span className={isActive ? "text-[var(--color-accent-primary)]" : "text-[#555]"}>{icon}</span>
        {label}
      </button>
    );
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, {
      id: Date.now(),
      sender: "COMMANDER",
      text: chatInput,
      time: new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC",
      type: "user"
    }]);
    setChatInput("");
  };

  return (
    <div className="relative flex h-screen w-full bg-transparent text-[#e0e0e0] overflow-hidden" style={{ fontFamily: "var(--font-mono)" }}>
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,60,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
      
      {/* COLLAPSED LEFT SIDEBAR (SCI-FI FUI) */}
      {!isNavOpen && (
        <aside className="relative h-full w-[80px] bg-[#050508] flex flex-col items-center pt-5 z-20 shrink-0" 
          style={{ borderLeft: "1px solid var(--color-accent-primary)", boxShadow: "inset 15px 0 25px -10px rgba(255,0,60,0.6)" }}
        >
          {/* SVG Background Routing */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" viewBox="0 0 80 800" preserveAspectRatio="none">
              <line x1="65" y1="40" x2="65" y2="150" stroke="#333344" strokeWidth="1" />
              <line x1="65" y1="150" x2="25" y2="190" stroke="#333344" strokeWidth="1" />
              <circle cx="25" cy="190" r="3" fill="#4f4f66" />
              <line x1="50" y1="230" x2="25" y2="255" stroke="#333344" strokeWidth="1" />
              <circle cx="50" cy="230" r="1.5" fill="#4f4f66" />
              <circle cx="25" cy="255" r="1.5" fill="#4f4f66" />
              <line x1="25" y1="255" x2="25" y2="800" stroke="#333344" strokeWidth="1" />
          </svg>

          {/* Toggle Expand Button (Alienware-style neon) */}
          <button 
            onClick={() => setIsNavOpen(true)}
            className="relative w-full h-[60px] flex justify-center items-center z-10 text-[var(--color-accent-primary)] mb-8 hover:scale-110 transition-transform"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,0,60,0.6))" }}
          >
            <Menu size={24} />
          </button>

          {/* Nav Icons */}
          {[
            { id: "office", icon: <Building2 size={20} />, path: "/" },
            { id: "character", icon: <User size={20} />, path: "/?tab=character" },
            { id: "overview", icon: <LineChart size={20} />, path: "/overview" },
            { id: "news", icon: <Newspaper size={20} />, path: "/news" },
            { id: "charts", icon: <BarChart2 size={20} />, path: "/charts" },
            { id: "watchlist", icon: <Star size={20} />, path: "/watchlist" },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onMouseEnter={() => router.prefetch(item.path.split("?")[0])}
                onClick={() => router.push(item.path)}
                className={`relative w-full h-[60px] flex justify-center items-center z-10 mb-[10px] transition-colors ${isActive ? 'text-[var(--color-accent-primary)]' : 'text-[#94a3b8] hover:text-[#cbd5e1]'}`}
                style={isActive ? { filter: "drop-shadow(0 0 5px rgba(255,0,60,0.6))" } : {}}
              >
                {isActive && (
                  <>
                    {/* Diamond active frame */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38px] h-[38px] border border-[var(--color-accent-primary)] bg-[rgba(255,0,60,0.15)] shadow-[0_0_15px_rgba(255,0,60,0.6),inset_0_0_10px_rgba(255,0,60,0.3)] rotate-45 z-0 pointer-events-none" />
                    {/* Neon dots */}
                    <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[3px] h-[3px] bg-[var(--color-accent-primary)] rounded-full shadow-[0_0_6px_var(--color-accent-primary),0_0_12px_var(--color-accent-primary)] z-20" />
                  </>
                )}
                <div className="relative z-10">
                  {item.icon}
                </div>
              </button>
            );
          })}
        </aside>
      )}

      {/* EXPANDED LEFT SIDEBAR: Nav & Status */}
      {isNavOpen && (
        <aside className="h-full flex flex-col border-r border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,12,0.8)] backdrop-blur-md z-20 relative w-[280px] shrink-0">
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert size={28} className="text-[var(--color-accent-primary)]" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-widest fui-text-glow" style={{ fontFamily: "var(--font-fui)" }}>INVESTER.OS</h1>
              <div className="text-[10px] text-[var(--color-accent-primary)] tracking-[3px]">TACTICAL AI NEXUS</div>
            </div>
          </div>
          <button 
            onClick={() => setIsNavOpen(false)}
            className="text-[#888] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="text-[10px] text-[#555] mb-3 tracking-widest uppercase">Main Modules</div>
          {renderNavButton({ id: "office", label: "Command Center", icon: <Building2 size={16} />, path: "/" })}
          {renderNavButton({ id: "character", label: "Operators", icon: <User size={16} />, path: "/?tab=character" })}
          {renderNavButton({ id: "overview", label: "Global Overview", icon: <LineChart size={16} />, path: "/overview" })}
          
          <div className="text-[10px] text-[#555] mt-6 mb-3 tracking-widest uppercase">Intelligence</div>
          {renderNavButton({ id: "news", label: "Threat Intel", icon: <Newspaper size={16} />, path: "/news" })}
          {renderNavButton({ id: "charts", label: "Market Radars", icon: <BarChart2 size={16} />, path: "/charts" })}
          
          <div className="text-[10px] text-[#555] mt-6 mb-3 tracking-widest uppercase">Target Lock</div>
          <button
            onMouseEnter={() => router.prefetch("/watchlist")}
            onClick={() => router.push("/watchlist")}
            className="w-full flex items-center justify-between px-4 py-3 mb-2 fui-cut-corner transition-all duration-300 bg-[rgba(10,10,12,0.6)] border-l-4 border-transparent text-[#888] hover:bg-[rgba(255,191,36,0.05)] hover:border-[rgba(255,191,36,0.5)] hover:text-[#ccc]"
            style={{ fontFamily: "var(--font-fui)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "2px", display: "flex", textDecoration: "none" }}
          >
            <div className="flex items-center gap-3">
              <Star size={16} className="text-[#fbbf24]" />
              Watchlist
            </div>
            {items.length > 0 && (
              <span className="bg-[#fbbf24] text-black px-2 py-0.5 rounded text-[10px] font-bold">
                {items.length}
              </span>
            )}
          </button>
        </nav>

        {/* System Status Panel */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
          <div className="flex justify-between items-center text-[10px] mb-2">
            <span className="text-[#888]">SYS.TIME</span>
            <SysTime />
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[#888]">DEFCON</span>
            <span className="text-white bg-[rgba(255,0,60,0.2)] px-2 py-0.5 rounded text-[10px] border border-[rgba(255,0,60,0.4)]">
              LEVEL 3
            </span>
          </div>
        </div>
      </aside>
      )}

      {/* CENTER CONTENT */}
      <main className="flex-1 h-full flex flex-col relative">
        <Header {...(headerProps || { isLoading: false, hasError: false, onRefresh: () => {} })} />
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Corner Decals */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[rgba(255,0,60,0.5)] pointer-events-none" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[rgba(255,0,60,0.5)] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[rgba(255,0,60,0.5)] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[rgba(255,0,60,0.5)] pointer-events-none" />
          
          {children}
        </div>
      </main>

      {/* FLOATING COLLAPSED CHAT BUTTON */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="absolute right-0 top-[80px] z-50 bg-[rgba(10,10,12,0.9)] border border-r-0 border-[var(--color-accent-primary)] rounded-l-md p-3 shadow-[-5px_0_15px_rgba(255,0,60,0.2)] hover:bg-[rgba(255,0,60,0.1)] transition-colors group"
        >
          <div className="relative">
            <MessageSquare size={20} className="text-[var(--color-accent-primary)] group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#fbbf24] text-black text-[9px] font-bold px-1.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* RIGHT SIDEBAR: Chatbox */}
      <aside 
        className={`h-full border-l border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,12,0.9)] backdrop-blur-md flex flex-col z-20 transition-all duration-300 ${isChatOpen ? 'relative w-[320px] translate-x-0' : 'fixed right-0 w-[320px] translate-x-full'}`}
        style={!isChatOpen ? { visibility: 'hidden' } : {}}
      >
        <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between">
          <h3 className="text-[12px] text-[#888] tracking-widest uppercase flex items-center gap-2">
            <Bell size={14} className="text-[var(--color-accent-primary)]" />
            COMMS.LINK
          </h3>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="text-[#888] hover:text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.type !== "user" && <span className={`text-[9px] px-1 py-0.5 border ${msg.type === "system" ? "border-gray-500 text-gray-500" : "border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"}`}>{msg.sender}</span>}
                <span className="text-[9px] text-[#555]">{msg.time}</span>
                {msg.type === "user" && <span className="text-[9px] px-1 py-0.5 border border-[#fbbf24] text-[#fbbf24]">{msg.sender}</span>}
              </div>
              <div 
                className={`p-2.5 rounded-sm max-w-[90%] text-[12px] ${
                  msg.type === "user" 
                    ? "bg-[rgba(255,191,36,0.1)] border border-[rgba(255,191,36,0.3)] text-[#e0e0e0]" 
                    : msg.type === "system"
                    ? "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#aaa]"
                    : "bg-[rgba(255,0,60,0.1)] border border-[rgba(255,0,60,0.3)] text-white"
                }`}
                style={{ fontFamily: "var(--font-fui)" }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Transmit orders..." 
              className="flex-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-sm px-3 py-2 text-[12px] text-white focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors"
            />
            <button 
              type="submit"
              className="bg-[rgba(255,0,60,0.2)] border border-[rgba(255,0,60,0.5)] p-2 rounded-sm text-[var(--color-accent-primary)] hover:bg-[rgba(255,0,60,0.4)] transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
