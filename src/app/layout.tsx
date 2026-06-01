import type { Metadata } from "next";
import { Press_Start_2P, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "InvestingNew — AI Market Intelligence",
  description: "แดชบอร์ดข่าวการลงทุน AI วิเคราะห์ความเสี่ยงตลาดแบบเรียลไทม์ด้วย Gemini 2.5 Flash",
  keywords: ["investing", "news", "AI", "Gemini", "finance", "market analysis"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${pressStart.variable} ${shareTechMono.variable} h-full`}
    >
      <body className="min-h-full bg-slate-950">{children}</body>
    </html>
  );
}
