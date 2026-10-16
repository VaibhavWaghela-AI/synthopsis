import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pythonRes = await fetch(`${BACKEND_URL}/api/leads/upload-csv`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(15000)
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
