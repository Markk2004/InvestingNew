"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

const SWR_CONFIG = {
  refreshInterval: 60 * 1000, // Check for news updates every 1 minute
  revalidateOnFocus: true,
  dedupingInterval: 30000,
} as const;

export default function GlobalNewsPoller() {
  const { data, mutate } = useSWR("/api/news?page=1", fetcher, SWR_CONFIG);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // 1. Background Scraper: Scans RSS feeds every 5 minutes by querying with force=true
  useEffect(() => {
    const scanNews = async () => {
      try {
        console.log("[Global News Poller] Scanning global news feeds...");
        await mutate(fetcher("/api/news?force=true&page=1"), { revalidate: false });
      } catch (e) {
        console.error("[Global News Poller] Failed news scan:", e);
      }
    };

    // Scan on initial mount after a short delay
    const initialTimer = setTimeout(scanNews, 2000);

    const interval = setInterval(scanNews, 5 * 60 * 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [mutate]);

  // 2. Background AI Analyst: Processes pending articles in sequence every 15 seconds if any exist
  useEffect(() => {
    if (isProcessingQueue) return;
    if (!data?.pendingArticles || data.pendingArticles.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        setIsProcessingQueue(true);
        console.log("[Global News Poller] Processing pending article queue...");
        const res = await fetch("/api/news?process_queue=true");
        if (res.ok) {
          await mutate();
        }
      } catch (e) {
        console.error("[Global News Poller] Failed background queue process:", e);
      } finally {
        setIsProcessingQueue(false);
      }
    }, 15000); // 15 seconds loop

    return () => clearTimeout(timer);
  }, [data?.pendingArticles, mutate, isProcessingQueue]);

  return null;
}
