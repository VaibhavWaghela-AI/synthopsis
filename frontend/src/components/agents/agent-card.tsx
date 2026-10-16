"use client";

import React from "react";
import { ConfiguredAgent, useAgentStore } from "@/lib/store/use-agent-store";
import { Card } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  MessageSquare,
  Mail,
  Globe,
  Settings2,
  Zap,
  Bot,
  Layers,
  Play,
  Pause,
  GitFork,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: ConfiguredAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { toggleAgentStatus, openConfigDialog, setTestingAgent } = useAgentStore();

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return (
          <span className="px-1.5 py-0.5 bg-[#e7f7ed] text-[#087a38] border border-[#087a38] text-[9px] font-bold uppercase flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> WHATSAPP
          </span>
        );
      case "email":
        return (
          <span className="px-1.5 py-0.5 bg-[#f3e8ff] text-[#7e22ce] border border-[#7e22ce] text-[9px] font-bold uppercase flex items-center gap-1">
            <Mail className="h-3 w-3" /> EMAIL
          </span>
        );
      case "both":
        return (
          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-950 border border-amber-500 text-[9px] font-bold uppercase flex items-center gap-1">
            <Zap className="h-3 w-3 text-[#ff2a3b]" /> WA + EMAIL
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 bg-[#e0f2fe] text-[#0369a1] border border-[#0369a1] text-[9px] font-bold uppercase flex items-center gap-1">
            <Globe className="h-3 w-3" /> WEB CHAT
          </span>
        );
    }
  };

  return (
    <Card className="p-5 border-[#121316] bg-white shadow-[2px_2px_0px_#121316] hover:shadow-[3px_3px_0px_#ff2a3b] transition-all flex flex-col justify-between group font-mono">
      <div>
        {/* Header: Category & Status */}
        <div className="flex items-center justify-between gap-2 border-b border-[#e5e5eb] pb-3">
          <div className="flex items-center gap-2">
            {getChannelBadge(agent.channel)}
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              // {agent.category}
            </span>
          </div>

          <button
            onClick={() => toggleAgentStatus(agent.id)}
            className={cn(
              "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-all",
              agent.status === "active"
                ? "bg-[#ff2a3b] text-white border-[#121316] shadow-[1px_1px_0px_#121316]"
                : "bg-[#e9e9ed] text-zinc-600 border-[#d6d6de]"
            )}
          >
            {agent.status === "active" ? (
              <span className="inline-flex items-center gap-1">
                <Play className="h-2 w-2 fill-current" /> RUNNING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Pause className="h-2 w-2 fill-current" /> PAUSED
              </span>
            )}
          </button>
        </div>

        {/* Name & Prompt */}
        <div className="mt-3">
          <h3 className="text-sm font-bold uppercase text-[#121316] group-hover:text-[#ff2a3b] transition-colors">
            {agent.name}
          </h3>
          <p className="mt-1.5 text-xs text-zinc-600 font-sans line-clamp-2 leading-relaxed">
            {agent.systemPrompt}
          </p>
        </div>

        {/* Model and Synced Docs */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 bg-[#f8f8fa] border border-[#121316] text-[9px] font-bold text-[#121316] flex items-center gap-1">
            <Zap className="h-3 w-3 text-[#ff2a3b]" />
            GROQ 70B (200MS)
          </span>

          {agent.knowledgeBaseFiles.length > 0 && (
            <span className="px-2 py-0.5 bg-white border border-[#d6d6de] text-[9px] text-zinc-500 flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {agent.knowledgeBaseFiles.length} DOCS ATTACHED
            </span>
          )}
        </div>

        {/* Contact Endpoints (WhatsApp / Company Email) */}
        {(agent.channel === "whatsapp" || agent.channel === "email" || agent.channel === "both") && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
            {(agent.channel === "whatsapp" || agent.channel === "both") && (
              <span className="px-1.5 py-0.5 bg-[#e7f7ed] text-[#087a38] border border-[#087a38]/40 font-bold flex items-center gap-1">
                <Smartphone className="h-2.5 w-2.5" /> +91 87800 42609
              </span>
            )}
            {(agent.channel === "email" || agent.channel === "both") && (
              <span className="px-1.5 py-0.5 bg-[#f3e8ff] text-[#7e22ce] border border-[#7e22ce]/40 font-bold flex items-center gap-1">
                <Mail className="h-2.5 w-2.5" /> {agent.companyEmail || "vaibhavwaghelaa@gmail.com"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats & Actions */}
      <div className="mt-5 pt-3 border-t border-[#e5e5eb] flex items-center justify-between">
        <div>
          <div className="text-[8px] text-zinc-400 uppercase font-bold">Processed Volume</div>
          <div className="text-xs font-bold text-[#121316]">
            {agent.conversationsHandled.toLocaleString()} SESSIONS
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => setTestingAgent(agent)}
            className="h-7 text-[10px] gap-1 bg-[#121316] text-white hover:bg-[#ff2a3b] transition-colors cursor-pointer"
          >
            <Play className="h-2.5 w-2.5 fill-current" />
            TEST RUNTIME
          </Button>

          <Link href="/dashboard/workflows">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1 border-[#121316] hover:bg-amber-50 cursor-pointer shadow-[1px_1px_0px_#121316]"
              title="Orchestrate this agent in the Visual Workflow DAG"
            >
              <GitFork className="h-2.5 w-2.5 text-amber-700" />
              DAG FLOW
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => openConfigDialog(agent)}
            className="h-7 text-[10px] gap-1 cursor-pointer"
          >
            <Settings2 className="h-3 w-3" />
            CONFIG
          </Button>
        </div>
      </div>
    </Card>
  );
}
