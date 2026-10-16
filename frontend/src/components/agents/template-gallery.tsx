"use client";

import React, { useState } from "react";
import { AGENT_TEMPLATES, AgentTemplate } from "@/lib/data/templates";
import { useAgentStore } from "@/lib/store/use-agent-store";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Sparkles,
  Zap,
  Building2,
  Factory,
  Pill,
  Truck,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Mail,
  Globe,
  Check
} from "lucide-react";

export function TemplateGallery() {
  const { createFromTemplate } = useAgentStore();
  const [importedId, setImportedId] = useState<string | null>(null);

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "Home":
        return <Building2 className="h-4 w-4 text-[#ff2a3b]" />;
      case "Factory":
        return <Factory className="h-4 w-4 text-[#121316]" />;
      case "Pill":
        return <Pill className="h-4 w-4 text-[#ff2a3b]" />;
      case "Truck":
        return <Truck className="h-4 w-4 text-[#121316]" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#ff2a3b]" />;
    }
  };

  const handleUseTemplate = (tmpl: AgentTemplate) => {
    createFromTemplate(tmpl);
    setImportedId(tmpl.id);
    setTimeout(() => setImportedId(null), 1800);
  };

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-[#121316] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#ff2a3b]">02 // BLUEPRINTS</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#121316]">
            Sector-Trained Deployment Templates
          </h2>
        </div>
        <span className="text-[10px] text-zinc-500 hidden sm:inline">
          FIELD AUDITED // CLIENT BENCHMARK METRICS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENT_TEMPLATES.map((tmpl) => {
          const isJustImported = importedId === tmpl.id;

          return (
            <Card
              key={tmpl.id}
              className="p-4 border-[#121316] bg-white shadow-[2px_2px_0px_#121316] hover:shadow-[3px_3px_0px_#ff2a3b] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e5e5eb]">
                  <div className="p-1.5 border border-[#121316] bg-[#f8f8fa]">
                    {getTemplateIcon(tmpl.icon)}
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#121316] text-white uppercase">
                    {tmpl.channel}
                  </span>
                </div>

                <div className="text-[9px] font-bold text-zinc-400 uppercase">
                  // {tmpl.category}
                </div>
                <h3 className="text-xs font-bold uppercase text-[#121316] mt-0.5">
                  {tmpl.name}
                </h3>

                <p className="text-[11px] text-zinc-600 font-sans mt-2 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Proven Impact Box */}
                <div className="mt-3 p-2 bg-[#f8f8fa] border border-[#121316] text-[10px]">
                  <div className="flex items-center gap-1 font-bold text-[#ff2a3b]">
                    <TrendingUp className="h-3 w-3" />
                    <span>{tmpl.impactMetric}</span>
                  </div>
                  <div className="text-[8px] text-zinc-500 mt-0.5 truncate">{tmpl.basedOn}</div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#e5e5eb] flex items-center justify-between">
                <span className="text-[9px] text-zinc-500 font-bold">GROQ 70B LPU</span>

                <Button
                  size="sm"
                  variant={isJustImported ? "secondary" : "outline"}
                  onClick={() => handleUseTemplate(tmpl)}
                  className="text-[9px] h-6 px-2"
                >
                  {isJustImported ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span>IMPORTED</span>
                    </span>
                  ) : (
                    "+ USE TEMPLATE"
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
