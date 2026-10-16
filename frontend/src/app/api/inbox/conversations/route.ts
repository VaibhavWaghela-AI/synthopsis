import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel") || "";

  try {
    const url = channel ? `${BACKEND_URL}/api/inbox/conversations?channel=${channel}` : `${BACKEND_URL}/api/inbox/conversations`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.warn("Backend /api/inbox/conversations unreachable:", err);
  }

  return NextResponse.json({
    success: true,
    total: 3,
    data: [
      { id: "conv-wa-1", channel: "whatsapp", sender: "+91 98254 11029", title: "Ramesh Patel (Procurement)", subtitle: "Active Negotiation", unread_count: 2 },
      { id: "conv-em-1", channel: "email", sender: "s.nambiar@apexhealth.in", title: "Suresh Nambiar (Apex Health)", subtitle: "Diagnostic RFP Review", unread_count: 1 },
      { id: "conv-wb-1", channel: "web", sender: "Visitor #8421", title: "Web Lead (Ahmedabad)", subtitle: "Catalog Ingestion", unread_count: 0 }
    ]
  });
}
