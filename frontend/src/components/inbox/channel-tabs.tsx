"use client";

import React from "react";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import { MessageSquare, Mail, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChannelTabs() {
  const { activeChannel, setActiveChannel, conversations } = useInboxStore();

  const channels = [
    {
      id: "whatsapp" as const,
      label: "WHATSAPP BUSINESS",
      icon: MessageSquare,
      unread: conversations.whatsapp.unreadCount
    },
    {
      id: "email" as const,
      label: "ENTERPRISE EMAIL DESK",
      icon: Mail,
      unread: conversations.email.unreadCount
    },
    {
      id: "web" as const,
      label: "WEBSITE LIVE WIDGET",
      icon: Globe,
      unread: conversations.web.unreadCount
    }
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 border border-[#121316] bg-white font-mono shadow-[2px_2px_0px_#121316]">
      {channels.map((ch) => {
        const Icon = ch.icon;
        const isActive = activeChannel === ch.id;

        return (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold transition-all cursor-pointer border",
              isActive
                ? "bg-[#121316] text-white border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                : "border-transparent text-[#121316] hover:bg-[#f2f2f5] hover:border-[#d6d6de]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{ch.label}</span>
            {ch.unread > 0 && (
              <span className="ml-1 px-1 text-[9px] font-bold bg-[#ff2a3b] text-white">
                {ch.unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
