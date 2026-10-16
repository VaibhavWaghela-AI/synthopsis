import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const pythonRes = await fetch(`${BACKEND_URL}/api/leads?status=${status}`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (pythonRes.ok) {
      const data = await pythonRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error("[Leads API Proxy] Python fetch failed:", err?.message);
  }

  return NextResponse.json({
    success: true,
    total: 0,
    data: []
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pythonRes = await fetch(`${BACKEND_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });
    if (pythonRes.ok) {
      const data = await pythonRes.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: "Failed to create lead on backend" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
