import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const isDbConnected = await testConnection();
  return NextResponse.json(
    {
      status: isDbConnected ? "ok" : "error",
      database: isDbConnected ? "connected" : "disconnected",
    },
    {
      status: isDbConnected ? 200 : 500,
    }
  );
}
