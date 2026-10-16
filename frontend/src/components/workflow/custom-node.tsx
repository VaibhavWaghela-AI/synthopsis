"use client";

import React from "react";
import {
  Zap,
  Bot,
  MessageSquare,
  Mail,
  Database,
  Play,
  CheckCircle2,
  FileText,
  Phone,
  Layers,
  ArrowRight,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NodeType = "trigger" | "ai" | "action" | "notification";

export interface PinData {
  id: string;
  name: string;
  type: "exec" | "string" | "number" | "boolean" | "struct";
  connected?: boolean;
}

export interface BlueprintNodeData {
  id: string;
  title: string;
  subtitle: string;
  category: "Event" | "Function" | "Action" | "Flow";
  type: NodeType;
  status: "idle" | "running" | "completed" | "error";
  x: number;
  y: number;
  icon: string;
  inputPins: PinData[];
  outputPins: PinData[];
  config?: Record<string, string>;
}

export function UnrealBlueprintNode({
  node,
  isSelected,
  onClick,
  onMouseDown,
  onPinMouseDown,
  onPinMouseUp,
  onPinClick,
  activeConnectingPinId,
  isConnecting
}: {
  node: BlueprintNodeData;
  isSelected?: boolean;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onPinMouseDown?: (pin: PinData, isOutput: boolean, e: React.MouseEvent) => void;
  onPinMouseUp?: (pin: PinData, isOutput: boolean, e: React.MouseEvent) => void;
  onPinClick?: (pin: PinData, isOutput: boolean, e: React.MouseEvent) => void;
  activeConnectingPinId?: string | null;
  isConnecting?: boolean;
}) {
  // Cybercore High-Contrast Unreal Engine Blueprint Header Themes
  const getHeaderGradient = (type: NodeType) => {
    switch (type) {
      case "trigger":
        // Unreal Event Node: Cybercore Vivid Red
        return "from-[#b91c1c] via-[#ff2a3b] to-[#dc2626] border-b-2 border-[#121316]";
      case "ai":
        // Unreal Function Node: Cybercore Tech Cyan / Blue
        return "from-[#0369a1] via-[#0284c7] to-[#0ea5e9] border-b-2 border-[#121316]";
      case "action":
        // Unreal Action / Exec Node: Deep Dispatch Emerald Green
        return "from-[#166534] via-[#16a34a] to-[#15803d] border-b-2 border-[#121316]";
      case "notification":
        // Unreal Flow / Variable Node: Deep Enterprise Violet
        return "from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] border-b-2 border-[#121316]";
    }
  };

  const getPinColor = (pinType: PinData["type"]) => {
    switch (pinType) {
      case "exec":
        return "#121316"; // Stark black execution arrow on light theme
      case "string":
        return "#0284c7"; // Cyan for String
      case "number":
        return "#16a34a"; // Green for Float / Number
      case "boolean":
        return "#dc2626"; // Red for Boolean
      case "struct":
        return "#7c3aed"; // Purple for Struct / Object
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`
      }}
      className={cn(
        "absolute w-72 rounded-lg bg-white border-2 border-[#121316] text-[#121316] select-none transition-shadow duration-100 cursor-grab active:cursor-grabbing font-mono",
        isSelected
          ? "ring-2 ring-[#ff2a3b] shadow-[5px_5px_0px_#ff2a3b] z-20"
          : "shadow-[4px_4px_0px_#121316] hover:shadow-[6px_6px_0px_#121316] z-10",
        node.status === "running" && "ring-2 ring-[#ff2a3b] shadow-[0_0_25px_rgba(255,42,59,0.5)] animate-pulse"
      )}
    >
      {/* ================= 1. UNREAL BLUEPRINT HEADER (CYBERCORE MATCH) ================= */}
      <div
        className={cn(
          "px-3 py-2 rounded-t-[6px] bg-gradient-to-r flex items-center justify-between relative overflow-hidden",
          getHeaderGradient(node.type)
        )}
      >
        {/* Subtle Diagonal Gloss Line like Unreal Engine headers */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 relative z-10">
          {/* Header Diamond / Glyph */}
          <div className="w-5 h-5 rounded-xs bg-black/30 border border-white/40 flex items-center justify-center text-white shadow-xs">
            {node.type === "trigger" && <Zap className="h-3 w-3 fill-current text-white" />}
            {node.type === "ai" && <Bot className="h-3 w-3 text-white" />}
            {node.type === "action" && <MessageSquare className="h-3 w-3 text-white" />}
            {node.type === "notification" && <Database className="h-3 w-3 text-white" />}
          </div>

          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/80 font-black leading-none">
              {node.category}
            </div>
            <h4 className="text-xs font-black tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] mt-0.5">
              {node.title}
            </h4>
          </div>
        </div>

        {/* Execution Status Badge */}
        <div className="relative z-10">
          {node.status === "completed" && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white text-[#121316] border border-[#121316] shadow-[1px_1px_0px_#121316] flex items-center gap-1">
              <Check className="h-2.5 w-2.5 text-emerald-600" />
              <span>OK</span>
            </span>
          )}
          {node.status === "running" && (
            <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded bg-[#facc15] text-[#121316] border border-[#121316] shadow-[1px_1px_0px_#121316]">
              <span className="h-1.5 w-1.5 bg-[#121316] rounded-full animate-ping" />
              EXEC
            </span>
          )}
          {node.status === "idle" && (
            <span className="text-[8px] text-white/90 font-mono font-bold bg-black/20 px-1.5 py-0.5 rounded">
              IDLE
            </span>
          )}
        </div>
      </div>

      {/* Target Class Indicator */}
      <div className="px-3 py-1 bg-[#f4f4f6] border-b-2 border-[#121316] flex items-center justify-between text-[9px] text-zinc-600 font-bold">
        <span>Target is {node.subtitle}</span>
        <span className="font-mono text-[8px] text-[#ff2a3b] font-black">0x{node.id.slice(-4).toUpperCase()}</span>
      </div>

      {/* ================= 2. PINS SECTION (INPUTS & OUTPUTS) ================= */}
      <div className="p-3 grid grid-cols-2 gap-3 text-xs bg-white rounded-b-[6px]">
        {/* Left: Input Pins */}
        <div className="space-y-2">
          {node.inputPins.map((pin) => {
            const isExec = pin.type === "exec";
            const pinColor = getPinColor(pin.type);
            const isActive = activeConnectingPinId === pin.id;

            return (
              <div
                key={pin.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onPinMouseDown?.(pin, false, e);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  onPinMouseUp?.(pin, false, e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick?.(pin, false, e);
                }}
                className={cn(
                  "flex items-center gap-2 group cursor-crosshair px-1 py-0.5 rounded transition-all select-none",
                  isActive ? "bg-[#ff2a3b]/15 ring-2 ring-[#ff2a3b] animate-pulse" : "hover:bg-zinc-100",
                  isConnecting ? "hover:ring-2 hover:ring-[#ff2a3b] hover:bg-[#ff2a3b]/10" : ""
                )}
                title={`Input Pin: ${pin.name} (${pin.type}) - Click/drop to connect`}
              >
                {/* Pin Shape */}
                {isExec ? (
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 transition-transform group-hover:scale-125 shrink-0",
                      node.status === "running" ? "text-[#ff2a3b] animate-ping" : "text-[#121316]",
                      isActive ? "text-[#ff2a3b] scale-125" : ""
                    )}
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M2 2 L7.5 2 L10.5 6 L7.5 10 L2 10 Z" />
                  </svg>
                ) : (
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full border border-[#121316] shadow-xs transition-transform group-hover:scale-125 shrink-0",
                      isActive ? "ring-2 ring-[#ff2a3b] scale-125" : ""
                    )}
                    style={{ backgroundColor: pinColor }}
                  />
                )}

                <span
                  className={cn(
                    "text-[10px] truncate transition-colors",
                    isExec ? "font-black text-[#121316] uppercase tracking-wider" : "text-zinc-700 font-semibold",
                    isActive ? "text-[#ff2a3b] font-bold" : ""
                  )}
                >
                  {pin.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Output Pins */}
        <div className="space-y-2 text-right flex flex-col items-end">
          {node.outputPins.map((pin) => {
            const isExec = pin.type === "exec";
            const pinColor = getPinColor(pin.type);
            const isActive = activeConnectingPinId === pin.id;

            return (
              <div
                key={pin.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onPinMouseDown?.(pin, true, e);
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  onPinMouseUp?.(pin, true, e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick?.(pin, true, e);
                }}
                className={cn(
                  "flex items-center justify-end gap-2 group w-full cursor-crosshair px-1 py-0.5 rounded transition-all select-none",
                  isActive ? "bg-[#ff2a3b]/15 ring-2 ring-[#ff2a3b] animate-pulse" : "hover:bg-zinc-100",
                  isConnecting ? "hover:ring-2 hover:ring-[#ff2a3b] hover:bg-[#ff2a3b]/10" : ""
                )}
                title={`Output Pin: ${pin.name} (${pin.type}) - Drag/click to connect`}
              >
                <span
                  className={cn(
                    "text-[10px] truncate transition-colors",
                    isExec ? "font-black text-[#121316] uppercase tracking-wider" : "text-zinc-700 font-semibold",
                    isActive ? "text-[#ff2a3b] font-bold" : ""
                  )}
                >
                  {pin.name}
                </span>

                {/* Pin Shape */}
                {isExec ? (
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 transition-transform group-hover:scale-125 shrink-0",
                      node.status === "running" ? "text-[#ff2a3b] animate-ping" : "text-[#121316]",
                      isActive ? "text-[#ff2a3b] scale-125" : ""
                    )}
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M2 2 L7.5 2 L10.5 6 L7.5 10 L2 10 Z" />
                  </svg>
                ) : (
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full border border-[#121316] shadow-xs transition-transform group-hover:scale-125 shrink-0",
                      isActive ? "ring-2 ring-[#ff2a3b] scale-125" : ""
                    )}
                    style={{ backgroundColor: pinColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
