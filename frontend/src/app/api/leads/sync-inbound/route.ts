import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST() {
  try {
    const pythonRes = await fetch(`${BACKEND_URL}/api/leads/sync-inbound`, {
      method: "POST",
      signal: AbortSignal.timeout(5000)
    });
    if (pythonRes.ok) {
      const data = await pythonRes.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    console.error("[Sync Inbound API Proxy] Failed:", err?.message);
  }

  return NextResponse.json({
    success: false,
    message: "Could not connect to backend server"
  }, { status: 500 });
}
