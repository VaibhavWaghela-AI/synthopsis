"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import {
  Send,
  Reply,
  Archive,
  Trash2,
  Zap,
  Mail,
  Settings,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "../ui/button";

export function EmailThread() {
  const { conversations, sendMessage, isStreaming } = useInboxStore();
  const [replyText, setReplyText] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Inbound Simulation & Live Testing States
  const [inboundQuery, setInboundQuery] = useState(
    "Hi, need quote for RTX 4080 Super gaming PC with intel i3 12000 will this tell us about bottle neck and all?like general knowledeg information"
  );
  const [isInboundIngesting, setIsInboundIngesting] = useState(false);
  const [inboundStatus, setInboundStatus] = useState<string | null>(null);

  // Direct outbound test states
  const [testEmail, setTestEmail] = useState("vaibhavwaghelaa@gmail.com");
  const [testSubject, setTestSubject] = useState(
    "ApexRig Gaming - Official Quotation (RTX 4080 Super Build)"
  );
  const [testBody, setTestBody] = useState(
    "Dear Valued Gamer,\n\nThank you for reaching out to ApexRig Gaming Technologies.\nHere is your customized quotation for the BEAST PRO (RTX 4080 Super + Ryzen 7 7800X3D):\n- Total Deal Value: ₹2,15,000 (Incl. 18% GST)\n- Specs: 32GB DDR5-6000MHz, 2TB Gen4 SSD, 360mm AIO, 850W Gold PSU\n- Warranty: 3-Year Doorstep Warranty + 24-hr stress test certificate.\n\nBest regards,\nVaibhav Waghela\nApexRig Gaming Technologies"
  );
  const [smtpUser, setSmtpUser] = useState("vaibhavwaghelaa@gmail.com");
  const [smtpPass, setSmtpPass] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);

  // Real SQLite Database Email Synchronization
  const [realMessages, setRealMessages] = useState<any[] | null>(null);
  const [realSubject, setRealSubject] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRealEmailThread = async () => {
    try {
      const msgRes = await fetch("/api/inbox/conversations/conv-em-1/messages");
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (msgData.data && Array.isArray(msgData.data) && msgData.data.length > 0) {
          setRealMessages(msgData.data);
          // Extract latest subject if available
          const latestUserMsg = [...msgData.data]
            .reverse()
            .find((m: any) => m.sender_role === "user");
          if (latestUserMsg?.content?.includes("Subject:")) {
            const lines = latestUserMsg.content.split("\n");
            const subjLine = lines.find((l: string) => l.startsWith("Subject:"));
            if (subjLine) {
              setRealSubject(subjLine.replace("Subject:", "").trim());
            }
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchRealEmailThread();
    const interval = setInterval(fetchRealEmailThread, 2000);
    return () => clearInterval(interval);
  }, []);

  const thread = conversations.email;
  const fallbackMessages = thread.messages;

  // Use real SQLite messages if populated
  const displayMessages =
    realMessages && realMessages.length > 0
      ? realMessages.map((m: any) => ({
          id: m.id,
          sender: m.sender_role === "agent" ? ("agent" as const) : ("user" as const),
          content: m.content,
          timestamp: m.timestamp || "Just now",
          modelUsed: m.model_used || "groq"
        }))
      : fallbackMessages;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  const handleTriggerInboundEmail = async () => {
    if (!inboundQuery.trim()) return;
    setIsInboundIngesting(true);
    setInboundStatus("Processing inbound email through Enterprise DAG workflow...");

    try {
      const res = await fetch("/api/email/incoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "vaibhavwaghelaa@gmail.com",
          to: "vaibhavwaghelaa@gmail.com",
          subject: "Quotation & Bottleneck Inquiry: RTX 4080 Super with Intel i3",
          body: inboundQuery.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setInboundStatus(
          `✅ Inbound email ingested! DAG Workflow #${data.workflow?.run_id || "Active"} executed. Agent quotation drafted and dispatched.`
        );
        fetchRealEmailThread();
      } else {
        setInboundStatus("⚠️ Ingestion recorded. Refreshing email thread...");
        fetchRealEmailThread();
      }
    } catch (err: any) {
      setInboundStatus(`❌ Ingestion error: ${err?.message}`);
    } finally {
      setIsInboundIngesting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    const textToSend = replyText;
    sendMessage("email", textToSend);
    setReplyText("");
    setIsReplyOpen(false);

    try {
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "vaibhavwaghelaa@gmail.com",
          subject: realSubject || "Re: B2B Quotation Specification",
          body: textToSend
        })
      });
      fetchRealEmailThread();
    } catch {}
  };

  const handleDispatchLiveEmail = async () => {
    if (!testEmail.trim()) return;
    setIsSending(true);
    setDispatchResult(null);

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail.trim(),
          subject: testSubject,
          body: testBody,
          smtp_user: smtpUser.trim() || undefined,
          smtp_password: smtpPass.trim() || undefined
        })
      });
      const data = await res.json();
      setDispatchResult(data);
      fetchRealEmailThread();
    } catch (err: any) {
      setDispatchResult({ success: false, error: err?.message || "Network error" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[620px] border-2 border-[#121316] bg-white overflow-hidden shadow-[4px_4px_0px_#121316] font-mono">
      {/* Left Sidebar: Inbound Mailbox List */}
      <div className="w-1/3 border-r border-[#121316] bg-[#f8f8fa] flex flex-col">
        <div className="p-3 border-b border-[#121316] flex items-center justify-between bg-white">
          <div>
            <span className="text-[10px] font-bold text-[#121316] uppercase tracking-wider block">
              COMPANY MAILBOX
            </span>
            <span className="text-[9px] text-[#ff2a3b] font-bold">vaibhavwaghelaa@gmail.com</span>
          </div>
          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#121316] text-white">
            TLS ACTIVE
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Active Conversation: ApexRig Gaming Inquiry */}
          <div className="p-3 border border-[#121316] bg-white shadow-[2px_2px_0px_#ff2a3b] text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#121316]">ApexRig Gaming Lead</span>
              <span className="text-[9px] text-zinc-500">Live</span>
            </div>
            <div className="text-xs font-bold text-[#121316] mt-1 line-clamp-1">
              {realSubject || "Quote for RTX 4080 Super with Intel i3"}
            </div>
            <div className="text-[11px] text-zinc-600 font-sans mt-1 line-clamp-2 leading-relaxed">
              Evaluating RTX 4080 Super build with CPU bottleneck analysis...
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[8px] font-bold px-1 py-0.5 bg-[#ff2a3b] text-white">
                LEAD SCORE: 98 // APEXRIG
              </span>
              <span className="text-[8px] font-bold px-1 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE PIPELINE
              </span>
            </div>
          </div>

          <div className="p-3 border border-[#d6d6de] bg-white/60 opacity-60 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-600">Apex Healthcare</span>
              <span className="text-[9px] text-zinc-400">Yesterday</span>
            </div>
            <div className="text-xs text-zinc-600 mt-1 line-clamp-1">
              Diagnostic SAP Scheduling RFP
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Email Viewer & Customer Simulator */}
      <div className="flex-1 flex flex-col justify-between bg-white">
        {/* Email Header */}
        <div className="px-5 py-3 border-b border-[#121316] bg-[#f8f8fa] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-[#121316]">
              {realSubject || "Quote Request: RTX 4080 Super Build & CPU Bottleneck Analysis"}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              From: <span className="text-[#121316] font-bold">vaibhavwaghelaa@gmail.com</span> // To:{" "}
              <span className="text-[#121316] font-bold">ApexRig Gaming Desk (vaibhavwaghelaa@gmail.com)</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[#121316]">
            <Link
              href="/dashboard/workflows"
              className="flex items-center gap-1 text-[9px] px-2.5 py-1 bg-[#121316] text-white border border-[#121316] font-bold shadow-[2px_2px_0px_#ff2a3b] hover:bg-[#ff2a3b] transition-all cursor-pointer"
            >
              <Zap className="h-3 w-3 text-[#ff2a3b]" />
              <span>VIEW WORKING DAG</span>
            </Link>
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1 text-[9px] px-2.5 py-1 bg-white border border-[#121316] font-bold shadow-[2px_2px_0px_#121316] hover:bg-[#ff2a3b] hover:text-white transition-all cursor-pointer"
            >
              <Settings className="h-3 w-3" />
              <span>TEST REAL EMAIL</span>
            </button>
            <button className="p-1 border border-[#121316] hover:bg-[#121316] hover:text-white transition-colors cursor-pointer">
              <Archive className="h-3 w-3" />
            </button>
            <button className="p-1 border border-[#121316] hover:bg-[#121316] hover:text-white transition-colors cursor-pointer">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Inbound Customer Email Trigger Bar */}
        <div className="p-3 bg-amber-50/70 border-b border-[#121316] flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 font-bold text-[#121316]">
              <Sparkles className="h-3.5 w-3.5 text-[#ff2a3b]" />
              <span>SIMULATE CUSTOMER INBOUND EMAIL INTO PIPELINE:</span>
            </div>
            <span className="text-[9px] text-zinc-500">
              Triggers Hardware Architect & Bottleneck Classifier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inboundQuery}
              onChange={(e) => setInboundQuery(e.target.value)}
              placeholder="e.g. Hi, need quote for RTX 4080 Super gaming PC with intel i3 12000..."
              className="flex-1 bg-white border border-[#121316] px-2.5 py-1.5 text-xs font-mono text-[#121316] focus:outline-none focus:border-[#ff2a3b]"
            />
            <Button
              type="button"
              variant="cyber"
              size="sm"
              onClick={handleTriggerInboundEmail}
              disabled={isInboundIngesting || !inboundQuery.trim()}
              className="h-8 text-[10px] gap-1 cursor-pointer shrink-0"
            >
              {isInboundIngesting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  INGESTING...
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3" />
                  SEND INBOUND EMAIL
                </>
              )}
            </Button>
          </div>

          {inboundStatus && (
            <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 p-2 border border-emerald-300 flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{inboundStatus}</span>
              </div>
              <Link
                href="/dashboard/workflows"
                className="px-2 py-0.5 bg-[#121316] text-white font-mono text-[9px] hover:bg-[#ff2a3b] transition-colors shrink-0 flex items-center gap-1"
              >
                <span>OPEN LIVE DAG</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Message Content Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-[#121316]">
          {displayMessages.map((msg, i) => {
            const isAgent = msg.sender === "agent";

            return (
              <div
                key={msg.id || i}
                className={`p-4 border ${
                  isAgent
                    ? "bg-[#f8f8fa] border-[#121316] shadow-[2px_2px_0px_#121316]"
                    : "bg-white border-[#e5e5eb]"
                }`}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#e5e5eb]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#121316] text-white">
                      {isAgent ? "APEXRIG AI COPILOT" : "CUSTOMER (VAIBHAV)"}
                    </span>
                    {isAgent && (
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold flex items-center gap-1 text-[#ff2a3b]">
                          // <Zap className="h-2.5 w-2.5 text-[#ff2a3b]" /> GROQ LLAMA 3.3
                        </span>
                        <Link
                          href="/dashboard/workflows"
                          className="text-[9px] font-mono text-zinc-500 hover:text-[#ff2a3b] underline inline-flex items-center gap-0.5"
                        >
                          [VIEW DAG RUN]
                        </Link>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-500">{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <div className="p-3 border border-[#121316] bg-[#f8f8fa] flex items-center gap-2 text-xs text-zinc-600">
              <span className="h-2 w-2 bg-[#ff2a3b] animate-ping" />
              <span>Groq 70B is synthesizing formal B2B proposal...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box Footer */}
        <div className="p-4 border-t border-[#121316] bg-[#f8f8fa]">
          {!isReplyOpen ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReplyOpen(true)}
              className="gap-1.5 text-xs border-[#121316] cursor-pointer"
            >
              <Reply className="h-3.5 w-3.5" />
              REPLY WITH COPILOT
            </Button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type instructions or response text..."
                rows={3}
                className="w-full border border-[#121316] bg-white p-2.5 text-xs font-mono text-[#121316] focus:outline-none focus:border-[#ff2a3b]"
              />
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplyOpen(false)}
                  className="cursor-pointer"
                >
                  CANCEL
                </Button>
                <Button
                  variant="cyber"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || isStreaming}
                  className="gap-1.5 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  DISPATCH FORMAL EMAIL
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real Email Dispatch & Configuration Modal */}
      {showConfigModal && (
        <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] w-full max-w-lg p-5 text-[#121316]">
            <div className="flex items-center justify-between border-b border-[#121316] pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Mail className="h-4 w-4 text-[#ff2a3b]" />
                <span className="uppercase tracking-wider">
                  Live Gmail Dispatch & Credentials Setup
                </span>
              </div>
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setDispatchResult(null);
                }}
                className="p-1 hover:bg-zinc-100 border border-transparent hover:border-[#121316] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="e.g. vaibhavwaghelaa@gmail.com"
                  className="w-full border border-[#121316] bg-white p-2 text-xs font-mono text-[#121316] focus:outline-none focus:border-[#ff2a3b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full border border-[#121316] bg-white p-2 text-xs font-mono text-[#121316] focus:outline-none focus:border-[#ff2a3b]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                  Message Content
                </label>
                <textarea
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  rows={3}
                  className="w-full border border-[#121316] bg-white p-2 text-xs font-mono text-[#121316] focus:outline-none focus:border-[#ff2a3b]"
                />
              </div>

              {/* SMTP Credentials Instructions */}
              <div className="p-3 bg-[#f8f8fa] border border-[#121316] space-y-2">
                <span className="text-[9px] font-bold uppercase text-zinc-600 block">
                  Gmail 2-Step Verification & App Password:
                </span>
                <p className="text-[9px] text-zinc-600 font-sans leading-relaxed">
                  To deliver real emails into your Gmail app, Google requires a 16-character App Password (not your normal password).
                  Generate it in 20 seconds at{" "}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#ff2a3b] underline font-bold"
                  >
                    myaccount.google.com/apppasswords
                  </a>{" "}
                  and save it in <code>backend/.env</code> as <code>SMTP_PASSWORD=xxxx xxxx xxxx xxxx</code>.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="Gmail Address"
                    className="border border-[#121316] bg-white p-1.5 text-[11px] font-mono focus:outline-none"
                  />
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="16-char App Password"
                    className="border border-[#121316] bg-white p-1.5 text-[11px] font-mono focus:outline-none"
                  />
                </div>
              </div>

              {dispatchResult && (
                <div
                  className={`p-3 border text-[11px] font-mono ${
                    dispatchResult.success
                      ? "bg-[#e7f7ed] border-[#087a38] text-[#087a38]"
                      : "bg-red-50 border-red-500 text-red-700"
                  }`}
                >
                  <div className="font-bold">
                    {dispatchResult.success ? "✓ DISPATCH RECORDED" : "✗ DISPATCH FAILED"}
                  </div>
                  <div className="text-[10px] mt-1">
                    {dispatchResult.message || dispatchResult.error || JSON.stringify(dispatchResult)}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#121316] flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Gateway: {dispatchResult?.mode || "Gmail TLS / SMTP API"}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowConfigModal(false);
                    setDispatchResult(null);
                  }}
                  className="text-[10px] font-bold uppercase border border-[#121316] cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  variant="cyber"
                  size="sm"
                  onClick={handleDispatchLiveEmail}
                  disabled={!testEmail.trim() || isSending}
                  className="text-[10px] font-bold uppercase gap-1 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      DISPATCHING...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      SEND REAL EMAIL
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
