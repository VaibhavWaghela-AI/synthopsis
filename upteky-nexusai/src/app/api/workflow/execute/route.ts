import { NextRequest } from "next/server";
import { executeWorkflow, DEFAULT_WORKFLOW } from "@/lib/workflow/orchestrator";

export async function POST(req: NextRequest) {
  try {
    let payload = {};
    try {
      payload = await req.json();
    } catch {
      // empty body fallback is acceptable
    }

    const result = await executeWorkflow(DEFAULT_WORKFLOW, payload);

    return Response.json({
      success: true,
      data: result
    });
  } catch (err: any) {
    return Response.json({
      success: false,
      error: err?.message || "Workflow execution failed"
    }, { status: 500 });
  }
}
