import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Connect to Python backend if live
    try {
      const pythonRes = await fetch(`${BACKEND_URL}/api/analytics/roi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_inquiries: body.monthlyInquiries || body.monthly_inquiries || 5000,
          avg_human_cost_inr: body.avgHumanCostInr || body.avg_human_cost_inr || 200000
        }),
        signal: AbortSignal.timeout(5000)
      });
      if (pythonRes.ok) {
        const data = await pythonRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    const inquiries = Number(body.monthlyInquiries || 5000);
    const humanCost = Number(body.avgHumanCostInr || 200000);
    const automated = Math.round(inquiries * 0.78);
    const savings = Math.round(humanCost * 0.65);

    return NextResponse.json({
      success: true,
      data: {
        monthly_inquiries: inquiries,
        automated_inquiries: automated,
        hours_saved: Math.round((automated * 12) / 60),
        projected_savings_inr: savings,
        nexus_cost_inr: 4999,
        net_monthly_profit_inr: savings - 4999,
        roi_multiplier: Number((savings / 4999).toFixed(1))
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
