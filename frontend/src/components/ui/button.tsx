import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "cyber" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]";

    const variants = {
      default:
        "bg-[#121316] text-white border border-[#121316] hover:bg-[#282a30] shadow-[2px_2px_0px_rgba(0,0,0,0.15)]",
      cyber:
        "bg-[#ff2a3b] text-white border border-[#121316] hover:bg-[#e01d2e] shadow-[2px_2px_0px_#121316]",
      outline:
        "border border-[#121316] bg-white text-[#121316] hover:bg-[#121316] hover:text-white shadow-[2px_2px_0px_rgba(0,0,0,0.1)]",
      secondary:
        "bg-[#e9e9ed] text-[#121316] border border-[#d6d6de] hover:bg-[#dedee5]",
      ghost:
        "hover:bg-[#e9e9ed] text-[#121316]",
      destructive:
        "bg-[#ff2a3b] text-white border border-[#121316] hover:bg-black"
    };

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-7 px-3 text-[10px]",
      lg: "h-11 px-6 text-sm",
      icon: "h-9 w-9"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
