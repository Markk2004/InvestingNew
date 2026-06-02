"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────
export interface FurnitureItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  category: "desk" | "chair" | "plant" | "decor" | "tech" | "lounge";
  sx: number; sy: number; sw: number; sh: number;
  cols: number; rows: number;
  color: string;
}

export interface PlacedItem {
  uid: string;
  itemId: string;
  gridX: number;
  gridY: number;
  flipped: boolean;
}

export interface FloorTheme {
  id: string;
  name: string;
  cost: number;
  bg: string;
  tile1: string;
  tile2: string;
  border: string;
  accent: string;
}

interface OfficeContextType {
  budget: number;
  setBudget: (v: number) => void;
  spent: number;
  setSpent: (v: number | ((prev: number) => number)) => void;
  placedItems: PlacedItem[];
  setPlacedItems: (items: PlacedItem[] | ((prev: PlacedItem[]) => PlacedItem[])) => void;
  activeTheme: FloorTheme;
  setActiveTheme: (theme: FloorTheme) => void;
  floorThemes: FloorTheme[];
  catalog: FurnitureItem[]; // We'll keep catalog definition in a shared place or just define it in RenovateTab
  
  draftSpent: number;
  setDraftSpent: (v: number | ((prev: number) => number)) => void;
  draftPlacedItems: PlacedItem[];
  setDraftPlacedItems: (items: PlacedItem[] | ((prev: PlacedItem[]) => PlacedItem[])) => void;
  draftTheme: FloorTheme;
  setDraftTheme: (theme: FloorTheme) => void;
  confirmRenovation: () => void;
  cancelRenovation: () => void;
}

export const FLOOR_THEMES: FloorTheme[] = [
  { id: "night-office", name: "Night Office",  cost:    0, bg: "#04090f", tile1: "#081422", tile2: "#091626", border: "#060f1e", accent: "#1e3a5f" },
  { id: "mahogany",     name: "Mahogany Wood", cost: 5000, bg: "#1a0a00", tile1: "#2a1200", tile2: "#220f00", border: "#3d1a00", accent: "#8b4513" },
  { id: "marble",       name: "White Marble",  cost: 8000, bg: "#f0eff0", tile1: "#e8e8ea", tile2: "#dddde0", border: "#c0c0c5", accent: "#a0a0b0" },
  { id: "cyber",        name: "Cyber Grid",    cost: 6000, bg: "#000a14", tile1: "#001020", tile2: "#000e1a", border: "#003060", accent: "#00ccff" },
  { id: "green-carpet", name: "Emerald Suite", cost: 4000, bg: "#020f08", tile1: "#041408", tile2: "#061a0a", border: "#0a2a10", accent: "#1a7040" },
];

export const CATALOG: FurnitureItem[] = [
  // Desks
  { id: "exec-desk",    name: "Executive Desk",   emoji: "🖥️",  cost: 2400, category: "desk",   sx: 388, sy: 10,  sw: 56, sh: 52, cols: 3, rows: 2, color: "#1e3a5f" },
  { id: "wide-desk",    name: "Wide Desk",         emoji: "💼",  cost: 1200, category: "desk",   sx: 209, sy: 154, sw: 62, sh: 36, cols: 3, rows: 2, color: "#0a1f3a" },
  { id: "corner-desk",  name: "Corner Desk",       emoji: "📐",  cost: 1800, category: "desk",   sx: 273, sy: 154, sw: 62, sh: 36, cols: 4, rows: 2, color: "#0d2040" },
  // Chairs
  { id: "sofa-3",       name: "3-Seat Sofa",       emoji: "🛋️",  cost: 3200, category: "lounge", sx: 337, sy: 385, sw: 46, sh: 62, cols: 3, rows: 2, color: "#1a1a2e" },
  { id: "armchair",     name: "Armchair",           emoji: "🪑",  cost:  800, category: "chair",  sx: 0,   sy: 0,   sw: 48, sh: 48, cols: 2, rows: 2, color: "#2a1a3e" },
  { id: "office-chair", name: "Office Chair",       emoji: "💺",  cost:  650, category: "chair",  sx: 48,  sy: 0,   sw: 32, sh: 48, cols: 1, rows: 2, color: "#1e2a3a" },
  // Plants
  { id: "plant-tall",   name: "Tall Plant",         emoji: "🌿",  cost:  420, category: "plant",  sx: 338, sy: 77, sw: 22, sh: 72, cols: 1, rows: 2, color: "#0f3d0c" },
  { id: "plant-small",  name: "Desk Plant",         emoji: "🪴",  cost:  180, category: "plant",  sx: 360, sy: 99, sw: 22, sh: 40, cols: 1, rows: 1, color: "#1a5c14" },
  // Tech
  { id: "monitor-wall", name: "Wall Monitor",       emoji: "📺",  cost: 4500, category: "tech",   sx: 380, sy: 10, sw: 56, sh: 42, cols: 3, rows: 2, color: "#0a0a1a" },
  { id: "server-rack",  name: "Server Rack",        emoji: "🖧",   cost: 6000, category: "tech",   sx: 209, sy: 231, sw: 46, sh: 78, cols: 2, rows: 3, color: "#030810" },
  // Decor
  { id: "rug-round",    name: "Round Rug",          emoji: "🎯",  cost:  900, category: "decor",  sx: 273, sy: 385, sw: 62, sh: 62, cols: 3, rows: 3, color: "#1a0030" },
  { id: "painting",     name: "Abstract Art",       emoji: "🎨",  cost: 1500, category: "decor",  sx: 382, sy: 77, sw: 44, sh: 54, cols: 2, rows: 2, color: "#2a0a3e" },
  { id: "cabinet",      name: "Filing Cabinet",     emoji: "🗄️",  cost:  720, category: "decor",  sx: 0,   sy: 231, sw: 46, sh: 78, cols: 2, rows: 2, color: "#0a1628" },
  { id: "bookshelf",    name: "Bookshelf",          emoji: "📚",  cost: 1100, category: "decor",  sx: 158, sy: 77, sw: 56, sh: 90, cols: 2, rows: 3, color: "#0d1f35" },
];

