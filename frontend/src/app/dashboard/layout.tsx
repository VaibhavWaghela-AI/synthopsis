import React from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { LiveTelemetryStrip } from "@/components/dashboard/live-telemetry-strip";
import { AgentConfigDialog } from "@/components/agents/agent-config-dialog";
import { AgentTestModal } from "@/components/agents/agent-test-modal";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f2f2f5] text-[#121316] font-mono cyber-grid antialiased">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardTopbar />
        <LiveTelemetryStrip />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <AgentConfigDialog />
      <AgentTestModal />
    </div>
  );
}
