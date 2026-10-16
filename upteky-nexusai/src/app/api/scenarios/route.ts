import { DEMO_SCENARIOS } from "@/lib/data/scenarios";

export async function GET() {
  return Response.json({
    success: true,
    total: DEMO_SCENARIOS.length,
    data: DEMO_SCENARIOS
  });
}