// Initial layout (what the office looks like before you renovate)
export const INITIAL_LAYOUT: PlacedItem[] = [
  { uid: "init-1", itemId: "wide-desk",   gridX: 2,  gridY: 10,  flipped: false },
  { uid: "init-2", itemId: "wide-desk",   gridX: 5,  gridY: 10,  flipped: false },
  { uid: "init-3", itemId: "exec-desk",   gridX: 11, gridY: 10,  flipped: false },
  { uid: "init-4", itemId: "rug-round",   gridX: 6,  gridY: 6,   flipped: false },
  { uid: "init-5", itemId: "sofa-3",      gridX: 7,  gridY: 6,   flipped: false },
  { uid: "init-6", itemId: "corner-desk", gridX: 3,  gridY: 4,   flipped: false },
];

const OfficeContext = createContext<OfficeContextType | null>(null);

export function OfficeProvider({ children }: { children: ReactNode }) {
  const [budget, setBudget] = useState(25000);
  const [spent, setSpent] = useState(0);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(INITIAL_LAYOUT);
  const [activeTheme, setActiveTheme] = useState<FloorTheme>(FLOOR_THEMES[0]);

  // Draft states matching the structure
  const [draftSpent, setDraftSpent] = useState(0);
  const [draftPlacedItems, setDraftPlacedItems] = useState<PlacedItem[]>(INITIAL_LAYOUT);
  const [draftTheme, setDraftTheme] = useState<FloorTheme>(FLOOR_THEMES[0]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedPlaced = localStorage.getItem("pixel_office_placed");
      const savedTheme = localStorage.getItem("pixel_office_theme");
      const savedSpent = localStorage.getItem("pixel_office_spent");
      const savedBudget = localStorage.getItem("pixel_office_budget");

      if (savedPlaced) {
        const parsedPlaced = JSON.parse(savedPlaced);
        setPlacedItems(parsedPlaced);
        setDraftPlacedItems(parsedPlaced);
      }
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        setActiveTheme(parsedTheme);
        setDraftTheme(parsedTheme);
      }
      if (savedSpent) {
        const parsedSpent = Number(savedSpent);
        setSpent(parsedSpent);
        setDraftSpent(parsedSpent);
      }
      if (savedBudget) {
        setBudget(Number(savedBudget));
      }
    } catch (e) {
      console.error("Failed to load layout from localStorage:", e);
    }
  }, []);

  const confirmRenovation = () => {
    setPlacedItems(draftPlacedItems);
    setActiveTheme(draftTheme);
    setSpent(draftSpent);

    try {
      localStorage.setItem("pixel_office_placed", JSON.stringify(draftPlacedItems));
      localStorage.setItem("pixel_office_theme", JSON.stringify(draftTheme));
      localStorage.setItem("pixel_office_spent", String(draftSpent));
      localStorage.setItem("pixel_office_budget", String(budget));
    } catch (e) {
      console.error("Failed to save layout to localStorage:", e);
    }
  };

  const cancelRenovation = () => {
    setDraftPlacedItems(placedItems);
    setDraftTheme(activeTheme);
    setDraftSpent(spent);
  };

  return (
    <OfficeContext.Provider
      value={{
        budget, setBudget,
        spent, setSpent,
        placedItems, setPlacedItems,
        activeTheme, setActiveTheme,
        floorThemes: FLOOR_THEMES,
        catalog: CATALOG,
        draftSpent, setDraftSpent,
        draftPlacedItems, setDraftPlacedItems,
        draftTheme, setDraftTheme,
        confirmRenovation,
        cancelRenovation,
      }}
    >
      {children}
    </OfficeContext.Provider>
  );
}

export function useOffice() {
  const ctx = useContext(OfficeContext);
  if (!ctx) throw new Error("useOffice must be used within OfficeProvider");
  return ctx;
}
