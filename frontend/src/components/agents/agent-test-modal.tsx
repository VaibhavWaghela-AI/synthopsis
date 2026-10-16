"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAgentStore } from "@/lib/store/use-agent-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  X,
  Zap,
  Play,
  Pause,
  Send,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  MessageSquare,
  Mail,
  Globe,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface TestMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  latencyMs?: number;
}

export function AgentTestModal() {
  const { testingAgent, setTestingAgent, toggleAgentStatus } = useAgentStore();

  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [measuredLatency, setMeasuredLatency] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize test conversation when agent opens
  useEffect(() => {
    if (testingAgent) {
      setMessages([
        {
          id: "sys-init",
          role: "assistant",
          content: `⚡ Runtime initialized for ${testingAgent.name}.\nChannel: ${testingAgent.channel.toUpperCase()} | Engine: ${testingAgent.model.toUpperCase()} | Status: ${testingAgent.status.toUpperCase()}.\n\nReady for interactive testing. Send a query or click a pre-built test chip below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setInput("");
      setIsStreaming(false);
      setMeasuredLatency(null);
    }
  }, [testingAgent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (!testingAgent) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    const userMsg: TestMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    const startTime = performance.now();
    let firstTokenReceived = false;

    const assistantMsgId = `ast-${Date.now()}`;
    const initialAssistantMsg: TestMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    // Assemble RAG document grounding from attached documents
    let documentContext = "";
    if (testingAgent.attachedDocs && testingAgent.attachedDocs.length > 0) {
      const docTexts = testingAgent.attachedDocs
        .filter((d) => d.content)
        .map((d) => `[DOCUMENT: ${d.name}]\n${d.content}`);
      if (docTexts.length > 0) {
        documentContext = `\n\n--- ATTACHED SPEC DOCUMENTS (RAG KNOWLEDGE BASE) ---\n${docTexts.join("\n\n")}`;
      }
    }

    const fullInstruction = testingAgent.systemPrompt + documentContext;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.role !== "system"), userMsg].map((m) => ({
            role: m.role,
            content: m.content
          })),
          model: testingAgent.model,
          channel: testingAgent.channel,
          vertical: testingAgent.category.toLowerCase().includes("manufact")
            ? "manufacturing"
            : testingAgent.category.toLowerCase().includes("logit")
            ? "logistics"
            : testingAgent.category.toLowerCase().includes("estate")
            ? "real_estate"
            : "general",
          custom_instruction: fullInstruction,
          temperature: testingAgent.temperature
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!firstTokenReceived) {
          firstTokenReceived = true;
          const latency = Math.round(performance.now() - startTime);
          setMeasuredLatency(latency);
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: `[Runtime Notice] Error connecting to inference stream: ${err?.message}` }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "sys-init",
        role: "assistant",
        content: `⚡ Runtime reset for ${testingAgent.name}. Ready for a fresh test turn.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setMeasuredLatency(null);
  };

  const getQuickChips = () => {
    const cat = testingAgent.category.toLowerCase();
    if (cat.includes("manufact")) {
      return [
        "What is the MOQ for 5,000 units?",
        "Do you provide HDPE or Food-Grade PP?",
        "Can you dispatch an official proforma quote?"
      ];
    }
    if (cat.includes("logist")) {
      return [
        "What are current ocean spot rates to Mundra?",
        "How many free demurrage days at Jebel Ali?",
        "Can I track my container via WhatsApp?"
      ];
    }
    if (cat.includes("estate")) {
      return [
        "What 3BHK units are available in GIFT City?",
        "Can I book a site visit for Saturday at 4 PM?",
        "Send the floor plans and RERA approval PDF."
      ];
    }
    if (cat.includes("gaming") || cat.includes("pc") || cat.includes("hardware")) {
      return [
        "Hi, need quote for RTX 4080 Super gaming PC with intel i3 12000",
        "Build me a ₹2,15,000 Beast Pro rig with Ryzen 7 7800X3D",
        "Does 850W Gold PSU support RTX 4080 Super?"
      ];
    }
    return [
      "What are your core business services?",
      "Can I schedule a discovery consultation?",
      "How fast can Synthopsis deploy this agent?"
    ];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 font-mono animate-in fade-in">
      <div className="relative w-full max-w-3xl border-2 border-[#121316] bg-white shadow-[6px_6px_0px_#121316] flex flex-col h-[90vh] max-h-[820px]">
        {/* Header Bar */}
        <div className="border-b-2 border-[#121316] bg-[#f8f8fa] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#121316] bg-white shadow-[1px_1px_0px_#121316]">
              {testingAgent.channel === "whatsapp" ? (
                <MessageSquare className="h-4 w-4 text-[#087a38]" />
              ) : testingAgent.channel === "email" ? (
                <Mail className="h-4 w-4 text-[#7e22ce]" />
              ) : testingAgent.channel === "both" ? (
                <Zap className="h-4 w-4 text-[#ff2a3b]" />
              ) : (
                <Globe className="h-4 w-4 text-[#0369a1]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-[#ff2a3b] uppercase">
                  RUNTIME TEST // {testingAgent.category}
                </span>
                <span className="text-zinc-400 text-[9px]">•</span>
                <button
                  onClick={() => toggleAgentStatus(testingAgent.id)}
                  className={`px-1.5 py-0.2 text-[8px] font-bold uppercase cursor-pointer border ${
                    testingAgent.status === "active"
                      ? "bg-[#ff2a3b] text-white border-[#121316]"
                      : "bg-[#e9e9ed] text-zinc-600 border-[#d6d6de]"
                  }`}
                >
                  {testingAgent.status === "active" ? "RUNNING" : "PAUSED"}
                </button>
              </div>

              <h2 className="text-sm font-black uppercase text-[#121316]">
                {testingAgent.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 border border-[#121316] bg-white text-[9px] font-bold text-[#121316] flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#ff2a3b]" />
              {testingAgent.model === "groq" ? "GROQ LPU (~180MS)" : "GROQ REASONING"}
            </span>

            <button
              onClick={() => setTestingAgent(null)}
              className="p-1 border border-[#121316] bg-white hover:bg-[#121316] hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Warning if paused */}
        {testingAgent.status !== "active" && (
          <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 flex items-center justify-between text-amber-900 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[11px] font-bold">
                NOTICE: This agent is currently PAUSED. Simulation active.
              </span>
            </div>
            <button
              onClick={() => toggleAgentStatus(testingAgent.id)}
              className="text-[10px] font-bold underline cursor-pointer hover:text-black"
            >
              RESUME AGENT
            </button>
          </div>
        )}

        {/* Collapsible Prompt & System Directives Bar */}
        <div className="border-b border-[#e5e5eb] bg-white px-4 py-2 text-[10px]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="flex items-center gap-1.5 font-bold text-zinc-700 hover:text-[#ff2a3b] cursor-pointer"
            >
              <FileText className="h-3 w-3" />
              <span>ACTIVE SYSTEM PROMPT & DOCUMENTS ({testingAgent.knowledgeBaseFiles.length})</span>
              {showPromptDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>

            {measuredLatency && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Zap className="h-3 w-3 text-emerald-600" />
                TTFT: {measuredLatency}ms
              </span>
            )}
          </div>

          {showPromptDetails && (
            <div className="mt-2.5 p-3 bg-[#f8f8fa] border border-[#121316] space-y-2 text-[11px]">
              <div>
                <span className="font-bold uppercase text-[9px] text-zinc-500">System Directives:</span>
                <p className="font-mono text-zinc-700 mt-0.5 text-[10px] leading-relaxed max-h-24 overflow-y-auto">
                  {testingAgent.systemPrompt}
                </p>
              </div>

              {testingAgent.knowledgeBaseFiles.length > 0 && (
                <div className="pt-1.5 border-t border-[#e5e5eb] flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold uppercase text-[9px] text-zinc-500">Attached RAG Specs:</span>
                  {testingAgent.knowledgeBaseFiles.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.2 bg-white border border-[#121316] text-[9px] font-bold"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-[9px] text-zinc-400 mb-0.5 px-1 font-bold">
                {msg.role === "user" ? "YOU // TESTING OPERATOR" : `${testingAgent.name.toUpperCase()} // AGENT`} • {msg.timestamp}
              </div>

              <div
                className={`max-w-[85%] p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#121316] text-white border border-[#121316] shadow-[2px_2px_0px_#ff2a3b]"
                    : "bg-white text-[#121316] border border-[#121316] shadow-[2px_2px_0px_#121316]"
                }`}
              >
                {msg.content}
                {isStreaming && msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id && (
                  <span className="inline-block w-1.5 h-3 ml-1 bg-[#ff2a3b] animate-pulse align-middle" />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Test Chips */}
        <div className="px-4 py-2 border-t border-[#e5e5eb] bg-white flex items-center gap-1.5 overflow-x-auto text-[10px]">
          <span className="text-[9px] font-bold text-zinc-400 uppercase whitespace-nowrap">
            QUICK PROMPTS:
          </span>
          {getQuickChips().map((chip, idx) => (
            <button
              key={idx}
              disabled={isStreaming}
              onClick={() => handleSend(chip)}
              className="px-2 py-1 bg-[#f8f8fa] hover:bg-[#121316] hover:text-white border border-[#121316] text-[9px] font-bold whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <div className="p-3 border-t-2 border-[#121316] bg-[#f8f8fa] flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Ask ${testingAgent.name} anything... (e.g. quote, inventory, lead time)`}
            className="flex-1 bg-white border-[#121316] text-xs font-mono"
            disabled={isStreaming}
          />

          <Button
            variant="cyber"
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="gap-1.5 px-4 h-9"
          >
            {isStreaming ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                STREAMING
              </span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>SEND</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isStreaming}
            className="h-9 px-2 text-zinc-600 hover:text-black border-[#121316]"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Link
            href="/dashboard/inbox"
            onClick={() => setTestingAgent(null)}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 h-9 border border-[#121316] bg-white text-[10px] font-bold hover:bg-[#121316] hover:text-white transition-colors"
          >
            <span>INBOX</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
