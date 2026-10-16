"use client";

import React, { useEffect, useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";

export default function Loading() {
  const [progress, setProgress] = useState(12);
  const [clock, setClock] = useState("0.012");
  const [hexCode, setHexCode] = useState("0x7F_INIT");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + Math.floor(Math.random() * 14) + 4;
      });
      setClock((Math.random() * 0.08 + 0.01).toFixed(3));
      setHexCode("0x" + Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase());
    }, 120);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f2f2f5] text-[#121316] font-mono cyber-grid selection:bg-[#ff2a3b] selection:text-white overflow-hidden">
      {/* Corner Telemetry Registrations */}
      <div className="absolute top-6 left-6 text-[10px] text-zinc-500 font-bold">
        SYNTHOPSIS // SYS_INIT
      </div>
      <div className="absolute top-6 right-6 text-[10px] text-[#ff2a3b] font-bold flex items-center gap-1.5">
        <span className="h-2 w-2 bg-[#ff2a3b] animate-ping" />
        LPU CORE: 200MS
      </div>
      <div className="absolute bottom-6 left-6 text-[10px] text-zinc-500">
        LATENCY_TEST: {clock}s // BUFFER: {hexCode}
      </div>
      <div className="absolute bottom-6 right-6 text-[10px] text-zinc-500 font-bold">
        MUMBAI-ZONE-01 // TLS 1.3
      </div>

      {/* Center 3D Isometric Animation Stage */}
      <div className="relative w-80 h-72 flex items-center justify-center mb-6">
        
        {/* Isometric 3D Container */}
        <div 
          className="relative w-48 h-48 flex items-center justify-center"
          style={{
            transform: "rotateX(60deg) rotateZ(-45deg)",
            transformStyle: "preserve-3d"
          }}
        >
          {/* Layer 1: Base Platform with Shadow */}
          <div 
            className="absolute w-44 h-44 border-2 border-[#121316] bg-white/80 shadow-[10px_10px_0px_#121316] cyber-grid-dense flex items-center justify-center"
            style={{
              transform: "translateZ(0px)",
              transition: "transform 0.5s ease"
            }}
          >
            {/* Corner Crosses */}
            <span className="absolute top-1 left-1 text-[9px] font-black text-[#121316]">+</span>
            <span className="absolute top-1 right-1 text-[9px] font-black text-[#121316]">+</span>
            <span className="absolute bottom-1 left-1 text-[9px] font-black text-[#121316]">+</span>
            <span className="absolute bottom-1 right-1 text-[9px] font-black text-[#121316]">+</span>

            {/* Glowing Center Circuit */}
            <div className="w-24 h-24 border border-dashed border-[#121316] flex items-center justify-center animate-spin" style={{ animationDuration: "14s" }}>
              <div className="w-16 h-16 border border-[#ff2a3b] bg-[#ff2a3b]/5" />
            </div>
          </div>

          {/* Layer 2: Mid-tier Neural Wafer with Elevation */}
          <div 
            className="absolute w-32 h-32 border-2 border-[#121316] bg-[#f8f8fa] shadow-[6px_6px_0px_rgba(0,0,0,0.2)] flex items-center justify-center animate-pulse"
            style={{
              transform: "translateZ(30px)",
              animationDuration: "2s"
            }}
          >
            <div className="text-[8px] font-black text-zinc-400 tracking-widest uppercase">
              // GROQ 70B //
            </div>
          </div>

          {/* Layer 3: Floating Isometric Red Technical Cube */}
          <div 
            className="absolute w-20 h-20 bg-[#ff2a3b] border-2 border-[#121316] shadow-[8px_8px_0px_#121316] flex flex-col items-center justify-center text-white"
            style={{
              animation: "isometricFloat 2.4s ease-in-out infinite alternate"
            }}
          >
            <Zap className="h-6 w-6 text-white animate-bounce" style={{ animationDuration: "1.2s" }} />
            <span className="text-[7px] font-black tracking-widest mt-1">SYNTHOPSIS</span>
          </div>

          {/* Floating Isometric Data Satellites */}
          <div 
            className="absolute -top-4 -right-4 px-2 py-0.5 bg-[#121316] text-white border border-[#121316] text-[7px] font-bold"
            style={{ transform: "translateZ(45px)" }}
          >
            WA_PIPE
          </div>

          <div 
            className="absolute -bottom-4 -left-4 px-2 py-0.5 bg-white text-[#121316] border border-[#121316] text-[7px] font-bold shadow-[2px_2px_0px_#ff2a3b]"
            style={{ transform: "translateZ(55px)" }}
          >
            RAG_DOCS
          </div>
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="w-80 border-2 border-[#121316] bg-white p-4 shadow-[4px_4px_0px_#121316] space-y-3">
        <div className="flex items-center justify-between text-xs font-bold border-b border-[#e5e5eb] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#ff2a3b] animate-ping inline-block" />
            <span className="tracking-wider uppercase">INITIALIZING ENGINE</span>
          </div>
          <span className="text-[#ff2a3b] font-black">{progress}%</span>
        </div>

        {/* Progress Track */}
        <div className="h-2 w-full border border-[#121316] bg-[#f8f8fa] overflow-hidden p-0.5">
          <div 
            className="h-full bg-[#ff2a3b] transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1">
          <span className="truncate max-w-[200px]">
            STREAM: {hexCode} // SYNC_DAG
          </span>
          <span className="font-bold text-[#121316]">
            200MS LPU
          </span>
        </div>
      </div>

      {/* Global Animation Keyframes */}
      <style jsx global>{`
        @keyframes isometricFloat {
          0% {
            transform: translateZ(55px) translateY(0px);
          }
          100% {
            transform: translateZ(85px) translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
