// ─────────────────────────────────────────────────────────────
//  API Route — GET /api/news
//  Proxies requests to the Laravel backend running on MySQL.
// ─────────────────────────────────────────────────────────────

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const fetchedAt = new Date().toISOString();
  const forceRefresh = req.nextUrl.searchParams.get("force") === "true";
  const page = req.nextUrl.searchParams.get("page") || "1";
  
  const queryParams = new URLSearchParams();
  if (forceRefresh) queryParams.append("force", "true");
  if (page !== "1") queryParams.append("page", page);
  const qs = queryParams.toString();
  
  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'}/news${qs ? '?' + qs : ''}`;

  try {
    console.log(`[GET /api/news] Proxying request to Laravel backend: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Laravel backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[GET /api/news] Proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return Response.json({
      articles: [],
      averageSeverity: 0,
      fetchedAt,
      error: `[Laravel Backend Proxy Error] ${errorMessage}`,
    });
  }
}

