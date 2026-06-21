"use client";

// ─────────────────────────────────────────────────────────────
//  useWatchlist.ts — React hook for Database-backed Watchlist
//  Requires user to be logged in (uses getToken)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { getToken } from "../auth/auth";

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
}

interface UseWatchlistReturn {
  items: WatchlistItem[];
  add: (symbol: string) => Promise<void>;
  remove: (symbol: string) => Promise<void>;
  has: (symbol: string) => boolean;
  loading: boolean;
}

export function useWatchlist(): UseWatchlistReturn {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch watchlist:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Sync state between tabs (primitive reload on focus)
  useEffect(() => {
    const onFocus = () => fetchWatchlist();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchWatchlist]);

  const add = useCallback(async (symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    if (!upper) return;

    // Optimistic UI update
    setItems((prev) => {
      if (prev.some((i) => i.symbol === upper)) return prev;
      return [...prev, { symbol: upper, addedAt: Date.now() }];
    });

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol: upper }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchWatchlist();
      }
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
      fetchWatchlist();
    }
  }, [fetchWatchlist]);

  const remove = useCallback(async (symbol: string) => {
    const upper = symbol.toUpperCase().trim();

    // Optimistic UI update
    setItems((prev) => prev.filter((i) => i.symbol !== upper));

    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol: upper }),
      });
      if (!res.ok) {
        // Revert on failure
        fetchWatchlist();
      }
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      fetchWatchlist();
    }
  }, [fetchWatchlist]);

  const has = useCallback((symbol: string) => {
    const upper = symbol.toUpperCase().trim();
    return items.some((i) => i.symbol === upper);
  }, [items]);

  return { items, add, remove, has, loading };
}
