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
  sheet?: string;
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
  { id: "sofa-3",       name: "3-Seat Sofa",       emoji: "🛋️",  cost: 3200, category: "lounge", sx: 149, sy: 5,   sw: 70, sh: 41, cols: 3, rows: 2, color: "#1a1a2e" },
  { id: "armchair",     name: "Armchair",           emoji: "🪑",  cost:  800, category: "chair",  sx: 5,   sy: 5,   sw: 38, sh: 41, cols: 2, rows: 2, color: "#2a1a3e" },
  { id: "office-chair", name: "Office Chair",       emoji: "💺",  cost:  650, category: "chair",  sx: 312, sy: 87,  sw: 16, sh: 41, cols: 1, rows: 2, color: "#1e2a3a" },
  // Plants
  { id: "plant-tall",   name: "Tall Plant",         emoji: "🌿",  cost:  420, category: "plant",  sx: 416, sy: 82,  sw: 16, sh: 45, cols: 1, rows: 2, color: "#0f3d0c" },
  { id: "plant-small",  name: "Desk Plant",         emoji: "🪴",  cost:  180, category: "plant",  sx: 368, sy: 105, sw: 16, sh: 22, cols: 1, rows: 1, color: "#1a5c14" },
  // Tech
  { id: "monitor-wall", name: "Wall Monitor",       emoji: "📺",  cost: 4500, category: "tech",   sx: 386, sy: 290, sw: 44, sh: 28, cols: 3, rows: 2, color: "#0a0a1a" },
  { id: "server-rack",  name: "Server Rack",        emoji: "🖧",   cost: 6000, category: "tech",   sx: 227, sy: 261, sw: 29, sh: 74, cols: 2, rows: 3, color: "#030810" },
  // Decor
  { id: "rug-round",    name: "Round Rug",          emoji: "🎯",  cost:  900, category: "decor",  sx: 273, sy: 385, sw: 62, sh: 62, cols: 3, rows: 3, color: "#1a0030" },
  { id: "painting",     name: "Abstract Art",       emoji: "🎨",  cost: 1500, category: "decor",  sx: 402, sy: 132, sw: 28, sh: 37, cols: 2, rows: 2, color: "#2a0a3e" },
  { id: "cabinet",      name: "Filing Cabinet",     emoji: "🗄️",  cost:  720, category: "decor",  sx: 180, sy: 192, sw: 40, sh: 63, cols: 2, rows: 2, color: "#0a1628" },
  { id: "bookshelf",    name: "Bookshelf",          emoji: "📚",  cost: 1100, category: "decor",  sx: 162, sy: 65,  sw: 44, sh: 62, cols: 2, rows: 3, color: "#0d1f35" },

  // New items from /stylish_modularfurniture.png
  { id: "mod-sofa",     name: "Modular Sofa",     emoji: "🛋️",  cost: 1600, category: "lounge", sx: 1,   sy: 3,   sw: 62, sh: 42, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "glass-cabinet",name: "Glass Cabinet",     emoji: "🗄️",  cost: 1800, category: "decor",  sx: 69,  sy: 3,   sw: 26, sh: 58, cols: 1, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "media-console",name: "Media Console",     emoji: "📺",  cost: 9500, category: "tech",   sx: 97,  sy: 3,   sw: 94, sh: 122,cols: 4, rows: 3, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "black-wardrobe",name: "Black Wardrobe",   emoji: "🚪",  cost: 2100, category: "decor",  sx: 210, sy: 0,   sw: 44, sh: 58, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "mod-armchair", name: "Modular Armchair",   emoji: "🪑",  cost: 950,  category: "chair",  sx: 272, sy: 0,   sw: 48, sh: 60, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "display-shelf",name: "Display Shelf",     emoji: "📚",  cost: 1400, category: "decor",  sx: 16,  sy: 98,  sw: 48, sh: 61, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "mod-bookshelf",name: "Modular Bookshelf", emoji: "📚",  cost: 2200, category: "decor",  sx: 144, sy: 128, sw: 48, sh: 69, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "mod-sideboard",name: "Modern Sideboard",   emoji: "💼",  cost: 2800, category: "desk",   sx: 80,  sy: 192, sw: 48, sh: 53, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },
  { id: "sleek-desk",   name: "Sleek Desk",         emoji: "💼",  cost: 3200, category: "desk",   sx: 144, sy: 208, sw: 48, sh: 48, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_modularfurniture.png" },

  // New items from /stylish_room_door_tiles.png
  { id: "large-window", name: "Large Window",       emoji: "🪟",  cost: 1200, category: "decor",  sx: 416, sy: 29,  sw: 64, sh: 35, cols: 3, rows: 2, color: "#000000", sheet: "/stylish_room_door_tiles.png" },
  { id: "pano-window",  name: "Panoramic Window",   emoji: "🪟",  cost: 3500, category: "decor",  sx: 416, sy: 96,  sw: 128,sh: 64, cols: 4, rows: 2, color: "#000000", sheet: "/stylish_room_door_tiles.png" },
  { id: "glass-door",   name: "Glass Door",         emoji: "🚪",  cost: 2500, category: "decor",  sx: 186, sy: 160, sw: 38, sh: 64, cols: 2, rows: 2, color: "#000000", sheet: "/stylish_room_door_tiles.png" },
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
