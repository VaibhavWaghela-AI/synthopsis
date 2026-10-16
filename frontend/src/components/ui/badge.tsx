import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "cyber" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#121316] text-white border-[#121316]",
    cyber: "bg-[#ff2a3b] text-white border-[#121316]",
    secondary: "bg-[#e9e9ed] text-[#121316] border-[#121316]",
    outline: "bg-white text-[#121316] border-[#121316]",
    success: "bg-[#e7f7ed] text-[#087a38] border-[#087a38]",
    warning: "bg-[#fff7e6] text-[#b25e00] border-[#b25e00]"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
