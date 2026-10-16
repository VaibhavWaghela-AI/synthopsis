import React from "react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  description?: string;
  icon: React.ReactNode;
  accentColor?: "blue" | "emerald" | "purple" | "amber";
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  description,
  icon
}: MetricCardProps) {
  return (
    <Card className="p-4 border-[#121316] bg-white shadow-[2px_2px_0px_#121316] font-mono hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#ff2a3b] transition-all relative overflow-hidden group">
      {/* Microinteraction: Laser scanline sweep on hover */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2a3b] to-transparent -translate-y-2 group-hover:translate-y-24 transition-transform duration-700 pointer-events-none opacity-0 group-hover:opacity-100" />

      {/* Microinteraction: Animated Corner Crosshairs */}
      <span className="absolute -top-1 -left-1 text-[8px] font-mono font-bold text-zinc-400 group-hover:text-[#ff2a3b] transition-colors">+</span>
      <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold text-zinc-400 group-hover:text-[#ff2a3b] transition-colors">+</span>
      <span className="absolute -bottom-1 -left-1 text-[8px] font-mono font-bold text-zinc-400 group-hover:text-[#ff2a3b] transition-colors">+</span>
      <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold text-zinc-400 group-hover:text-[#ff2a3b] transition-colors">+</span>

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#e5e5eb] pb-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-[#121316] transition-colors">
          // {title}
        </span>
        <div className="p-1 border border-[#121316] bg-[#f8f8fa] text-[#121316] group-hover:bg-[#ff2a3b] group-hover:text-white group-hover:border-[#ff2a3b] transition-all">
          {icon}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        <div className="text-2xl font-black tracking-tight text-[#121316] font-mono">
          {value}
        </div>

        {(change || description) && (
          <div className="mt-2 flex items-center justify-between text-[10px] pt-2 border-t border-[#e5e5eb]">
            {change && (
              <span
                className={cn(
                  "font-bold px-1 py-0.5",
                  isPositive ? "bg-[#e7f7ed] text-[#087a38] border border-[#087a38]/30" : "bg-[#ffebee] text-[#ff2a3b] border border-[#ff2a3b]/30"
                )}
              >
                {change}
              </span>
            )}
            {description && <span className="text-zinc-500 font-sans">{description}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
