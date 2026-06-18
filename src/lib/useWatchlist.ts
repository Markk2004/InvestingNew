"use client";

// ─────────────────────────────────────────────────────────────
//  useWatchlist.ts — React hook wrapping watchlist-store
//  Subscribes to change events → re-renders on add/remove
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  getWatchlist,
  addToWatchlist as storeAdd,
  removeFromWatchlist as storeRemove,
  isInWatchlist as storeHas,
  subscribeWatchlist,
  type WatchlistItem,
} from "./watchlist-store";

interface UseWatchlistReturn {
  items: WatchlistItem[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

export function useWatchlist(): UseWatchlistReturn {
  const [items, setItems] = useState<WatchlistItem[]>([]);

  // Load on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(getWatchlist());
  }, []);

  // Subscribe to changes (same-tab + cross-tab)
  useEffect(() => {
    const unsub = subscribeWatchlist(() => {
      setItems(getWatchlist());
    });
    return unsub;
  }, []);

  const add = useCallback((symbol: string) => {
    storeAdd(symbol);
    setItems(getWatchlist());
  }, []);

  const remove = useCallback((symbol: string) => {
    storeRemove(symbol);
    setItems(getWatchlist());
  }, []);

  const has = useCallback((symbol: string) => {
    return storeHas(symbol);
  }, []);

  return { items, add, remove, has };
}
