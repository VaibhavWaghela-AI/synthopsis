import { NextRequest } from "next/server";
import { INITIAL_AGENTS } from "@/lib/data/agents";
import { AgentConfig } from "@/lib/types/api";

// In-memory agent registry for fast runtime modifications
let agentsList: AgentConfig[] = [...INITIAL_AGENTS];

export async function GET() {
  return Response.json({
    success: true,
    total: agentsList.length,
    data: agentsList
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      vertical = "general",
      channel = ["web"],
      preferredModel = "groq",
      systemPrompt = "",
      description = "",
      avatar = "🤖"
    } = body;

    if (!name) {
      return Response.json({ error: "Agent name is required" }, { status: 400 });
    }

    const newAgent: AgentConfig = {
      id: "agent-" + Math.random().toString(36).substring(2, 8),
      name,
      vertical,
      channel,
      preferredModel,
      systemPrompt,
      description,
      avatar,
      status: "active",
      conversationsHandled: 0,
      conversionRate: 0,
      avgResponseSeconds: 1.0,
      samplePrompts: []
    };

    agentsList.unshift(newAgent);

    return Response.json({
      success: true,
      message: "Agent created successfully",
      data: newAgent
    }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Invalid payload" }, { status: 500 });
  }
}
