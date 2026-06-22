"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "default" | "crimson";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("crimson");

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", "crimson");
    localStorage.setItem("app_theme", "crimson");
  }, []);

  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: "crimson", toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
