"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Zap,
  Layers,
  GitFork,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Cpu,
  FileText,
  Activity
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface JourneyStep {
  id: string;
  stepNum: string;
  title: string;
  subtitle: string;
  description: string;
  telemetryTag: string;
  latency: string;
  payload: Record<string, string>;
  accentColor: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: "step-1",
    stepNum: "01",
    title: "Omnichannel Inbound Interception",
    subtitle: "WhatsApp • Email • Web Chat",
    description: "Inbound customer inquiries are ingested via real-time WebSockets with zero packet loss. Audio notes are transcribed via Whisper, and metadata (phone, GSTIN, sentiment) is extracted within 40 milliseconds.",
    telemetryTag: "INGESTION // SOCKET_OK",
    latency: "38ms",
    payload: {
      "channel": "WhatsApp Business API",
      "sender": "+91 98254 11029 (Rajesh Patel)",
      "intent": "Property Purchase Inquiry",
      "sentiment": "Positive (High Intent)"
    },
    accentColor: "#087a38"
  },
  {
    id: "step-2",
    stepNum: "02",
    title: "Groq LPU Llama 3.3 70B Reasoning",
    subtitle: "Deterministic Token Synthesis",
    description: "Inference is processed on dedicated Groq Language Processing Units (LPUs). Token velocity hits 185 tokens/sec, formulating a personalized response and extracting constraints in under 200ms.",
    telemetryTag: "INFERENCE // GROQ_LPU_70B",
    latency: "182ms",
    payload: {
      "model": "Llama-3.3-70b-versatile",
      "ttft": "180ms",
      "token_speed": "184.2 tok/s",
      "reasoning_confidence": "98.4%"
    },
    accentColor: "#ff2a3b"
  },
  {
    id: "step-3",
    stepNum: "03",
    title: "Isolated Tenant Document RAG",
    subtitle: "Catalogs • Pricing • Compliance",
    description: "Vector similarity search executes against the company's uploaded PDF documents (pricing matrices, CDSCO norms, or technical specs) to ensure 0% hallucination and 100% verified facts.",
    telemetryTag: "RETRIEVAL // VECTOR_SIMILARITY",
    latency: "45ms",
    payload: {
      "retrieved_doc": "SkyLine_Heights_Pricelist_2026.pdf",
      "chunk_relevance": "0.962 (Cosine)",
      "matched_units": "4 Garden-facing 2BHKs available",
      "pricing_lock": "₹64 Lakhs Base"
    },
    accentColor: "#0369a1"
  },
  {
    id: "step-4",
    stepNum: "04",
    title: "Multi-Channel Action Execution",
    subtitle: "ERP Sync • CRM Dispatch • PDF Generation",
    description: "The agent doesn't just chat—it acts. It generates a verified proforma PDF, logs the deal in Tally / Zoho CRM, and dispatches the customized brochure directly into the WhatsApp thread.",
    telemetryTag: "EXECUTION // WEBHOOK_DISPATCH",
    latency: "94ms",
    payload: {
      "action_1": "WhatsApp brochure PDF attached",
      "action_2": "Zoho CRM Lead Created (Score: 92)",
      "action_3": "Site Visit reserved for Sun 11:00 AM",
      "erp_status": "POST /api/v1/leads 200 OK"
    },
    accentColor: "#7e22ce"
  },
  {
    id: "step-5",
    stepNum: "05",
    title: "Human-in-the-Loop Safety Net",
    subtitle: "Seamless Operator Takeover",
    description: "If confidence dips below 90% or enterprise negotiation triggers, the conversation seamlessly hands off to a human sales manager with a full context summary and one-click takeover.",
    telemetryTag: "SUPERVISION // HUMAN_FAILSAFE",
    latency: "12ms",
    payload: {
      "escalation_check": "PASSED (Threshold > 95%)",
      "supervisor_assigned": "Priya Mehta (Support Lead)",
      "audit_trail": "Recorded to ISO 27001 Log",
      "status": "AUTONOMOUSLY COMPLETED"
    },
    accentColor: "#121316"
  }
];

