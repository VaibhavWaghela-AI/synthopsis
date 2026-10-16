"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Zap, Bot, ShieldCheck, Terminal, Layers } from "lucide-react";
import { Badge } from "../ui/badge";
import { DecryptText } from "../common/decrypt-text";

export function DashboardTopbar() {
  const pathname = usePathname();

  const getPageInfo = () => {
    switch (pathname) {
      case "/dashboard":
        return { tag: "SYS://OVERVIEW", title: "COMMAND CENTER TELEMETRY" };
      case "/dashboard/agents":
        return { tag: "FLEET://AGENTS", title: "AUTONOMOUS AGENT STUDIO" };
      case "/dashboard/workflows":
        return { tag: "PIPELINE://DAG", title: "DIRECTED ACYCLIC WORKFLOW ENGINE" };
      case "/dashboard/inbox":
        return { tag: "TRIAGE://INBOX", title: "OMNICHANNEL REAL-TIME SIMULATOR" };
      case "/dashboard/analytics":
        return { tag: "AUDIT://ROI", title: "FINANCIAL YIELD & PERFORMANCE TELEMETRY" };
      default:
        return { tag: "SYNTHOPSIS://CORE", title: "CORE OPERATIONS" };
    }
  };

  const { tag, title } = getPageInfo();

  return (
    <header className="h-14 border-b border-[#121316] bg-white px-6 flex items-center justify-between sticky top-0 z-20 font-mono shadow-[0px_2px_0px_rgba(0,0,0,0.02)]">
      {/* Left: Breadcrumb / Path tag with DecryptText animation */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-[#ff2a3b] bg-[#ff2a3b]/10 border border-[#ff2a3b]/30 px-2 py-0.5">
          <DecryptText text={tag} key={tag} speed={25} />
        </span>
        <h1 className="text-xs font-bold text-[#121316] tracking-wider uppercase hidden sm:inline">
          <DecryptText text={title} key={title} speed={20} />
        </h1>
      </div>

      {/* Right: Technical Badges */}
      <div className="flex items-center gap-2 text-[10px]">
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-0.5">
            <span className="h-1.5 w-1.5 bg-[#ff2a3b] inline-block animate-pulse" />
            WA_API: 200 OK
          </Badge>
          <Badge variant="secondary" className="gap-1 py-0.5 font-bold">
            <Zap className="h-3 w-3 text-[#ff2a3b]" />
            GROQ LPU: 180MS
          </Badge>
          <Badge variant="outline" className="gap-1 py-0.5">
            MUMBAI-CORE
          </Badge>
        </div>

        <div className="h-4 w-px bg-zinc-300 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 pl-1">
          <span className="px-2 py-1 bg-[#121316] text-white text-[10px] font-bold border border-[#121316]">
            ADMIN_CONSOLE
          </span>
        </div>
      </div>
    </header>
  );
}
