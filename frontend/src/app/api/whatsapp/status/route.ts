import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:3006/qr-data", {
      cache: "no-store",
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // whatsapp-service not running on port 3006
  }

  return NextResponse.json({
    status: "offline",
    message: "whatsapp-service is not currently running on port 3006. Start with 'npm start' in whatsapp-service/",
    qrDataUrl: null,
    phone: null
  });
}
