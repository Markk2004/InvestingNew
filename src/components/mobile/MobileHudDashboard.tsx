"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWatchlist } from "@/lib/useWatchlist";
import { Building2, User, Users, Newspaper, BarChart2, LineChart, Star, MessageSquare, Send, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/useAuth";

type Tab = "office" | "character" | string;

interface MobileHudDashboardProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
  headerProps?: any;
  contentClassName?: string;
}

export default function MobileHudDashboard({ activeTab, setActiveTab, children, headerProps, contentClassName }: MobileHudDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useWatchlist();
  const { isOwner } = useAuth();

  // Bottom Nav Items (Exactly 5 for mobile with a center dome)
  const navItems = [
    { id: "watchlist", icon: <Star size={20} />, label: "Watchlist", path: "/watchlist" },
    { id: "charts", icon: <BarChart2 size={20} />, label: "Charts", path: "/charts" },
    { id: "overview", icon: <LineChart size={24} />, label: "Overview", path: "/overview", isCenter: true },
    { id: "news", icon: <Newspaper size={20} />, label: "News", path: "/news" },
    isOwner ? { id: "member", icon: <Users size={20} />, label: "Members", path: "/member" } : { id: "menu", icon: <User size={20} />, label: "Settings", path: "/settings" },
  ];

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "SYSTEM", text: "Nexus OS Mobile Initialized.", time: "08:00 UTC", type: "system" },
    { id: 2, sender: "Gemini", text: "Market scans show high volatility in NVDA.", time: "08:42 UTC", type: "agent" },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = chatInput.trim();
    if (!input) return;

    const newMsg = {
      id: Date.now(),
      sender: "COMMANDER",
      text: input,
      time: new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC",
      type: "user"
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages((prev) => [...prev, {
        id: Date.now() + 1,
        sender: "Techie",
        text: "Mobile transmission received. Awaiting backend sync.",
        time: new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC",
        type: "system"
      }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#050508] text-[#e0e0e0] font-mono overflow-hidden relative">
      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden relative ${contentClassName || "p-4"}`}>
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,60,0.05)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 h-full flex flex-col">
          {children}
        </div>
      </main>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-[80px] right-4 z-30 bg-[#0a0a0c] border border-[var(--color-accent-primary)] rounded-full p-3 shadow-[0_0_15px_rgba(255,0,60,0.3)] text-[var(--color-accent-primary)] flex items-center justify-center animate-bounce"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Chat Bottom Sheet */}
      {isChatOpen && (
        <div className="absolute inset-x-0 bottom-[60px] top-1/4 bg-[#0a0a0c] border-t-2 border-[var(--color-accent-primary)] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-40 flex flex-col rounded-t-xl transition-transform transform translate-y-0">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-black/50 rounded-t-xl">
            <div className="flex items-center gap-2 text-xs text-[#888] font-bold tracking-widest">
              <ShieldAlert size={14} className="text-[var(--color-accent-primary)]" />
              COMMS.LINK
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.type === "user" ? "items-end" : "items-start"}`}>
                <span className="text-[9px] text-[#555] mb-1">{msg.sender} • {msg.time}</span>
                <div className={`text-xs p-2.5 rounded max-w-[85%] ${
                  msg.type === "user" 
                    ? "bg-[rgba(255,191,36,0.15)] border border-[rgba(255,191,36,0.4)] text-white" 
                    : msg.type === "system"
                    ? "bg-gray-900 border border-gray-700 text-gray-400"
                    : "bg-[rgba(255,0,60,0.15)] border border-[rgba(255,0,60,0.4)] text-white"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-800 bg-black">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message..." 
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-accent-primary)]"
              />
              <button type="submit" className="bg-[rgba(255,0,60,0.2)] text-[var(--color-accent-primary)] p-2 rounded border border-[var(--color-accent-primary)]">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="shrink-0 h-[70px] bg-[#050508] border-t border-[rgba(255,0,60,0.2)] flex items-center justify-around z-50 pb-safe relative px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCenter = item.isCenter;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (pathname !== item.path.split("?")[0]) {
                  router.push(item.path);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isCenter ? "-mt-8 z-10" : "flex-1 h-full"
              } ${
                isActive ? "text-[var(--color-accent-primary)]" : "text-[#555] hover:text-[#999]"
              }`}
            >
              {isCenter ? (
                // DOME BUTTON
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#050508] shadow-[0_-5px_15px_rgba(255,0,60,0.2)] ${
                  isActive ? "bg-[var(--color-accent-primary)] text-black" : "bg-[#111] text-[#888] border-[rgba(255,0,60,0.3)]"
                }`}>
                  {item.icon}
                </div>
              ) : (
                // REGULAR BUTTON
                <div className="relative">
                  {isActive && (
                    <div className="absolute inset-0 bg-[var(--color-accent-primary)] blur-md opacity-30 rounded-full" />
                  )}
                  {item.icon}
                </div>
              )}
              
              <span className={`text-[9px] uppercase tracking-wider font-bold ${isCenter ? "mt-1" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      
      {/* iOS safe area bottom padding support */}
      <style jsx>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
