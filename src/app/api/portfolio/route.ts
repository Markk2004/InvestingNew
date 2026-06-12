// ─────────────────────────────────────────────────────────────
//  API Route — GET /api/portfolio
//  Proxies requests to the Laravel backend running on MySQL.
// ─────────────────────────────────────────────────────────────

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'}/portfolio`;

  try {
    console.log(`[GET /api/portfolio] Proxying request to Laravel backend: ${backendUrl}`);
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
    console.error("[GET /api/portfolio] Proxy error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return Response.json({
      active_shares: 0,
      average_cost: 0,
      cash_balance: 0,
      error: `[Laravel Backend Proxy Error] ${errorMessage}`,
    }, { status: 200 });
  }
}
