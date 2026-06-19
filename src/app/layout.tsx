import type { Metadata } from "next";
import { Press_Start_2P, Share_Tech_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import GlobalErrorHandler from "../components/GlobalErrorHandler";

// Pixel art game font
const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

// Monospace for data/numbers
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// FUI font
const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-fui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvestingNew — AI Market Intelligence",
  description: "แดชบอร์ดข่าวการลงทุน AI วิเคราะห์ความเสี่ยงตลาดแบบเรียลไทม์ด้วย Gemini 2.5 Flash",
  keywords: ["investing", "news", "AI", "Gemini", "finance", "market analysis"],
};

import { ChartManagerProvider } from "@/components/FloatingChartManager";
import { ThemeProvider } from "@/components/ThemeProvider";
import CrimsonBackground from "@/components/CrimsonBackground";
import GlobalNewsPoller from "@/components/GlobalNewsPoller";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${pressStart.variable} ${shareTechMono.variable} ${rajdhani.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--color-bg-page)]">
        <ThemeProvider>
          <GlobalNewsPoller />
          <CrimsonBackground />
          <GlobalErrorHandler />
          <ChartManagerProvider>{children}</ChartManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
