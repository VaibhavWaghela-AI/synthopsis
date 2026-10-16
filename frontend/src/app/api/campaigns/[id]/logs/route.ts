import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pythonRes = await fetch(`${BACKEND_URL}/api/campaigns/${id}/logs`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (pythonRes.ok) {
      const data = await pythonRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error("[Campaign Logs Proxy] Failed:", err?.message);
  }

  return NextResponse.json({
    success: true,
    total: 0,
    data: []
  });
}
