// ─────────────────────────────────────────────────────────────
//  watchlist-store.ts — Shared localStorage watchlist
//  Used by: Overview ([+ ADD]), /watchlist ([−])
//  Pub-sub via storage event + custom event for same-tab sync
// ─────────────────────────────────────────────────────────────

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
}

const STORAGE_KEY = "watchlist_v1";
const CHANGE_EVENT = "watchlist_changed";

// ── Read ──────────────────────────────────────────────────────
export function getWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as WatchlistItem[];
  } catch {
    return [];
  }
}

// ── Write helpers ─────────────────────────────────────────────
function saveWatchlist(items: WatchlistItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  // Notify same-tab listeners
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

// ── Public API ────────────────────────────────────────────────
export function addToWatchlist(symbol: string): void {
  const upper = symbol.toUpperCase().trim();
  if (!upper) return;
  const current = getWatchlist();
  if (current.some((i) => i.symbol === upper)) return;
  saveWatchlist([...current, { symbol: upper, addedAt: Date.now() }]);
}

export function removeFromWatchlist(symbol: string): void {
  const upper = symbol.toUpperCase().trim();
  const current = getWatchlist();
  saveWatchlist(current.filter((i) => i.symbol !== upper));
}

export function isInWatchlist(symbol: string): boolean {
  const upper = symbol.toUpperCase().trim();
  return getWatchlist().some((i) => i.symbol === upper);
}

// ── Pub-sub ───────────────────────────────────────────────────
// Returns unsubscribe fn
export function subscribeWatchlist(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // Same-tab: custom event
  const onCustom = () => callback();
  window.addEventListener(CHANGE_EVENT, onCustom);

  // Cross-tab: storage event
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
