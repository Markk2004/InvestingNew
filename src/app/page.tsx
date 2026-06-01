// ─────────────────────────────────────────────────────────────
//  Home Page — /
//  Pixel Art Isometric Office Landing Scene
//  Characters react to live market data from /api/news
// ─────────────────────────────────────────────────────────────

"use client";

import useSWR from "swr";
import type { NewsApiResponse } from "@/lib/types";
import OfficeScene from "@/components/OfficeScene";
import type { CharacterState } from "@/components/CharacterSprite";

// ── SWR fetcher ──────────────────────────────────────────────

const fetcher = (url: string): Promise<NewsApiResponse> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

const SWR_CONFIG = {
  refreshInterval: 5 * 60 * 1000,
  revalidateOnFocus: false,
  dedupingInterval: 60_000,
} as const;

// ── Page Component ───────────────────────────────────────────

export default function HomePage() {
  const { data, isLoading, isValidating } = useSWR<NewsApiResponse>(
    "/api/news",
    fetcher,
    SWR_CONFIG
  );

  const isUpdating = isLoading || isValidating;
  const avg = data?.averageSeverity ?? 0;

  // ── Character State Logic ────────────────────────────────
  // Gemini is "working" whenever SWR is fetching data
  const geminiState: CharacterState = isUpdating ? "working" : "idle";

  // Newinvester panics if average severity >= 8 (high risk)
  const newinvesterState: CharacterState = avg >= 8 ? "shocked" : "idle";

  return (
    <main
      className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--pixel-dark)" }}
    >
      <OfficeScene
        geminiState={geminiState}
        newinvesterState={newinvesterState}
        averageSeverity={data?.averageSeverity}
        isLoading={isUpdating}
      />
    </main>
  );
}