export function ScrollytellingJourney() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const currentStep = JOURNEY_STEPS[activeStepIndex];

  return (
    <div className="border-2 border-[#121316] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#121316] font-mono relative overflow-hidden">
      {/* Corner Crosshairs */}
      <div className="absolute top-2 left-2 text-xs font-bold text-[#121316]">+</div>
      <div className="absolute top-2 right-2 text-xs font-bold text-[#121316]">+</div>
      <div className="absolute bottom-2 left-2 text-xs font-bold text-[#121316]">+</div>
      <div className="absolute bottom-2 right-2 text-xs font-bold text-[#121316]">+</div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#121316] pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#ff2a3b] text-white text-[10px] font-black uppercase">
              SCROLLYTELLING // PROTOCOL
            </span>
            <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline">
              AUTONOMOUS PIPELINE LIFECYCLE
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black uppercase text-[#121316] tracking-tight">
            How Synthopsis AI Executes In &lt; 300ms
          </h2>
        </div>

        {/* Step Selector Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {JOURNEY_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStepIndex(idx)}
              className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                activeStepIndex === idx
                  ? "bg-[#121316] text-white border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                  : "bg-[#f8f8fa] text-zinc-600 border-[#d6d6de] hover:border-[#121316]"
              }`}
            >
              STEP_{step.stepNum}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Narrative & Explanation */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 mb-2">
              <span className="px-1.5 py-0.2 bg-[#121316] text-white">
                PHASE {currentStep.stepNum} OF 05
              </span>
              <span className="text-[#ff2a3b]">{currentStep.telemetryTag}</span>
            </div>

            <h3 className="text-xl font-black uppercase text-[#121316] tracking-tight mb-1">
              {currentStep.title}
            </h3>

            <div className="text-xs font-bold text-zinc-500 uppercase mb-3">
              // {currentStep.subtitle}
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed">
              {currentStep.description}
            </p>
          </div>

          {/* Stepper Controller */}
          <div className="pt-4 border-t border-[#e5e5eb] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500">
                PHASE LATENCY:
              </span>
              <span className="px-2 py-0.5 bg-[#f8f8fa] border border-[#121316] text-[10px] font-black text-[#ff2a3b]">
                {currentStep.latency}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 text-[10px] font-bold border border-[#121316] bg-white hover:bg-[#f2f2f5] disabled:opacity-40 cursor-pointer"
              >
                ← PREV
              </button>
              <button
                disabled={activeStepIndex === JOURNEY_STEPS.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(JOURNEY_STEPS.length - 1, prev + 1))}
                className="px-2.5 py-1 text-[10px] font-bold border border-[#121316] bg-[#121316] text-white hover:bg-[#ff2a3b] disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#ff2a3b]"
              >
                NEXT STEP →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Isometric Payload Inspector */}
        <div className="lg:col-span-6 border-2 border-[#121316] bg-[#f8f8fa] p-5 shadow-[3px_3px_0px_#121316] flex flex-col justify-between cyber-grid-dense">
          <div>
            <div className="flex items-center justify-between border-b border-[#121316] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ff2a3b] animate-ping" />
                <span className="text-[10px] font-bold text-[#121316] uppercase">
                  LIVE TELEMETRY INSPECTOR
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 bg-white border border-[#121316] font-bold">
                200 OK
              </span>
            </div>

            {/* JSON/KV Terminal readout */}
            <div className="space-y-2 bg-white p-3 border border-[#121316] shadow-[2px_2px_0px_rgba(0,0,0,0.05)]">
              {Object.entries(currentStep.payload).map(([key, val]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs gap-1">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                    {key}:
                  </span>
                  <span className="font-bold text-[#121316] text-[11px] font-mono text-right truncate">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Action Prompt */}
          <div className="mt-4 pt-3 border-t border-[#e5e5eb] flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">
              EXPERIENCE THIS LIVE IN THE INBOX:
            </span>
            <Link href="/dashboard/inbox">
              <Button size="sm" variant="cyber" className="h-6 px-2 text-[9px]">
                TEST INBOX →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
