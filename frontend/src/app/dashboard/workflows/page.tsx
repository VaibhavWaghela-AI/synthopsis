"use client";

import React from "react";
import dynamic from "next/dynamic";

const WorkflowBuilder = dynamic(
  () => import("@/components/workflow/workflow-builder").then((mod) => mod.WorkflowBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="h-[650px] w-full border border-[#121316] bg-white flex items-center justify-center font-mono text-xs text-zinc-500">
        INITIALIZING GRAPH ENGINE // LOADING WORKFLOW PIPELINE...
      </div>
    )
  }
);

export default function WorkflowsPage() {
  return (
    <div className="space-y-6">
      <WorkflowBuilder />
    </div>
  );
}
