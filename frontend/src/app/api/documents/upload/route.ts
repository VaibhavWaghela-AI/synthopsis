import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Try forwarding to Python FastAPI backend
    try {
      const backendFormData = new FormData();
      backendFormData.append("file", file);

      const pythonRes = await fetch(`${BACKEND_URL}/api/documents/upload`, {
        method: "POST",
        body: backendFormData,
        signal: AbortSignal.timeout(10000)
      });

      if (pythonRes.ok) {
        const data = await pythonRes.json();
        return NextResponse.json(data);
      }
    } catch (backendErr) {
      console.warn("Backend upload error, parsing client-side:", backendErr);
    }

    // Local fallback for text/plain, json, csv, md
    const text = await file.text();
    return NextResponse.json({
      success: true,
      filename: file.name,
      size_bytes: file.size,
      num_pages: 1,
      char_count: text.length,
      extracted_text: text,
      preview: text.slice(0, 250) + (text.length > 250 ? "..." : "")
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
