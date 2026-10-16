import { NextRequest } from "next/server";
import { UPTEKY_BENCHMARKS, calculateCustomROI } from "@/lib/data/analytics";

export async function GET() {
  return Response.json({
    success: true,
    data: UPTEKY_BENCHMARKS
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { monthlyInquiries = 2000, avgHumanCostInr = 150000 } = body;

    const roi = calculateCustomROI(Number(monthlyInquiries), Number(avgHumanCostInr));

    return Response.json({
      success: true,
      data: roi
    });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Invalid calculation payload" }, { status: 400 });
  }
}
