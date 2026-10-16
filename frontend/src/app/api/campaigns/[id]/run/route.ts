import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const pythonRes = await fetch(`${BACKEND_URL}/api/campaigns/${id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    if (pythonRes.ok) {
      const data = await pythonRes.json();
      return NextResponse.json(data);
    }
    const err = await pythonRes.text();
    return NextResponse.json({ error: err }, { status: pythonRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
