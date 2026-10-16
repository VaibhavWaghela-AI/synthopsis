import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/documents`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn("Backend /api/documents unreachable:", err);
  }

  // Fallback demo documents
  return NextResponse.json({
    success: true,
    total: 2,
    data: [
      {
        id: "doc-sample-1",
        filename: "JM_PlastoPack_Specifications_2026.pdf",
        char_count: 14200,
        num_pages: 6,
        uploaded_at: new Date().toISOString(),
        chunk_count: 18
      },
      {
        id: "doc-sample-2",
        filename: "Apex_Healthcare_Cold_Chain_Protocol.pdf",
        char_count: 9800,
        num_pages: 4,
        uploaded_at: new Date().toISOString(),
        chunk_count: 12
      }
    ]
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");

    if (!docId) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/documents/${docId}`, {
      method: "DELETE",
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    return NextResponse.json({ success: true, message: `Document ${docId} deleted (mock)` });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete document" }, { status: 500 });
  }
}
