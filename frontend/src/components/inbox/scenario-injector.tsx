"use client";

import React from "react";
import { DEMO_SCENARIOS } from "@/lib/data/demo-scenarios";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import { Sparkles, MessageSquare, Mail, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScenarioInjector() {
  const { injectScenario, isStreaming, selectedScenarioId } = useInboxStore();

  const getIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="h-3.5 w-3.5 text-[#087a38]" />;
      case "email":
        return <Mail className="h-3.5 w-3.5 text-[#7e22ce]" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-[#0369a1]" />;
    }
  };

  return (
    <div className="p-4 border border-[#121316] bg-white shadow-[2px_2px_0px_#121316] font-mono">
      <div className="flex items-center justify-between mb-3 border-b border-[#e5e5eb] pb-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.2 bg-[#ff2a3b] text-white text-[9px] font-bold">
            DEMO // INJECTORS
          </span>
          <span className="text-xs font-bold uppercase text-[#121316]">
            1-Click Live AI Demo Scenarios
          </span>
        </div>
        <span className="text-[10px] text-zinc-500 font-sans hidden sm:inline">
          Injects realistic customer inquiry + triggers Groq 70B response
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEMO_SCENARIOS.map((scenario) => {
          const isSelected = selectedScenarioId === scenario.id;

          return (
            <button
              key={scenario.id}
              disabled={isStreaming}
              onClick={() => injectScenario(scenario.id)}
              className={cn(
                "p-3 border text-left transition-all duration-150 cursor-pointer disabled:opacity-50 relative",
                isSelected
                  ? "border-[#121316] bg-[#f8f8fa] shadow-[3px_3px_0px_#ff2a3b] -translate-x-0.5 -translate-y-0.5"
                  : "border-[#121316] bg-white hover:bg-[#f8f8fa] shadow-[2px_2px_0px_#121316]"
              )}
            >
              <div className="flex items-center justify-between mb-1.5 border-b border-[#e5e5eb] pb-1">
                <div className="flex items-center gap-1.5">
                  {getIcon(scenario.channel)}
                  <span className="text-xs font-bold text-[#121316]">{scenario.title}</span>
                </div>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 uppercase border flex items-center gap-1 ${
                  scenario.expectedModel === "gemini"
                    ? "bg-[#0369a1] text-white border-[#0369a1]"
                    : "bg-[#121316] text-white border-[#121316]"
                }`}>
                  <Zap className="h-2.5 w-2.5" />
                  <span>{scenario.expectedModel === "gemini" ? "GROQ AI" : "GROQ 70B"}</span>
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 font-sans line-clamp-2 leading-relaxed">
                {scenario.inboundMessage}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
