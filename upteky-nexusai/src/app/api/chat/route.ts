import { NextRequest } from "next/server";
import { routeChatStream } from "@/lib/ai/router";
import { AIModelProvider, CommunicationChannel, IndustryVertical } from "@/lib/types/api";

export const runtime = "edge"; // Edge runtime for fastest streaming

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      channel = "web",
      model = "auto",
      vertical = "general",
      customInstruction,
      temperature = 0.7,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "A non-empty 'messages' array is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { stream, resolvedProvider, modelName } = await routeChatStream({
      messages,
      channel: channel as CommunicationChannel,
      model: model as AIModelProvider,
      vertical: vertical as IndustryVertical,
      customInstruction,
      temperature,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache, no-transform",
        "X-AI-Provider": resolvedProvider,
        "X-AI-Model": modelName,
      },
    });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error in AI Router",
        details: error?.message || String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
