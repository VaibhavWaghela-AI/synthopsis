"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { CHANNEL_VOLUME_DATA, AGENT_PERFORMANCE_TABLE } from "@/lib/data/mock-analytics";
import { MessageSquare, Mail, Globe, Star } from "lucide-react";

export function ChannelPerformance() {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "WhatsApp":
        return <MessageSquare className="h-3 w-3 text-[#087a38]" />;
      case "Email":
        return <Mail className="h-3 w-3 text-[#7e22ce]" />;
      default:
        return <Globe className="h-3 w-3 text-[#0369a1]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
      {/* Volume by Channel (4 Cols) */}
      <Card className="border-[#121316] bg-white shadow-[2px_2px_0px_#121316] lg:col-span-4 flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-xs">Volume by Pipeline</CardTitle>
          <CardDescription className="text-[11px] font-sans">
            12,847 total interactions across connected channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CHANNEL_VOLUME_DATA.map((ch) => (
            <div key={ch.name} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#121316]">{ch.name}</span>
                <span className="font-bold text-[#ff2a3b]">{ch.value}%</span>
              </div>
              <div className="h-2 w-full border border-[#121316] bg-[#f8f8fa] overflow-hidden">
                <div
                  style={{ width: `${ch.value}%` }}
                  className="h-full bg-[#121316] transition-all"
                />
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-[#e5e5eb] text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Primary Driver:</span>
            <span className="text-[#121316] font-bold">WhatsApp Automation (55%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Agent Performance Leaderboard (8 Cols) */}
      <Card className="border-[#121316] bg-white shadow-[2px_2px_0px_#121316] lg:col-span-8">
        <CardHeader>
          <CardTitle className="text-xs">Live Fleet Performance Leaderboard</CardTitle>
          <CardDescription className="text-[11px] font-sans">
            Audited latency, throughput, and customer satisfaction per deployed agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#121316] text-[9px] text-zinc-400 uppercase">
                <tr>
                  <th className="py-2 px-2">Agent Persona</th>
                  <th className="py-2 px-2">Channel</th>
                  <th className="py-2 px-2">Volume</th>
                  <th className="py-2 px-2">Latency</th>
                  <th className="py-2 px-2">CSAT</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-[#e5e5eb]">
                {AGENT_PERFORMANCE_TABLE.map((row) => (
                  <tr key={row.id} className="hover:bg-[#f8f8fa] transition-colors">
                    <td className="py-2.5 px-2 font-bold text-[#121316]">{row.name}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {getChannelIcon(row.channel)}
                        <span>{row.channel}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 font-bold text-[#121316]">
                      {row.conversations.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-[#ff2a3b] font-bold">
                      {row.avgResponseTime}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1 text-[#121316] font-bold">
                        <Star className="h-3 w-3 fill-current text-[#ff2a3b]" />
                        <span>{row.csatScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-1.5 py-0.5 bg-[#e7f7ed] text-[#087a38] border border-[#087a38] text-[9px] font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#087a38] animate-pulse" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
