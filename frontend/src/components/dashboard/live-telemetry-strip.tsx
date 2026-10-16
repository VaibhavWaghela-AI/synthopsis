"use client";

import React, { useState, useEffect } from "react";
import { Zap, Users, ShieldCheck, Activity, Radio, Sparkles } from "lucide-react";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  status: string;
}

const COLLABORATORS: Collaborator[] = [
  { id: "c1", name: "Priya M.", role: "Support Lead", avatar: "PM", color: "#087a38", status: "Triage / WhatsApp" },
  { id: "c2", name: "Rahul K.", role: "Sales Ops", avatar: "RK", color: "#0369a1", status: "Reviewing RFPs" },
  { id: "c3", name: "Synthopsis Sentinel", role: "AI Autopilot", avatar: "SY", color: "#ff2a3b", status: "Active (184 tok/s)" }
];

export function LiveTelemetryStrip() {
  const [tokensPerSec, setTokensPerSec] = useState(184.2);
  const [latencyMs, setLatencyMs] = useState(180);
  const [packetCount, setPacketCount] = useState(12847);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokensPerSec(Number((180 + Math.random() * 9).toFixed(1)));
      setLatencyMs(Math.floor(175 + Math.random() * 12));
      setPacketCount((prev) => prev + (Math.random() > 0.6 ? 1 : 0));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-[#121316] bg-[#f8f8fa] text-[#121316] text-[10px] font-mono px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none overflow-hidden">
      {/* Left: Real-Time Kinetic Stream Marquee */}
      <div className="flex items-center gap-3 overflow-hidden max-w-xl">
        <div className="flex items-center gap-1.5 font-black text-[#ff2a3b] shrink-0">
          <span className="h-1.5 w-1.5 bg-[#ff2a3b] rounded-full animate-ping" />
          <span>REALTIME_STREAM:</span>
        </div>

        <div className="truncate text-zinc-600 space-x-3">
          <span>
            <strong className="text-[#121316]">LPU SPEED:</strong> {tokensPerSec} tok/s
          </span>
          <span className="text-zinc-300">/</span>
          <span>
            <strong className="text-[#121316]">LATENCY:</strong> {latencyMs}ms
          </span>
          <span className="text-zinc-300">/</span>
          <span>
            <strong className="text-[#121316]">TOTAL SESSIONS:</strong> {packetCount.toLocaleString()}
          </span>
          <span className="text-zinc-300">/</span>
          <span className="text-[#087a38] font-bold inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 inline text-[#087a38]" /> DPDP SECURE MESH
          </span>
        </div>
      </div>

      {/* Right: Collaborative Presence Avatars with Microinteractions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1 text-zinc-500 font-bold hidden md:inline-flex">
          <Users className="h-3 w-3" />
          <span>3 OPERATORS ACTIVE:</span>
        </div>

        <div className="flex items-center -space-x-1 relative">
          {COLLABORATORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCollaborator(c)}
              className="relative group cursor-pointer transition-transform hover:-translate-y-0.5 hover:z-20"
              title={`${c.name} (${c.role}): ${c.status}`}
            >
              <div 
                className="w-5 h-5 border border-[#121316] bg-white flex items-center justify-center text-[8px] font-black shadow-[1px_1px_0px_#121316]"
                style={{ color: c.color }}
              >
                {c.avatar}
              </div>
              <span 
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white"
                style={{ backgroundColor: c.color }}
              />

              {/* Collaborative Hover Popover Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#121316] text-white p-1.5 text-[8px] font-mono whitespace-nowrap z-30 shadow-[2px_2px_0px_#ff2a3b] transition-opacity">
                <div className="font-bold text-[#ff2a3b]">{c.name} // {c.role}</div>
                <div className="text-zinc-300 mt-0.5">{c.status}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
