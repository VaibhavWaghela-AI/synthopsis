"use client";

import React from "react";
import { TemplateGallery } from "@/components/agents/template-gallery";
import { AgentCard } from "@/components/agents/agent-card";
import { useAgentStore } from "@/lib/store/use-agent-store";
import { Button } from "@/components/ui/button";
import { Bot, Plus, Layers } from "lucide-react";

export default function AgentStudioPage() {
  const { agents, openConfigDialog } = useAgentStore();

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="border border-[#121316] bg-white p-5 shadow-[3px_3px_0px_#121316] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[10px]">
            <span className="px-2 py-0.5 bg-[#ff2a3b] text-white font-bold uppercase">
              STUDIO // FLEET
            </span>
            <span className="text-zinc-500">{agents.length} CONFIGURED</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#121316] tracking-tight uppercase">
            Agent Studio
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Configure system prompts, connect company documents, and deploy to WhatsApp, Email, or Web in 1-click.
          </p>
        </div>

        <Button
          variant="cyber"
          onClick={() => openConfigDialog()}
          className="gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          CREATE CUSTOM AGENT
        </Button>
      </div>

      {/* Sector Deployment Blueprints */}
      <TemplateGallery />

      {/* Active Deployed Fleet Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#121316] pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#ff2a3b]">03 // ACTIVE FLEET</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#121316]">
              Deployed Agent Instances
            </h2>
          </div>
          <span className="text-[10px] text-zinc-500">
            SYNCED WITH GROQ 70B ROUTER
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
