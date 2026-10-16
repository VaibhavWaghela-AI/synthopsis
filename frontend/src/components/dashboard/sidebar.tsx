"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  GitFork,
  MessageSquare,
  BarChart3,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAVIGATION_ITEMS = [
  {
    name: "01 // Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: "SYS.CORE"
  },
  {
    name: "02 // Agent Studio",
    href: "/dashboard/agents",
    icon: Bot,
    badge: "4 ACTIVE"
  },
  {
    name: "03 // Workflow DAG",
    href: "/dashboard/workflows",
    icon: GitFork,
    badge: "PIPELINE"
  },
  {
    name: "04 // Omni Inbox",
    href: "/dashboard/inbox",
    icon: MessageSquare,
    badge: "LIVE STREAM"
  },
  {
    name: "05 // ROI Telemetry",
    href: "/dashboard/analytics",
    icon: BarChart3,
    badge: "AUDIT"
  },
  {
    name: "06 // Campaign Hub",
    href: "/dashboard/campaigns",
    icon: Send,
    badge: "OUTBOUND"
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#121316] bg-white flex flex-col justify-between h-screen sticky top-0 font-mono z-30 shadow-[2px_0px_0px_rgba(0,0,0,0.04)]">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#121316] bg-[#f8f8fa] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 bg-[#121316] text-white flex items-center justify-center font-bold text-xs border border-[#121316] shadow-[2px_2px_0px_#ff2a3b]">
              <Zap className="h-4 w-4 text-[#ff2a3b]" />
            </div>
            <div>
              <div className="font-extrabold text-xs tracking-wider text-[#121316]">
                SYNTHOPSIS
              </div>
              <div className="text-[9px] text-zinc-500 font-medium">
                SPEC.2026 // PROD
              </div>
            </div>
          </Link>
          <span className="w-2 h-2 bg-[#ff2a3b] animate-ping" />
        </div>

        {/* Navigation Menu */}
        <div className="p-3 space-y-1.5">
          <div className="px-2 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            // MODULE NAVIGATION
          </div>

          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-xs font-bold transition-all border",
                  isActive
                    ? "bg-[#121316] text-white border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                    : "bg-white text-[#121316] border-transparent hover:border-[#121316] hover:bg-[#f2f2f5]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#ff2a3b]" : "text-zinc-500")} />
                  <span>{item.name}</span>
                </div>

                <span
                  className={cn(
                    "text-[8px] px-1 py-0.5 font-bold uppercase",
                    isActive
                      ? "bg-[#ff2a3b] text-white"
                      : "bg-[#e9e9ed] text-zinc-600"
                  )}
                >
                  {item.badge}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Technical Status & Red Box */}
      <div className="p-3 border-t border-[#121316] bg-[#f8f8fa] space-y-2">
        {/* Red Graphic Stamp Box inspired by synthopsis reference */}
        <div className="bg-[#ff2a3b] text-white p-3 border border-[#121316] shadow-[2px_2px_0px_#121316] relative overflow-hidden">
          <div className="flex justify-between items-center text-[8px] uppercase tracking-wider font-bold mb-1 opacity-90">
            <span>SYS://ACCELERATION</span>
            <span>200MS</span>
          </div>
          <div className="text-xs font-black uppercase tracking-tight">
            GROQ LLAMA 3.3 70B
          </div>
          <div className="mt-1 text-[9px] font-sans opacity-90 leading-tight">
            Deterministic reasoning across 3 omni-pipelines
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 px-1 pt-1">
          <span className="flex items-center gap-1 font-bold text-[#121316]">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            TLS 1.3 SECURE
          </span>
          <Link href="/" className="hover:text-[#ff2a3b] flex items-center gap-0.5">
            ROOT // &gt; <ArrowUpRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
