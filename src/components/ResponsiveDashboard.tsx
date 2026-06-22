"use client";

import React, { useState, useEffect } from "react";
import CyberHudDashboard from "@/components/CyberHudDashboard";
import MobileHudDashboard from "@/components/mobile/MobileHudDashboard";

type Tab = "office" | "character" | string;

interface ResponsiveDashboardProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
  headerProps?: any;
  contentClassName?: string;
}

export default function ResponsiveDashboard(props: ResponsiveDashboardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsMobile = () => {
      // 768px is the typical 'md' breakpoint in Tailwind
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Prevent hydration mismatch by not rendering the layout until mounted
  if (!mounted) {
    return <div className="h-screen w-full bg-[#050508]" />;
  }

  if (isMobile) {
    return <MobileHudDashboard {...props} />;
  }

  return <CyberHudDashboard {...props} />;
}
