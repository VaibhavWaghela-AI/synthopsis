"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect back to dashboard so reloading never leaves user on a 404 screen
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f2f5] text-[#121316] font-mono cyber-grid p-6 selection:bg-[#ff2a3b] selection:text-white">
      <div className="border-2 border-[#121316] bg-white p-6 shadow-[4px_4px_0px_#121316] text-center max-w-sm space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-black text-[#ff2a3b] uppercase tracking-wider">
          <Loader2 className="h-4 w-4 animate-spin text-[#ff2a3b]" />
          <span>SYNCHRONIZING ROUTE // REDIRECT</span>
        </div>
        <p className="text-xs text-zinc-600 font-sans leading-relaxed">
          Reconnecting to autonomous orchestrator mesh...
        </p>
      </div>
    </div>
  );
}
