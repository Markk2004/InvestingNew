"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CEO_SPEED, CEO_ZONE_H } from "./model";

const CEO_KEYS = [
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "KeyW", "KeyA", "KeyS", "KeyD",
];

export function useOfficeRuntime() {
  const [ceoPos, setCeoPos] = useState({ x: 180, y: 60 });
  const keysRef = useRef<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const officeWRef = useRef(1000);

  // Keyboard listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (CEO_KEYS.includes(e.code)) {
        keysRef.current[e.code] = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    let rafId: number;

    const tick = () => {
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;

      if (keys.ArrowLeft  || keys.KeyA) dx -= CEO_SPEED;
      if (keys.ArrowRight || keys.KeyD) dx += CEO_SPEED;
      if (keys.ArrowUp    || keys.KeyW) dy -= CEO_SPEED;
      if (keys.ArrowDown  || keys.KeyS) dy += CEO_SPEED;

      if (dx !== 0 || dy !== 0) {
        setCeoPos((p) => ({
          x: Math.max(28, Math.min(officeWRef.current - 28, p.x + dx)),
          y: Math.max(18, Math.min(CEO_ZONE_H - 28, p.y + dy)),
        }));
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const setMove = useCallback((code: string, pressed: boolean) => {
    keysRef.current[code] = pressed;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    officeWRef.current = el.clientWidth;

    const ro = new ResizeObserver(() => {
      officeWRef.current = el.clientWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return {
    ceoPos,
    setMove,
    containerRef,
  };
}
