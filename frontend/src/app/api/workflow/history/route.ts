import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "20";
    
    const res = await fetch(`${BACKEND_URL}/api/workflow/history?limit=${limit}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ success: false, data: [] }, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to fetch workflow history", data: [] });
  }
}
