/**
 * Upteky NexusAI - Multi-Model AI Router & Resilient Streaming Engine
 * Supports Groq (Llama 3.3), Google Gemini 2.0 Flash, Auto-failover,
 * and high-fidelity simulated fallback for zero-downtime hackathon demos.
 */

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { AIModelProvider, ChatMessage, CommunicationChannel, IndustryVertical } from "../types/api";
import { buildSystemPrompt } from "./prompts";

export interface StreamOptions {
  messages: ChatMessage[];
  model?: AIModelProvider;
  channel?: CommunicationChannel;
  vertical?: IndustryVertical;
  customInstruction?: string;
  temperature?: number;
}

export interface StreamResult {
  stream: ReadableStream<Uint8Array>;
  resolvedProvider: "groq" | "gemini" | "simulated";
  modelName: string;
}

// Client instances (lazily validated)
function getGroqClient(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.includes("your_groq_api_key")) return null;
  return new Groq({ apiKey: key });
}

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.includes("your_gemini_api_key")) return null;
  return new GoogleGenAI({ apiKey: key });
}

/**
 * Generates an intelligent, channel-aware simulated stream when API keys
 * are not provided or rate-limited. Guarantees 100% demo resilience.
 */
function createSimulatedStream(
  lastUserMessage: string,
  channel: CommunicationChannel,
  vertical: IndustryVertical
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  let responseText = "";
  const query = lastUserMessage.toLowerCase();

  if (vertical === "manufacturing") {
    if (channel === "whatsapp") {
      responseText = `Namaste! 📦 *JM PlastoPack Operations Update*\n\nFor your inquiry regarding "${lastUserMessage.slice(0, 30)}...":\n• Standard MOQ: *5,000 units* (HDPE / Food-Grade PP)\n• Production Lead Time: *7-10 working days*\n• Dispatch Hub: *Ahmedabad GIDC*\n\nWould you like me to generate an official quotation PDF right now? ✅`;
    } else {
      responseText = `Dear Valued Partner,\n\nThank you for contacting Upteky Packaging Automations (JM PlastoPack Division).\n\nRegarding your technical inquiry:\n1. Specification Analysis: Verified for high-tensile injection molding.\n2. Quantity MOQ: 5,000 to 50,000 units tier available at volume discount.\n3. Estimated Lead Time: Production schedule confirms dispatch within 8 working days.\n\nOur automated ERP pipeline has registered your query under Ticket #JMP-8841.\n\nBest regards,\nAutomated Manufacturing Ops\nUpteky Solution Pvt. Ltd.`;
    }
  } else if (vertical === "logistics") {
    if (channel === "whatsapp") {
      responseText = `Hello! 🚚 *Upteky Logistics Lead Reactivation*\n\nWe noticed you checked container freight rates from Jebel Ali to Mundra recently.\n\nGreat news: Ocean freight rates dropped *14% this week*! 📉\n• 20ft Standard: Special spot rate locked for 48h\n• Free Port Demurrage: Extended to *14 days*\n\nReply with *LOCK RATE* to secure your slot instantly! ⚓`;
    } else {
      responseText = `Dear Shipper,\n\nFollowing up on your cross-border cargo inquiry:\n\nOur AI Freight Engine has calculated updated spot rates for your shipping lane:\n• Rate Status: 14% discount applied vs last month's quote\n• Customs Clearance: Pre-validated for Nhava Sheva / Mundra / Jebel Ali\n• Real-Time Tracking: Activated via NexusAI WhatsApp Webhook\n\nPlease let us know your preferred Cargo Ready Date (CRD).\n\nBest regards,\nFreight Optimization Division\nUpteky Solution Pvt. Ltd.`;
    }
  } else if (vertical === "real_estate") {
    responseText = `Hello! 🏢 *Upteky Luxury Properties*\n\nThank you for inquiring about our premium developments in GIFT City / Ahmedabad!\n\nHere are the top matches for your interest:\n• *3 & 4 BHK Sky Villas*: Starting at ₹1.85 Cr\n• *Possession*: Q4 2026 | RERA Approved ✅\n\nI have attached the brochure to this thread. Would you prefer a site visit *Tomorrow at 11:30 AM* or *Saturday at 4:00 PM*? 🚗`;
  } else {
    responseText = `Hello! I'm NexusAI, your autonomous enterprise copilot built by Upteky.\n\nI received your message: "${lastUserMessage}"\n\nI can assist you with:\n1. Deploying specialized multi-channel agents (WhatsApp, Email, Web)\n2. Automating ERP and CRM workflows\n3. Reviewing case study metrics (68% faster response, 52% lead reactivation)\n\nHow can I help your business scale today?`;
  }

  // Stream in realistic chunks
  const chunks = responseText.split(" ");

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of chunks) {
        controller.enqueue(encoder.encode(word + " "));
        await new Promise((resolve) => setTimeout(resolve, 35)); // Natural typing rhythm
      }
      controller.close();
    },
  });
}

