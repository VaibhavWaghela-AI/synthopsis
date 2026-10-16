import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  try {
    const pythonRes = await fetch(`${BACKEND_URL}/api/proposals`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (pythonRes.ok) {
      const data = await pythonRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error("[Proposals API Proxy] Backend fetch failed:", err?.message);
  }

  return NextResponse.json({
    success: true,
    total: 0,
    data: []
  });
}
