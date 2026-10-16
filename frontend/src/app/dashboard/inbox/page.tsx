"use client";

import React from "react";
import { ScenarioInjector } from "@/components/inbox/scenario-injector";
import { ChannelTabs } from "@/components/inbox/channel-tabs";
import { WhatsAppThread } from "@/components/inbox/whatsapp-thread";
import { EmailThread } from "@/components/inbox/email-thread";
import { WebChatWidget } from "@/components/inbox/web-chat-widget";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import { Zap, Star } from "lucide-react";

export default function OmnichannelInboxPage() {
  const { activeChannel, activeModel, setActiveModel } = useInboxStore();

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="border border-[#121316] bg-white p-5 shadow-[3px_3px_0px_#121316] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[10px]">
            <span className="px-2 py-0.5 bg-[#ff2a3b] text-white font-bold uppercase inline-flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-white" /> STAR DEMO // REAL-TIME TRIAGE
            </span>
            <span className="text-zinc-500 font-mono">GROQ 70B STREAMING ACTIVE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#121316] tracking-tight uppercase">
            Omnichannel Simulator
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Test multi-channel customer inquiries across WhatsApp, Email, and Web Chat with sub-second AI reasoning.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="text-[10px] text-zinc-500 font-bold uppercase hidden md:inline">
            Active Model:
          </div>
          <button
            onClick={() => setActiveModel("groq")}
            className={`px-3 py-1.5 font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer border ${
              activeModel === "groq"
                ? "bg-[#121316] text-white border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                : "bg-white text-[#121316] border-[#121316] hover:bg-[#f2f2f5]"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-[#ff2a3b]" />
            GROQ 70B (200MS)
          </button>

          <button
            onClick={() => setActiveModel("gemini")}
            className={`px-3 py-1.5 font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer border ${
              activeModel === "gemini"
                ? "bg-[#121316] text-white border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                : "bg-white text-[#121316] border-[#121316] hover:bg-[#f2f2f5]"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            GROQ AI (REASONER)
          </button>
        </div>
      </div>

      {/* 1-Click Scenario Injector */}
      <ScenarioInjector />

      {/* Channel Switcher Tabs */}
      <ChannelTabs />

      {/* Active Channel View */}
      <div>
        {activeChannel === "whatsapp" && <WhatsAppThread />}
        {activeChannel === "email" && <EmailThread />}
        {activeChannel === "web" && <WebChatWidget />}
      </div>
    </div>
  );
}
