"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Newspaper, BarChart3, LineChart, Star, ShieldAlert } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface CyberSidebarProps {
  // Optional active tab override for the Home page (which has sub-tabs)
  activeSubTab?: "office" | "character";
  onSubTabChange?: (tab: "office" | "character") => void;
}

export default function CyberSidebar({ activeSubTab, onSubTabChange }: CyberSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const handleNavigation = (path: string, subTab?: "office" | "character") => {
    if (path === "/") {
      if (pathname === "/") {
        // Already on home, just change sub-tab if provided
        if (subTab && onSubTabChange) onSubTabChange(subTab);
      } else {
        // Navigate home
        router.push("/");
        // Note: GameShell defaults to office. 
        // If we needed to deep link to character, we'd need URL params, 
        // but for now router.push("/") is fine.
      }
    } else {
      router.push(path);
    }
  };

  const navItems = [
    { id: "office", label: "Dashboard", icon: LayoutDashboard, path: "/", subTab: "office" },
    { id: "character", label: "Agents", icon: Users, path: "/", subTab: "character" },
    { id: "news", label: "Intel / News", icon: Newspaper, path: "/news" },
    { id: "charts", label: "Market Charts", icon: BarChart3, path: "/charts" },
    { id: "overview", label: "System Overview", icon: LineChart, path: "/overview" },
    { id: "watchlist", label: "Watchlist", icon: Star, path: "/watchlist" },
  ];

  return (
    <aside
      className="flex flex-col w-[260px] h-screen flex-shrink-0 relative z-50"
      style={{
        background: "rgba(10, 10, 12, 0.8)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: "5px 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Brand Logo ── */}
      <div className="h-[72px] flex items-center px-6 border-b border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--color-accent-primary)] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,60,0.4)]">
            <ShieldAlert size={18} color="#050505" />
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold tracking-widest text-white leading-tight">
              KAIROS TECH
            </span>
            <span className="text-[9px] tracking-[0.2em] text-[var(--color-accent-primary)] uppercase font-medium">
              Tactical Ops
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
        <div className="text-[10px] uppercase tracking-widest text-[#555] mb-2 px-2 font-semibold">
          Main Modules
        </div>
        
        {navItems.map((item) => {
          // Determine if active
          let isActive = false;
          if (item.path === "/") {
            isActive = pathname === "/" && activeSubTab === item.subTab;
          } else {
            isActive = pathname.startsWith(item.path);
          }

          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.subTab as any)}
              className="group flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-300 relative overflow-hidden"
              style={{
                background: isActive ? "rgba(255, 0, 60, 0.08)" : "transparent",
                color: isActive ? "var(--color-text-title)" : "var(--color-text-muted)",
              }}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div 
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--color-accent-primary)]"
                  style={{ boxShadow: "0 0 10px var(--color-accent-primary)" }}
                />
              )}
              
              <Icon 
                size={18} 
                className="transition-colors duration-300"
                style={{ 
                  color: isActive ? "var(--color-accent-primary)" : "inherit",
                  filter: isActive ? "drop-shadow(0 0 8px rgba(255,0,60,0.5))" : "none"
                }} 
              />
              
              <span className="text-[13px] font-medium tracking-wide">
                {item.label}
              </span>

              {/* Hover highlight background */}
              <div 
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity" 
                style={{ zIndex: -1 }}
              />
            </button>
          );
        })}
      </div>

      {/* ── System Status & Footer ── */}
      <div className="p-6 border-t border-[rgba(255,255,255,0.05)] flex flex-col gap-4">
        {/* Status */}
        <div className="flex items-center justify-between bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] rounded p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] animate-[electric-pulse_2s_infinite]" />
            <span className="text-[10px] tracking-wider text-[#888] uppercase">System Status</span>
          </div>
          <span className="text-[10px] tracking-wider text-[var(--color-accent-primary)] font-bold">SECURE</span>
        </div>


      </div>
    </aside>
  );
}
