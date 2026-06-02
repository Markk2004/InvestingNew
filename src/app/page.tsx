// ─────────────────────────────────────────────────────────────
//  Home Page — /
//  Pixel Trade Night Office — canvas-based animated trading floor
// ─────────────────────────────────────────────────────────────

"use client";

import PixelTradeNightOffice from "@/components/PixelTradeNightOffice";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#03080f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <PixelTradeNightOffice />
    </main>
  );
}
