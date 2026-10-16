"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Bot,
  Clock,
  TrendingUp,
  ArrowRight,
  Zap,
  CheckCircle2,
  GitFork,
  Activity,
  ShieldCheck,
  Radio,
  BookOpen
} from "lucide-react";
import { OVERVIEW_METRICS } from "@/lib/data/mock-analytics";
import { useAgentStore } from "@/lib/store/use-agent-store";
import { DecryptText } from "@/components/common/decrypt-text";
import { ScrollytellingJourney } from "@/components/common/scrollytelling-journey";

interface ActivityFeedItem {
  id: string;
  channel: string;
  text: string;
  time: string;
  status: string;
  model: string;
}

export default function DashboardOverviewPage() {
  const { openConfigDialog } = useAgentStore();
  const [showScrollytelling, setShowScrollytelling] = useState(true);

  const initialFeed: ActivityFeedItem[] = [
    {
      id: "act-1",
      channel: "WhatsApp",
      text: "WhatsApp Agent qualified lead +91 98254 11029 (Rajesh Patel) for 2BHK site visit",
      time: "Just now",
      status: "QUALIFIED",
      model: "Groq 70B"
    },
    {
      id: "act-2",
      channel: "Email",
      text: "Email Copilot sent formal proposal to s.nambiar@apexhealth.in with DPDP security annexure",
      time: "4m ago",
      status: "DISPATCHED",
      model: "Groq AI"
    },
    {
      id: "act-3",
      channel: "Web",
      text: "Web Chat resolved MOQ query for 5,000 plastic containers (JM PlastoPack Bot)",
      time: "11m ago",
      status: "RESOLVED",
      model: "Groq 70B"
    },
    {
      id: "act-4",
      channel: "WhatsApp",
      text: "Logistics Lead Reviver re-engaged dormant inquiry for 2 TEUs container freight",
      time: "19m ago",
      status: "RE-ENGAGED",
      model: "Groq 70B"
    }
  ];

  const [feed, setFeed] = useState(initialFeed);

  // Real-time rendering: periodically synthesize new live telemetry events
  useEffect(() => {
    const liveSnippets = [
      { channel: "WhatsApp", text: "WhatsApp Agent scheduled site visit with Ananya S. (SkyLine 3BHK)", status: "BOOKED", model: "Groq 70B" },
      { channel: "Email", text: "Groq AI Copilot generated SAP reagent PO specification for diagnostic hub", status: "DISPATCHED", model: "Groq AI" },
      { channel: "Web", text: "Live visitor #4102 converted to Enterprise pilot inquiry", status: "QUALIFIED", model: "Groq 70B" },
      { channel: "WhatsApp", text: "Cold freight quote re-activated UAE cargo account #G-881", status: "RE-ENGAGED", model: "Groq 70B" }
    ];

    let counter = 0;
    const interval = setInterval(() => {
      const item = liveSnippets[counter % liveSnippets.length];
      counter++;
      const newEvent = {
        id: `act-live-${Date.now()}`,
        channel: item.channel,
        text: item.text,
        time: "Just now",
        status: item.status,
        model: item.model
      };

      setFeed((prev: ActivityFeedItem[]) => [newEvent, ...prev.slice(0, 4)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const mrrData = [
    { month: "Nov", mrr: "₹45k", height: 25 },
    { month: "Dec", mrr: "₹85k", height: 45 },
    { month: "Jan", mrr: "₹1.4L", height: 68 },
    { month: "Feb", mrr: "₹2.15L", height: 88 },
    { month: "Mar (Proj)", mrr: "₹3.4L", height: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner in Cybercore style */}
      <div className="border border-[#121316] bg-white p-6 shadow-[3px_3px_0px_#121316] relative overflow-hidden">
        {/* Corner Crosshairs */}
        <div className="absolute -top-1 -left-1 text-[#121316] text-xs font-mono font-bold">+</div>
        <div className="absolute -top-1 -right-1 text-[#121316] text-xs font-mono font-bold">+</div>
        <div className="absolute -bottom-1 -left-1 text-[#121316] text-xs font-mono font-bold">+</div>
        <div className="absolute -bottom-1 -right-1 text-[#121316] text-xs font-mono font-bold">+</div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[10px]">
              <span className="px-2 py-0.5 bg-[#ff2a3b] text-white font-bold uppercase">
                CYBERCORE // TELEMETRY
              </span>
              <span className="text-zinc-500 font-mono">SPEC.2026 // FLEET OPERATIONAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#121316] tracking-tight uppercase">
              <DecryptText text="Command Center Overview" speed={25} />
            </h1>
            <p className="text-xs text-zinc-600 mt-1 font-sans max-w-xl">
              Real-time multi-agent orchestration across WhatsApp Business API, Enterprise Email, and Website Live Chat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={showScrollytelling ? "cyber" : "outline"}
              size="sm"
              onClick={() => setShowScrollytelling(!showScrollytelling)}
              className="gap-1.5 text-xs"
            >
              <BookOpen className="h-3.5 w-3.5" />
              {showScrollytelling ? "Hide Scrollytelling" : "Interactive Scrollytelling"}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => openConfigDialog()}
              className="gap-1.5 text-xs font-bold bg-[#121316] text-white hover:bg-[#282a30] border border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
            >
              <Bot className="h-3.5 w-3.5 text-[#ff2a3b]" />
              + CREATE AGENT
            </Button>

            <Link href="/dashboard/inbox">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5 text-[#ff2a3b]" />
                Live Inbox
              </Button>
            </Link>

            <Link href="/dashboard/workflows">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <GitFork className="h-3.5 w-3.5" />
                Pipelines
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Conversations"
          value={OVERVIEW_METRICS.totalConversations}
          change="+24% this week"
          isPositive={true}
          icon={<MessageSquare className="h-4 w-4 text-[#ff2a3b]" />}
        />
        <MetricCard
          title="Active Autonomous Fleet"
          value={OVERVIEW_METRICS.activeAgents}
          description="3 WhatsApp • 2 Web • 2 Email"
          icon={<Bot className="h-4 w-4 text-[#121316]" />}
        />
        <MetricCard
          title="Avg Response Speed"
          value={OVERVIEW_METRICS.avgResponseTime}
          change="-68% vs Manual"
          isPositive={true}
          description="Baseline was 4.2 hours"
          icon={<Clock className="h-4 w-4 text-[#ff2a3b]" />}
        />
        <MetricCard
          title="Lead Conversion Rate"
          value={OVERVIEW_METRICS.conversionRate}
          change="+18% Uplift"
          isPositive={true}
          description="Instant lead qualification"
          icon={<TrendingUp className="h-4 w-4 text-[#121316]" />}
        />
      </div>

      {/* Interactive Scrollytelling Journey Module */}
      {showScrollytelling && <ScrollytellingJourney />}

      {/* Mid Section: MRR Growth Chart & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MRR Chart (7 Cols) */}
        <div className="lg:col-span-7 border border-[#121316] bg-white p-5 shadow-[2px_2px_0px_#121316] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#e5e5eb] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  // REVENUE TELEMETRY
                </span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">
                  Monthly Recurring Revenue (MRR) Trajectory
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#121316] text-white">
                ₹2.15L CURRENT MRR
              </span>
            </div>

            {/* Stark Cybercore Bar Graphic */}
            <div className="h-48 pt-6 pb-2 flex items-end justify-between gap-3 border-b border-[#121316] px-2 bg-[#f8f8fa]">
              {mrrData.map((item, idx) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      style={{ height: `${item.height}%` }}
                      className={`w-full max-w-[40px] border border-[#121316] transition-all relative ${
                        idx === mrrData.length - 1
                          ? "bg-[#ff2a3b] shadow-[2px_2px_0px_#121316]"
                          : "bg-[#121316] hover:bg-[#ff2a3b]"
                      }`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#121316] text-white text-[9px] px-1 py-0.2 pointer-events-none whitespace-nowrap z-10">
                        {item.mrr}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#121316]">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between text-[10px] text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-[#121316]" />
              <span>Manual Agency Retainer</span>
              <span className="h-2.5 w-2.5 bg-[#ff2a3b] ml-2" />
              <span>Synthopsis AI SaaS Margin (85%+)</span>
            </div>

            <Link href="/dashboard/analytics" className="text-[#ff2a3b] hover:underline font-bold flex items-center gap-1">
              FULL ROI AUDIT →
            </Link>
          </div>
        </div>

        {/* Live Bot Stream (5 Cols) */}
        <div className="lg:col-span-5 border border-[#121316] bg-white p-5 shadow-[2px_2px_0px_#121316] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#e5e5eb] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  // REAL-TIME EVENT STREAM
                </span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">
                  Live Autonomous Log
                </h3>
              </div>
              <span className="w-2 h-2 bg-[#ff2a3b] animate-ping" />
            </div>

            <div className="space-y-2.5">
              {feed.map((act: ActivityFeedItem) => (
                <div
                  key={act.id}
                  className="p-3 border border-[#121316] bg-[#f8f8fa] text-xs hover:border-[#ff2a3b] transition-all animate-in fade-in"
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="font-bold px-1.5 py-0.2 bg-[#121316] text-white">
                      {act.channel}
                    </span>
                    <span className="text-zinc-500">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-[#121316] font-sans leading-snug mt-1">
                    {act.text}
                  </p>
                  <div className="mt-2 pt-1 border-t border-[#e5e5eb] flex justify-between items-center text-[9px]">
                    <span className="text-[#ff2a3b] font-bold">{act.status}</span>
                    <span className="text-zinc-500">{act.model}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/dashboard/inbox" className="mt-4 block">
            <Button variant="outline" size="sm" className="w-full text-xs font-bold">
              OPEN TRIAGE INBOX →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
