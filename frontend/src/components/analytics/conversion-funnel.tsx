"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { REACTIVATION_DATA } from "@/lib/data/mock-analytics";
import { TrendingUp, CheckCircle } from "lucide-react";

export function ConversionFunnel() {
  return (
    <Card className="border-[#121316] bg-white shadow-[2px_2px_0px_#121316] font-mono">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs">
              Cold Lead Reactivation Curve (0% → 52%)
            </CardTitle>
            <CardDescription className="text-[11px] font-sans">
              UAE Logistics 30-day automated WhatsApp reactivation pipeline
            </CardDescription>
          </div>
          <span className="text-[10px] font-bold text-[#ff2a3b] bg-[#ff2a3b]/10 border border-[#ff2a3b]/30 px-2 py-0.5 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +52% WINBACK
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-1">
          {REACTIVATION_DATA.map((item) => (
            <div
              key={item.day}
              className="p-2.5 border border-[#121316] bg-[#f8f8fa] text-center flex flex-col justify-between hover:border-[#ff2a3b] hover:shadow-[2px_2px_0px_#ff2a3b] transition-all"
            >
              <div className="text-[9px] font-bold text-zinc-500 uppercase">
                {item.day}
              </div>
              <div className="text-lg font-black text-[#121316] my-1">
                {item.reactivationRate}%
              </div>
              <div className="h-1.5 w-full bg-[#e5e5eb] border border-[#121316] overflow-hidden">
                <div
                  style={{ width: `${(item.reactivationRate / 52) * 100}%` }}
                  className="h-full bg-[#ff2a3b]"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-2.5 border border-[#121316] bg-[#f8f8fa] flex items-center justify-between text-[10px] text-zinc-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-[#087a38]" />
            <span>
              <strong>VERIFIED AUDIT:</strong> Over 1,200 dormant accounts reactivated with zero manual sales intervention.
            </span>
          </div>
          <span className="font-bold text-[#ff2a3b] hidden sm:inline">
            ROI MULTIPLIER: 14.2x
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
