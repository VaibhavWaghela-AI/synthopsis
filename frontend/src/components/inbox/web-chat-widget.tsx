"use client";

import React, { useState, useRef, useEffect } from "react";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import { Send, Zap, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export function WebChatWidget() {
  const { conversations, sendMessage, isStreaming } = useInboxStore();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const thread = conversations.web;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages]);

  const handleSend = (text?: string) => {
    const textToSend = text || inputText;
    if (!textToSend.trim()) return;
    sendMessage("web", textToSend);
    setInputText("");
  };

  const suggestionPills = [
    "Growth Plan pricing details",
    "JM PlastoPack MOQ specs",
    "Human handoff mechanism"
  ];

  return (
    <div className="flex flex-col h-[560px] max-w-xl mx-auto border-2 border-[#121316] bg-white shadow-[4px_4px_0px_#121316] font-mono">
      {/* Header */}
      <div className="bg-[#121316] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#ff2a3b] text-white flex items-center justify-center font-bold">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Synthopsis Web Assistant</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-white text-[#121316] font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Groq Llama 3.3 70B • 180ms Latency</p>
          </div>
        </div>

        <a
          href="http://127.0.0.1:8000/test-website"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[#121316] text-[10px] font-bold uppercase hover:bg-[#ff2a3b] hover:text-white transition-colors border border-white"
        >
          <span>OPEN REAL CLIENT SITE</span>
          <Sparkles className="h-3 w-3 text-[#ff2a3b]" />
        </a>
      </div>

      {/* Embed Code Banner */}
      <div className="bg-[#f8f8fa] border-b border-[#121316] px-4 py-2 text-[10px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-600">
        <div className="truncate">
          <span className="font-bold text-[#121316]">PRODUCTION SCRIPT TAG: </span>
          <code className="bg-white px-1 py-0.5 border border-[#d6d6de] text-[9px] text-[#121316]">
            &lt;script src="http://127.0.0.1:8000/static/widget.js"&gt;&lt;/script&gt;
          </code>
        </div>
        <a
          href="http://127.0.0.1:8000/test-website"
          target="_blank"
          className="text-[#ff2a3b] font-bold underline hover:text-black whitespace-nowrap"
        >
          Test on JM PlastoPack Live Site ↗
        </a>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f8fa] cyber-grid">
        {thread.messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 text-xs leading-relaxed border ${
                  isUser
                    ? "bg-[#121316] text-white border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                    : "bg-white text-[#121316] border-[#121316] shadow-[2px_2px_0px_#121316]"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#ff2a3b] mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>SYNTHOPSIS AI // {msg.modelUsed === "gemini" ? "GROQ AI REASONER" : "GROQ 70B LPU"}</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap font-sans text-xs">{msg.content}</p>
                <div className="mt-1 text-[8px] text-right opacity-60 font-mono">{msg.timestamp}</div>
              </div>
            </div>
          );
        })}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-zinc-600 bg-white p-2.5 border border-[#121316] w-fit">
            <span className="h-1.5 w-1.5 bg-[#ff2a3b] animate-bounce" />
            <span>Streaming Groq 70B response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Pills */}
      <div className="px-4 py-2 bg-white border-t border-[#e5e5eb] flex items-center gap-1.5 overflow-x-auto">
        {suggestionPills.map((pill, idx) => (
          <button
            key={idx}
            disabled={isStreaming}
            onClick={() => handleSend(pill)}
            className="whitespace-nowrap border border-[#121316] bg-[#f8f8fa] px-2.5 py-1 text-[10px] font-mono text-[#121316] hover:bg-[#121316] hover:text-white transition-colors cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-[#121316] flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything about our AI agents..."
          className="flex-1 border border-[#121316] bg-white px-3 py-2 text-xs font-mono text-[#121316] placeholder:text-zinc-400 focus:outline-none focus:border-[#ff2a3b]"
        />

        <Button
          variant="cyber"
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isStreaming}
          className="gap-1"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