/**
 * Main stream router orchestrating Groq, Gemini, and fallback logic.
 */
export async function routeChatStream(options: StreamOptions): Promise<StreamResult> {
  const {
    messages,
    model = "auto",
    channel = "web",
    vertical = "general",
    customInstruction,
    temperature = 0.7,
  } = options;

  const systemPrompt = buildSystemPrompt(vertical, channel, customInstruction);
  const lastUserMessage = messages[messages.length - 1]?.content || "Hello";

  // Determine model preference
  let primaryProvider: "groq" | "gemini" = "groq";
  if (model === "gemini") primaryProvider = "gemini";
  else if (model === "groq") primaryProvider = "groq";
  else {
    // Auto mode: use Groq for fast WhatsApp/Web, Gemini for formal email/pharma analysis
    primaryProvider = channel === "email" || vertical === "pharma" ? "gemini" : "groq";
  }

  // -------------------------------------------------------------
  // Attempt 1: Groq (Llama 3.3 70B)
  // -------------------------------------------------------------
  if (primaryProvider === "groq") {
    const groqClient = getGroqClient();
    if (groqClient) {
      try {
        const groqMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: m.content,
          })),
        ];

        const completion = await groqClient.chat.completions.create({
          messages: groqMessages,
          model: "llama-3.3-70b-versatile",
          temperature,
          stream: true,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              for await (const chunk of completion) {
                const text = chunk.choices[0]?.delta?.content || "";
                if (text) controller.enqueue(encoder.encode(text));
              }
            } catch (err) {
              controller.error(err);
            } finally {
              controller.close();
            }
          },
        });

        return {
          stream,
          resolvedProvider: "groq",
          modelName: "Groq Llama 3.3 70B (Ultra-Low Latency)",
        };
      } catch (err) {
        console.warn("Groq streaming failed, attempting Gemini fallback:", err);
      }
    }
  }

  // -------------------------------------------------------------
  // Attempt 2: Gemini 2.0 Flash
  // -------------------------------------------------------------
  const geminiClient = getGeminiClient();
  if (geminiClient) {
    try {
      const geminiContents = messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const responseStream = await geminiClient.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: geminiContents,
        config: {
          systemInstruction: systemPrompt,
          temperature,
        },
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of responseStream) {
              if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return {
        stream,
        resolvedProvider: "gemini",
        modelName: "Google Gemini 2.0 Flash (Multimodal/Reasoning)",
      };
    } catch (err) {
      console.warn("Gemini streaming failed:", err);
    }
  }

  // -------------------------------------------------------------
  // Attempt 3: Resilient Intelligent Simulation Stream (Zero Crash Guarantee)
  // -------------------------------------------------------------
  console.info("Using Upteky Resilient Simulation Engine (Demo Fallback)");
  const fallbackStream = createSimulatedStream(lastUserMessage, channel, vertical);

  return {
    stream: fallbackStream,
    resolvedProvider: "simulated",
    modelName: "Upteky NexusAI Demo Engine (Autonomous Simulation)",
  };
}
