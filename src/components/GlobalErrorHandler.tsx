"use client";

import { useEffect } from "react";

export default function GlobalErrorHandler() {
  useEffect(() => {
    const logToBackend = async (data: any) => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api";
        await fetch(`${backendUrl}/system/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.error("Failed to log to backend:", e);
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
      // Ignore generic cross-origin script errors that contain no details
      if (event.message === "Script error.") {
        return;
      }
      // Ignore benign ResizeObserver errors that often occur during layout shifts or CSS transitions
      if (event.message.includes("ResizeObserver loop") || event.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        // Prevent default to stop it from flooding the browser console too, if possible
        event.preventDefault();
        return;
      }
      logToBackend({
        type: "error",
        message: event.message,
        stack_trace: event.error?.stack || null,
        url: window.location.href,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      logToBackend({
        type: "error",
        message: typeof reason === "string" ? reason : reason?.message || "Unhandled Promise Rejection",
        stack_trace: reason?.stack || null,
        url: window.location.href,
      });
    };

    // Performance monitoring (simple page load time)
    const logPerformance = () => {
      if (window.performance) {
        const perfData = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.startTime;
          // Only log if load time is unusually slow (> 3 seconds)
          if (loadTime > 3000) {
            logToBackend({
              type: "performance",
              message: `Slow page load detected: ${Math.round(loadTime)}ms`,
              url: window.location.href,
            });
          }
        }
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("load", logPerformance);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("load", logPerformance);
    };
  }, []);

  return null;
}
