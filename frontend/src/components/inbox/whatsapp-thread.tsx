"use client";

import React, { useState, useRef, useEffect } from "react";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import {
  Send,
  CheckCheck,
  Zap,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Lock,
  QrCode,
  ExternalLink,
  X,
  Smartphone
} from "lucide-react";
import { Button } from "../ui/button";

function renderWhatsAppText(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={index} className="font-bold text-[#121316]">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return part;
  });
}

export function WhatsAppThread() {
  const { conversations, sendMessage, isStreaming } = useInboxStore();
  const [inputText, setInputText] = useState("");
  const [waStatus, setWaStatus] = useState<{ status: string; qrDataUrl: string | null; phone: any } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const thread = conversations.whatsapp;

  // Real WhatsApp Chat Synchronization from SQLite Database
  const [realMessages, setRealMessages] = useState<any[] | null>(null);
  const [realChatTitle, setRealChatTitle] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchRealChat = async () => {
      try {
        const convRes = await fetch("/api/inbox/conversations?channel=whatsapp");
        if (!convRes.ok) return;
        const convData = await convRes.json();
        const latestConv = convData.data?.[0];
        if (!latestConv) return;

        if (!isCancelled) {
          setRealChatTitle(latestConv.title || latestConv.sender);
        }

        const msgRes = await fetch(`/api/inbox/conversations/${latestConv.id}/messages`);
        if (!msgRes.ok) return;
        const msgData = await msgRes.json();
        if (msgData.data && Array.isArray(msgData.data) && !isCancelled) {
          setRealMessages(msgData.data);
        }
      } catch {}
    };

    fetchRealChat();
    const interval = setInterval(fetchRealChat, 2500);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const displayMessages = realMessages && realMessages.length > 0 
    ? realMessages.map((m: any) => ({
        id: m.id,
        sender: m.sender_role,
        content: m.content,
        timestamp: m.timestamp || "Just now",
        channel: "whatsapp" as const,
        modelUsed: m.model_used || "groq",
        status: m.status || "delivered"
      }))
    : thread.messages;

  const displayTitle = realChatTitle || thread.title;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages]);

  // Poll WhatsApp status for real phone pairing
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/whatsapp/status");
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data);
        }
      } catch {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage("whatsapp", inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[560px] border-2 border-[#121316] bg-white overflow-hidden shadow-[4px_4px_0px_#121316] font-mono relative">
      {/* WhatsApp Header in Cybercore style */}
      <div className="bg-[#f8f8fa] px-4 py-3 flex items-center justify-between border-b border-[#121316]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#121316] text-white flex items-center justify-center font-bold text-xs border border-[#121316] shadow-[2px_2px_0px_#087a38]">
            RP
          </div>
          <div>
            <div className="text-xs font-bold text-[#121316] flex items-center gap-2">
              <span>{displayTitle}</span>
              <span className={`text-[9px] px-1.5 py-0.2 font-bold uppercase border ${
                waStatus?.status === "ready" 
                  ? "bg-[#e7f7ed] text-[#087a38] border-[#087a38]" 
                  : "bg-amber-50 text-amber-700 border-amber-500"
              }`}>
                {waStatus?.status === "ready" ? "REAL_PHONE_CONNECTED" : "WA_GATEWAY_STANDBY"}
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${waStatus?.status === "ready" ? "bg-[#087a38] animate-pulse" : "bg-amber-500"}`} />
              <span>
                {waStatus?.status === "ready" 
                  ? `Phone: ${waStatus.phone?.pushname || waStatus.phone?.wid} // Groq 70B Active`
                  : "Autonomous Simulation / Real WhatsApp Ready"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#121316]">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 bg-white border border-[#121316] font-bold shadow-[2px_2px_0px_#121316] hover:bg-[#087a38] hover:text-white transition-all cursor-pointer"
          >
            <QrCode className="h-3 w-3" />
            <span>{waStatus?.status === "ready" ? "PHONE LINKED" : "LINK ACTUAL WHATSAPP"}</span>
          </button>
          <span className="text-[9px] px-2 py-0.5 bg-white border border-[#121316] font-bold">
            LATENCY: 180MS
          </span>
        </div>
      </div>

      {/* Real WhatsApp QR Connection Modal */}
      {showQrModal && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] w-full max-w-md p-5 text-[#121316]">
            <div className="flex items-center justify-between border-b border-[#121316] pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Smartphone className="h-4 w-4 text-[#087a38]" />
                <span className="uppercase tracking-wider">Connect Actual Phone WhatsApp</span>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1 hover:bg-zinc-100 border border-transparent hover:border-[#121316] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {waStatus?.status === "ready" ? (
              <div className="text-center py-4 space-y-3">
                <div className="h-12 w-12 bg-[#e7f7ed] text-[#087a38] border-2 border-[#087a38] rounded-full mx-auto flex items-center justify-center font-bold text-xl shadow-[3px_3px_0px_#087a38]">
                  ✓
                </div>
                <h4 className="font-bold text-sm">Real WhatsApp Device Connected!</h4>
                <p className="text-xs text-zinc-600">
                  Account: <strong>{waStatus.phone?.pushname}</strong> ({waStatus.phone?.wid})
                </p>
                <p className="text-[11px] bg-[#f8f8fa] p-2.5 border border-[#121316] text-zinc-600">
                  Any customer sending messages to this WhatsApp number will automatically receive AI responses from Synthopsis!
                </p>
              </div>
            ) : waStatus?.qrDataUrl ? (
              <div className="text-center space-y-3">
                <div className="text-[11px] text-zinc-600 bg-[#f8f8fa] p-2 border border-[#121316] text-left space-y-1">
                  <div>1. Open <strong>WhatsApp</strong> on your phone</div>
                  <div>2. Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong></div>
                  <div>3. Tap <strong>Link a Device</strong> and point your camera at this QR code:</div>
                </div>

                <div className="inline-block p-2 bg-white border-2 border-[#121316] shadow-[4px_4px_0px_#121316]">
                  <img src={waStatus.qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52 mx-auto" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-200">
                  <span>Status: <strong className="text-amber-600 uppercase">{waStatus.status}</strong></span>
                  <a 
                    href="http://localhost:3006/qr" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 font-bold text-[#087a38] hover:underline"
                  >
                    Open Standalone QR <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-300 p-3">
                  WhatsApp Service Offline on Port 3006
                </div>
                <p className="text-[11px] text-zinc-600 text-left">
                  To launch the real WhatsApp connection bridge, open a terminal and run:
                </p>
                <pre className="bg-[#121316] text-[#00ff66] p-2.5 text-[11px] text-left overflow-x-auto">
cd whatsapp-service{"\n"}npm start
                </pre>
                <p className="text-[10px] text-zinc-500 text-left">
                  This launches the local browser pairing engine and displays your live phone QR code!
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#121316] flex justify-end">
              <Button 
                size="sm" 
                onClick={() => setShowQrModal(false)}
                className="text-[10px] font-bold uppercase border border-[#121316]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f8fa] cyber-grid">
        {/* Technical Encryption Notice */}
        <div className="flex justify-center my-1">
          <div className="bg-white border border-[#121316] px-3 py-1 text-[9px] text-zinc-600 shadow-[1px_1px_0px_#121316] flex items-center gap-1.5 font-bold">
            <Lock className="h-3 w-3 text-emerald-600" />
            <span>END-TO-END ENCRYPTED // GATEWAY: SYNTHOPSIS-MUMBAI-01</span>
          </div>
        </div>

        {displayMessages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] p-3.5 text-xs leading-relaxed border ${
                  isUser
                    ? "bg-[#e7f7ed] text-[#121316] border-[#087a38] shadow-[2px_2px_0px_#087a38]"
                    : "bg-white text-[#121316] border-[#121316] shadow-[2px_2px_0px_#121316]"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-[#e5e5eb] text-[9px] font-bold text-[#121316]">
                    <Zap className="h-3 w-3 text-[#ff2a3b]" />
                    <span>SYNTHOPSIS AI REASONER</span>
                    <span className={msg.modelUsed === "gemini" ? "text-cyan-700 font-bold flex items-center gap-1" : "text-zinc-600 font-bold flex items-center gap-1"}>
                      // <Zap className="h-2.5 w-2.5 text-[#ff2a3b]" /> {msg.modelUsed === "gemini" ? "GROQ AI DEEP" : "GROQ LLAMA 3.3"}
                    </span>
                  </div>
                )}

                <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {renderWhatsAppText(msg.content)}
                </p>

                <div className="flex items-center justify-end gap-1 mt-2 text-[9px] text-zinc-500">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="h-3 w-3 text-[#087a38]" />}
                </div>
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 italic bg-white p-2 border border-[#121316] w-fit">
            <span className="h-1.5 w-1.5 bg-[#ff2a3b] animate-bounce" />
            <span>Groq 70B generating streaming response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white p-3 flex items-center gap-2 border-t border-[#121316]">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type simulated WhatsApp query (e.g. site visit, MOQ, price)..."
          className="flex-1 border border-[#121316] bg-white px-3 py-2 text-xs font-mono text-[#121316] placeholder:text-zinc-400 focus:outline-none focus:border-[#ff2a3b]"
        />

        <Button
          variant="cyber"
          onClick={handleSend}
          disabled={!inputText.trim() || isStreaming}
          className="gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          SEND
        </Button>
      </div>
    </div>
  );
}
