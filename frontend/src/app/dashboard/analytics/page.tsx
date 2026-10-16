"use client";

import React from "react";
import { RevenueAndCostChart } from "@/components/analytics/revenue-chart";
import { ConversionFunnel } from "@/components/analytics/conversion-funnel";
import { ChannelPerformance } from "@/components/analytics/channel-performance";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="border border-[#121316] bg-white p-5 shadow-[3px_3px_0px_#121316] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[10px]">
            <span className="px-2 py-0.5 bg-[#ff2a3b] text-white font-bold uppercase">
              ROI INTELLIGENCE // FIELD AUDIT
            </span>
            <span className="text-zinc-500 font-mono">ENTERPRISE CLIENT BENCHMARK DATA</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#121316] tracking-tight uppercase">
            Analytics Command Center
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Audited operational proof quantifying the enterprise value of autonomous AI agents for Indian SMEs.
          </p>
        </div>

        <div className="text-right border-l-2 border-[#ff2a3b] pl-4 hidden sm:block">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Monthly Net Payroll Saved</div>
          <div className="text-2xl font-black text-[#121316]">₹2,15,000 / mo</div>
        </div>
      </div>

      {/* Revenue & Response Time Reduction Charts */}
      <RevenueAndCostChart />

      {/* Cold Lead Reactivation Timeline (UAE Logistics case) */}
      <ConversionFunnel />

      {/* Pipeline Volume & Agent Performance Leaderboard */}
      <ChannelPerformance />
    </div>
  );
}
