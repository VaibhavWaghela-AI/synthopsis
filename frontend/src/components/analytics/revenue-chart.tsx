"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { COST_SAVINGS_DATA, RESPONSE_TIME_DATA } from "@/lib/data/mock-analytics";
import { TrendingDown, Clock } from "lucide-react";

export function RevenueAndCostChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
      {/* Chart 1: Cost Comparison */}
      <Card className="border-[#121316] bg-white shadow-[2px_2px_0px_#121316]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs">
                Monthly Operations Cost (₹ in Thousands)
              </CardTitle>
              <CardDescription className="text-[11px] font-sans">
                Manual Agency Dev (₹2.5L+) vs Synthopsis AI SaaS (₹35k/mo)
              </CardDescription>
            </div>
            <span className="text-[10px] font-bold text-[#ff2a3b] bg-[#ff2a3b]/10 border border-[#ff2a3b]/30 px-2 py-0.5 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> 86% COST DROP
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#121316] bg-[#f8f8fa]">
            {COST_SAVINGS_DATA.map((item) => {
              const maxVal = 300;
              const manualHeight = (item.manualCost / maxVal) * 100;
              const autoHeight = (item.automatedCost / maxVal) * 100;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Manual Bar */}
                    <div
                      style={{ height: `${manualHeight}%` }}
                      className="w-1/2 bg-[#121316] hover:bg-[#333] border border-[#121316] transition-all relative group/bar"
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#121316] text-white text-[9px] px-1 py-0.2 pointer-events-none whitespace-nowrap z-10">
                        ₹{item.manualCost}k
                      </div>
                    </div>
                    {/* Synthopsis AI Automated Bar */}
                    <div
                      style={{ height: `${autoHeight}%` }}
                      className="w-1/2 bg-[#ff2a3b] hover:brightness-110 border border-[#121316] transition-all relative group/bar"
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#ff2a3b] text-white text-[9px] px-1 py-0.2 pointer-events-none whitespace-nowrap z-10">
                        ₹{item.automatedCost}k
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#121316]">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-center gap-6 text-[10px] text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-[#121316] border border-[#121316]"></span>
              <span>Manual Agency Dev</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 bg-[#ff2a3b] border border-[#121316]"></span>
              <span>Synthopsis Automated Pipeline</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Response Time Reduction */}
      <Card className="border-[#121316] bg-white shadow-[2px_2px_0px_#121316]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs">
                Response Time Drop (4h → 8min)
              </CardTitle>
              <CardDescription className="text-[11px] font-sans">
                JM PlastoPack deployment results over 6 weeks
              </CardDescription>
            </div>
            <span className="text-[10px] font-bold text-[#087a38] bg-[#e7f7ed] border border-[#087a38] px-2 py-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" /> 68% FASTER
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2 h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#121316] bg-[#f8f8fa]">
            {RESPONSE_TIME_DATA.map((item) => {
              const maxMinutes = 260;
              const nexusMin = item.nexusMinutes;
              const barHeight = Math.max(10, (nexusMin / maxMinutes) * 100);

              return (
                <div key={item.week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-7 bg-[#121316] hover:bg-[#ff2a3b] border border-[#121316] transition-all relative group/bar"
                    >
                      <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-[#121316] text-white text-[9px] px-1 py-0.2 pointer-events-none whitespace-nowrap z-10">
                        {item.nexusMinutes}m
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#121316]">{item.week}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-600 px-1">
            <span>Baseline: 4.2 Hours</span>
            <span className="font-bold text-[#ff2a3b]">CURRENT: &lt; 8 MINUTES</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
