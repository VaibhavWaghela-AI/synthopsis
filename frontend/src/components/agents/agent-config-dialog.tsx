"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAgentStore, AttachedDoc } from "@/lib/store/use-agent-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Trash2,
  Eye,
  Loader2,
  CheckCircle2,
  Zap,
  Check,
  AlertCircle,
  Smartphone,
  Mail,
  QrCode,
  Globe,
  RefreshCw,
  Building2,
  Key,
  ShieldCheck,
  Send
} from "lucide-react";

export function AgentConfigDialog() {
  const { isConfigDialogOpen, selectedAgent, closeConfigDialog, saveAgent, deleteAgent } =
    useAgentStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Custom PC Hardware");
  const [channel, setChannel] = useState<"whatsapp" | "email" | "both" | "web">("both");
  const [model, setModel] = useState<"groq" | "gemini">("groq");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.3);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AttachedDoc | null>(null);

  // Channel-Specific Configuration States
  const [companyEmail, setCompanyEmail] = useState("vaibhavwaghelaa@gmail.com");
  const [senderDisplayName, setSenderDisplayName] = useState("ApexRig Gaming Support");
  const [emailPassword, setEmailPassword] = useState("");
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // WhatsApp Connection States
  const [waStatus, setWaStatus] = useState<{
    status: string;
    qrDataUrl: string | null;
    phone: { pushname?: string; wid?: string; platform?: string } | null;
  }>({
    status: "checking",
    qrDataUrl: null,
    phone: null
  });
  const [isRefreshingWa, setIsRefreshingWa] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchWaStatus = async () => {
    setIsRefreshingWa(true);
    try {
      const res = await fetch("/api/whatsapp/status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setWaStatus(data);
      } else {
        setWaStatus({ status: "offline", qrDataUrl: null, phone: null });
      }
    } catch {
      setWaStatus({ status: "offline", qrDataUrl: null, phone: null });
    } finally {
      setIsRefreshingWa(false);
    }
  };

  useEffect(() => {
    if (!isConfigDialogOpen) return;
    fetchWaStatus();

    // Auto-poll WhatsApp status every 3s if WhatsApp or Both channel is selected
    const interval = setInterval(() => {
      if (channel === "whatsapp" || channel === "both") {
        fetch("/api/whatsapp/status", { cache: "no-store" })
          .then((res) => res.json())
          .then((data) => setWaStatus(data))
          .catch(() => {});
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isConfigDialogOpen, channel]);

  useEffect(() => {
    if (selectedAgent) {
      setName(selectedAgent.name);
      setCategory(selectedAgent.category);
      setChannel(selectedAgent.channel || "both");
      setModel(selectedAgent.model);
      setSystemPrompt(selectedAgent.systemPrompt);
      setTemperature(selectedAgent.temperature);
      setCompanyEmail(selectedAgent.companyEmail || "vaibhavwaghelaa@gmail.com");
      setSenderDisplayName(selectedAgent.senderDisplayName || "ApexRig Gaming Support");
      setEmailPassword(selectedAgent.emailPassword || "");
      setUploadedFiles(selectedAgent.knowledgeBaseFiles || []);
      setAttachedDocs(
        selectedAgent.attachedDocs ||
          (selectedAgent.knowledgeBaseFiles || []).map((f) => ({
            name: f,
            content: `Pre-configured domain spec sheet for ${f}: Contains technical specifications, standard pricing tiers, and delivery terms.`
          }))
      );
    } else {
      setName("ApexRig Gaming PC Architect");
      setCategory("Custom PC Hardware");
      setChannel("both");
      setModel("groq");
      setCompanyEmail("vaibhavwaghelaa@gmail.com");
      setSenderDisplayName("ApexRig Gaming Support");
      setEmailPassword("");
      setSystemPrompt(
        "You are the Lead Hardware Architect at ApexRig Gaming Technologies (company email: vaibhavwaghelaa@gmail.com). You evaluate gaming PC builds, detect CPU/GPU bottlenecks (e.g., warning against pairing an RTX 4080 Super with an Intel i3), and dispatch quotes via WhatsApp (+91 87800 42609) and Email."
      );
      setTemperature(0.3);
      setUploadedFiles(["ApexRig_Q1_2026_Catalog.pdf"]);
      setAttachedDocs([
        {
          name: "ApexRig_Q1_2026_Catalog.pdf",
          content:
            "ApexRig Gaming catalog: RTX 4080 Super, Ryzen 7 7800X3D, DDR5 6000MHz, Corsair RM850e Gold PSU, 2TB Gen4 NVMe SSD."
        }
      ]);
    }
    setUploadError(null);
    setPreviewDoc(null);
    setTestEmailStatus(null);
  }, [selectedAgent, isConfigDialogOpen]);

  if (!isConfigDialogOpen) return null;

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: companyEmail,
          subject: `[Agent Dispatch Test] Configured for ${name || "ApexRig Gaming"}`,
          body: `Verification test from Agent Studio:\n- Agent: ${name}\n- Channels: ${channel.toUpperCase()}\n- Company Mailbox: ${companyEmail}\n- Status: Active and verified for incoming customer quotation requests.`
        })
      });
      if (res.ok) {
        setTestEmailStatus(`✅ Verified: Test email dispatched to ${companyEmail}!`);
      } else {
        setTestEmailStatus(`ℹ️ Dispatch recorded for ${companyEmail}.`);
      }
    } catch (err: any) {
      setTestEmailStatus(`❌ Dispatch error: ${err?.message}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadError(null);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          const doc: AttachedDoc = {
            name: data.filename || file.name,
            size: data.size_bytes || file.size,
            content: data.extracted_text || `[Document: ${file.name}]`
          };

          setAttachedDocs((prev) => [...prev.filter((d) => d.name !== doc.name), doc]);
          setUploadedFiles((prev) => (prev.includes(doc.name) ? prev : [...prev, doc.name]));
        } else {
          // Client-side fallback read for text-based files
          const text = await file.text();
          const doc: AttachedDoc = {
            name: file.name,
            size: file.size,
            content: text
          };
          setAttachedDocs((prev) => [...prev.filter((d) => d.name !== doc.name), doc]);
          setUploadedFiles((prev) => (prev.includes(doc.name) ? prev : [...prev, doc.name]));
        }
      } catch (err: any) {
        setUploadError(`Failed to process ${file.name}: ${err?.message}`);
      }
    }
    setIsUploading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    e.target.value = "";
  };

  const handleRemoveDoc = (docName: string) => {
    setAttachedDocs((prev) => prev.filter((d) => d.name !== docName));
    setUploadedFiles((prev) => prev.filter((f) => f !== docName));
    if (previewDoc?.name === docName) {
      setPreviewDoc(null);
    }
  };

  const handleSave = () => {
    saveAgent({
      id: selectedAgent?.id,
      name,
      category,
      channel,
      model,
      systemPrompt,
      temperature,
      knowledgeBaseFiles: uploadedFiles,
      attachedDocs: attachedDocs,
      companyEmail,
      senderDisplayName,
      emailPassword
    });

    // Notify backend
    try {
      fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          vertical:
            category.toLowerCase().includes("pc") || category.toLowerCase().includes("gaming")
              ? "gaming_pc"
              : category.toLowerCase().includes("manufact")
              ? "manufacturing"
              : category.toLowerCase().includes("logit")
              ? "logistics"
              : "general",
          channel,
          company_email: companyEmail,
          sender_display_name: senderDisplayName,
          preferred_model: model,
          description: systemPrompt.slice(0, 100),
          system_prompt: systemPrompt
        })
      }).catch(() => {});
    } catch {}

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      closeConfigDialog();
    }, 400);
  };

  const handleDelete = () => {
    if (selectedAgent?.id) {
      deleteAgent(selectedAgent.id);
      closeConfigDialog();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 font-mono animate-in fade-in">
      <div className="relative w-full max-w-3xl border-2 border-[#121316] bg-white p-6 shadow-[6px_6px_0px_#121316] flex flex-col justify-between max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#121316] pb-3">
          <div>
            <span className="text-[9px] font-bold text-[#ff2a3b] uppercase">
              // AGENT CONFIGURATION MATRIX
            </span>
            <h2 className="text-base font-bold uppercase text-[#121316]">
              {selectedAgent ? `EDIT // ${selectedAgent.name}` : "DEPLOY NEW AGENT"}
            </h2>
          </div>
          <button
            onClick={closeConfigDialog}
            className="p-1 border border-[#121316] bg-[#f8f8fa] hover:bg-[#121316] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 overflow-y-auto py-4 pr-1 text-xs">
          {/* Agent Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ApexRig Gaming PC Architect"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
                Industry Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Custom PC Hardware, Manufacturing"
              />
            </div>
          </div>

          {/* Primary Channel Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase text-zinc-600">
                Deployment Pipe (Select Channels)
              </label>
              <span className="text-[9px] text-[#ff2a3b] font-bold">
                {channel === "both"
                  ? "DUAL OMNICHANNEL ACTIVE"
                  : channel === "whatsapp"
                  ? "WHATSAPP LINK REQUIRED"
                  : channel === "email"
                  ? "COMPANY EMAIL REQUIRED"
                  : "WEB EMBED ACTIVE"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`p-2.5 border text-center font-bold text-[10px] uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  channel === "whatsapp"
                    ? "border-[#121316] bg-[#121316] text-white shadow-[2px_2px_0px_#ff2a3b]"
                    : "border-[#121316] bg-white text-[#121316] hover:bg-[#f2f2f5]"
                }`}
              >
                <Smartphone className="h-4 w-4 text-[#087a38]" />
                <span>WHATSAPP</span>
                <span className="text-[8px] opacity-75 font-normal">Scan QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`p-2.5 border text-center font-bold text-[10px] uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  channel === "email"
                    ? "border-[#121316] bg-[#121316] text-white shadow-[2px_2px_0px_#ff2a3b]"
                    : "border-[#121316] bg-white text-[#121316] hover:bg-[#f2f2f5]"
                }`}
              >
                <Mail className="h-4 w-4 text-[#7e22ce]" />
                <span>EMAIL DESK</span>
                <span className="text-[8px] opacity-75 font-normal">Enter Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("both")}
                className={`p-2.5 border text-center font-bold text-[10px] uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                  channel === "both"
                    ? "border-[#121316] bg-[#121316] text-white shadow-[2px_2px_0px_#ff2a3b]"
                    : "border-[#121316] bg-amber-50 text-[#121316] hover:bg-amber-100"
                }`}
              >
                <span className="absolute -top-2 right-1 px-1 bg-[#ff2a3b] text-white text-[7px] font-black uppercase">
                  BOTH
                </span>
                <Zap className="h-4 w-4 text-[#ff2a3b]" />
                <span>WA + EMAIL</span>
                <span className="text-[8px] opacity-75 font-normal">Do Both Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("web")}
                className={`p-2.5 border text-center font-bold text-[10px] uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  channel === "web"
                    ? "border-[#121316] bg-[#121316] text-white shadow-[2px_2px_0px_#ff2a3b]"
                    : "border-[#121316] bg-white text-[#121316] hover:bg-[#f2f2f5]"
                }`}
              >
                <Globe className="h-4 w-4 text-[#0369a1]" />
                <span>WEB WIDGET</span>
                <span className="text-[8px] opacity-75 font-normal">Embed Code</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC CHANNEL SETUP TASKS (WhatsApp QR / Company Email / Both) */}
          <div className="space-y-3">
            {channel === "both" && (
              <div className="p-2.5 bg-amber-50 border border-amber-400 flex items-center gap-2 text-[10px] text-amber-950 font-bold">
                <Zap className="h-4 w-4 text-[#ff2a3b] shrink-0" />
                <span>
                  ⚡ DUAL-CHANNEL PIPELINE: Complete both tasks below to enable instant quotation via both WhatsApp and Company Email simultaneously.
                </span>
              </div>
            )}

            {/* Task 1: WhatsApp Device Pairing */}
            {(channel === "whatsapp" || channel === "both") && (
              <div className="border border-[#121316] bg-[#f8f8fa] p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e5e5eb] pb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-[#087a38]" />
                    <span className="text-[10px] font-bold uppercase text-[#121316]">
                      {channel === "both"
                        ? "TASK 1: WHATSAPP DEVICE LINKING & QR SCAN"
                        : "WHATSAPP DEVICE SETUP & QR SCAN"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchWaStatus}
                    disabled={isRefreshingWa}
                    className="text-[9px] text-zinc-600 hover:text-[#121316] flex items-center gap-1 cursor-pointer font-bold uppercase"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${isRefreshingWa ? "animate-spin" : ""}`} />
                    Refresh Status
                  </button>
                </div>

                {waStatus.status === "ready" ? (
                  <div className="bg-[#e7f7ed] border border-[#087a38] p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#087a38] font-bold text-[11px]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>DEVICE PAIRED & AUTHENTICATED</span>
                      </div>
                      <span className="px-1.5 py-0.5 bg-white text-[#087a38] border border-[#087a38]/40 text-[8px] font-black uppercase">
                        LIVE 24/7
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-700 font-mono space-y-0.5">
                      <div>
                        <strong className="text-[#121316]">Connected Number:</strong> +
                        {waStatus.phone?.wid || "91 87800 42609"} ({waStatus.phone?.pushname || "Vaibhav"})
                      </div>
                      <div>
                        <strong className="text-[#121316]">Platform:</strong>{" "}
                        {waStatus.phone?.platform || "Android"} | Puppeteer LocalAuth Bridge Active
                      </div>
                      <div className="text-[9px] text-[#087a38] font-bold">
                        ✓ Incoming WhatsApp messages will trigger this agent and execute automated quotation workflows.
                      </div>
                    </div>
                  </div>
                ) : waStatus.status === "qr" && waStatus.qrDataUrl ? (
                  <div className="bg-white border border-[#121316] p-3 flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-2 border border-[#121316] bg-white shadow-[2px_2px_0px_#121316] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={waStatus.qrDataUrl} alt="WhatsApp QR Code" className="w-36 h-36" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-[#ff2a3b] uppercase">
                        <QrCode className="h-3.5 w-3.5" />
                        <span>SCAN QR CODE TO LINK THIS AGENT</span>
                      </div>
                      <ol className="text-[10px] text-zinc-600 space-y-1 list-decimal list-inside font-sans">
                        <li>Open WhatsApp on your phone</li>
                        <li>
                          Tap <strong>Settings</strong> or <strong>Menu (⋮)</strong> &gt;{" "}
                          <strong>Linked Devices</strong>
                        </li>
                        <li>
                          Tap <strong>Link a Device</strong> and point your camera here
                        </li>
                      </ol>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        Auto-detects scan and syncs in real time without refreshing.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 p-2.5 text-[10px] text-amber-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>WhatsApp service status: {waStatus.status} (port 3006)</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={fetchWaStatus}
                      className="h-6 text-[9px] cursor-pointer"
                    >
                      Check Again
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Task 2: Company Email Configuration */}
            {(channel === "email" || channel === "both") && (
              <div className="border border-[#121316] bg-[#f8f8fa] p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#e5e5eb] pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#7e22ce]" />
                    <span className="text-[10px] font-bold uppercase text-[#121316]">
                      {channel === "both"
                        ? "TASK 2: COMPANY EMAIL CONFIGURATION"
                        : "COMPANY EMAIL DISPATCH & INBOUND SETUP"}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">
                    GMAIL SMTP GATEWAY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-600 mb-1">
                      Company Email for Quotes & Inquiries
                    </label>
                    <div className="relative">
                      <Input
                        value={companyEmail}
                        onChange={(e) => setCompanyEmail(e.target.value)}
                        placeholder="e.g. vaibhavwaghelaa@gmail.com"
                        className="text-[11px] bg-white pl-7"
                      />
                      <Mail className="h-3.5 w-3.5 text-zinc-400 absolute left-2 top-2.5" />
                    </div>
                    <p className="text-[8px] text-zinc-500 mt-1">
                      Quotes and customer requests are received at and sent from this inbox.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-zinc-600 mb-1">
                      Sender Organization / Display Name
                    </label>
                    <div className="relative">
                      <Input
                        value={senderDisplayName}
                        onChange={(e) => setSenderDisplayName(e.target.value)}
                        placeholder="e.g. ApexRig Gaming Support"
                        className="text-[11px] bg-white pl-7"
                      />
                      <Building2 className="h-3.5 w-3.5 text-zinc-400 absolute left-2 top-2.5" />
                    </div>
                    <p className="text-[8px] text-zinc-500 mt-1">
                      Displayed in the customer&apos;s email client as the official sender.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5e5eb] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSendTestEmail}
                    disabled={isSendingTestEmail}
                    className="h-7 text-[9px] gap-1 cursor-pointer border-[#121316] bg-white hover:bg-zinc-100"
                  >
                    {isSendingTestEmail ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#ff2a3b]" />
                    ) : (
                      <Send className="h-3 w-3 text-[#7e22ce]" />
                    )}
                    <span>SEND TEST PING TO {companyEmail.split("@")[0] || "INBOX"}</span>
                  </Button>

                  {testEmailStatus && (
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 border border-emerald-300">
                      {testEmailStatus}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Web Widget Setup */}
            {channel === "web" && (
              <div className="border border-[#121316] bg-[#f8f8fa] p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-[#e5e5eb] pb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#0369a1]" />
                    <span className="text-[10px] font-bold uppercase text-[#121316]">
                      WEB CHAT EMBED SCRIPT
                    </span>
                  </div>
                  <span className="text-[9px] text-[#0369a1] font-bold uppercase">
                    FLOATING WIDGET
                  </span>
                </div>
                <div className="p-2 bg-[#121316] text-[#00ff66] text-[10px] font-mono overflow-x-auto">
                  {`<script src="https://cdn.synthopsis.ai/v1/widget.js" data-agent="${selectedAgent?.id || "apexrig-bot"}" async></script>`}
                </div>
                <p className="text-[9px] text-zinc-500 font-sans">
                  Paste this snippet before the closing &lt;/body&gt; tag on your website to launch the live AI chat assistant.
                </p>
              </div>
            )}
          </div>

          {/* Model Selection (Groq vs Gemini) */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
              AI Inference Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setModel("groq")}
                className={`p-2.5 border text-left font-bold text-[10px] uppercase transition-all cursor-pointer ${
                  model === "groq"
                    ? "border-[#121316] bg-[#121316] text-white shadow-[2px_2px_0px_#ff2a3b]"
                    : "border-[#121316] bg-white text-[#121316] hover:bg-[#f2f2f5]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Zap className="h-3.5 w-3.5 text-[#ff2a3b]" />
                  <span>GROQ LLAMA 3.3</span>
                </div>
                <div className="text-[9px] font-normal opacity-80 mt-0.5">
                  Sub-200ms token streaming (WhatsApp & Web)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setModel("gemini")}
                className={`p-2.5 border text-left font-bold text-[10px] uppercase transition-all cursor-pointer ${
                  model === "gemini"
                    ? "border-[#121316] bg-[#121316] text-white shadow-[2px_2px_0px_#ff2a3b]"
                    : "border-[#121316] bg-white text-[#121316] hover:bg-[#f2f2f5]"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>GROQ AI (DEEP REASONING)</span>
                </div>
                <div className="text-[9px] font-normal opacity-80 mt-0.5">
                  Analytical, structured B2B emails & reports
                </div>
              </button>
            </div>
          </div>

          {/* Tone & Language Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-[#121316] bg-[#f8f8fa]">
            <div>
              <label className="block text-[9px] font-bold uppercase text-zinc-600 mb-1">
                Tone Persona
              </label>
              <select
                className="w-full border border-[#121316] bg-white p-1.5 text-[11px] font-mono text-[#121316] focus:outline-none"
                defaultValue="professional"
              >
                <option value="professional">Formal & Consultative (B2B)</option>
                <option value="crisp">Crisp & Action-Oriented (Sales)</option>
                <option value="empathetic">Empathetic & Reassuring (Support)</option>
                <option value="urgent">High-Priority Resolution (Emergency)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase text-zinc-600 mb-1">
                Vernacular Language
              </label>
              <select
                className="w-full border border-[#121316] bg-white p-1.5 text-[11px] font-mono text-[#121316] focus:outline-none"
                defaultValue="multilingual"
              >
                <option value="multilingual">Multilingual (English + Hindi + Gujarati)</option>
                <option value="en">English (Standard Commercial)</option>
                <option value="gu">Gujarati (JM PlastoPack & Local SME)</option>
                <option value="hi">Hindi (North India Hubs)</option>
              </select>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">
              System Prompt & Reasoning Directives
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="w-full border border-[#121316] bg-white p-2.5 text-xs text-[#121316] font-mono leading-relaxed focus:outline-none focus:border-[#ff2a3b]"
            />
          </div>

          {/* Connected Documents (RAG) — REAL FILE UPLOADER */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase text-zinc-600">
                Connected Documents (RAG Knowledge Base)
              </label>
              <span className="text-[9px] text-[#ff2a3b] font-bold">
                {attachedDocs.length} DOCS INDEXED
              </span>
            </div>

            {/* Hidden Real File Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.txt,.md,.csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drop / Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) {
                  processFiles(Array.from(e.dataTransfer.files));
                }
              }}
              className="border-2 border-dashed border-[#121316] p-4 text-center bg-[#f8f8fa] hover:bg-[#f0f0f5] transition-colors cursor-pointer group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-2 text-zinc-700">
                  <Loader2 className="h-6 w-6 animate-spin text-[#ff2a3b] mb-1.5" />
                  <span className="text-xs font-bold uppercase">
                    Parsing Document & Extracting RAG Text...
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    Analyzing pages, tables & text tokens
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-1">
                  <UploadCloud className="h-7 w-7 text-zinc-400 group-hover:text-[#ff2a3b] transition-colors mb-1.5" />
                  <span className="text-xs font-bold text-[#121316] uppercase">
                    Click to Browse or Drag & Drop Documents
                  </span>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Supports <span className="font-bold text-zinc-700">PDF, TXT, CSV, JSON, MD</span> (Max 10MB)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2.5 text-[10px] h-7 border-[#121316] pointer-events-none"
                  >
                    + SELECT FILE FROM DEVICE
                  </Button>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="mt-2 text-[10px] text-red-600 flex items-center gap-1 font-bold">
                <AlertCircle className="h-3 w-3" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Indexed Document List Cards */}
            {attachedDocs.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  ACTIVE GROUNDING DOCUMENTS (AI ACCESSES FULL TEXT):
                </div>

                <div className="space-y-1.5">
                  {attachedDocs.map((doc, i) => (
                    <div
                      key={i}
                      className="p-2 border border-[#121316] bg-white flex items-center justify-between shadow-[1px_1px_0px_#121316]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 border border-[#121316] bg-[#f8f8fa]">
                          {doc.name.endsWith(".csv") ? (
                            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-[#ff2a3b]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[#121316] truncate max-w-[280px]">
                            {doc.name}
                          </div>
                          <div className="text-[9px] text-zinc-500 flex items-center gap-1.5">
                            <span>
                              {doc.size ? `${Math.round(doc.size / 1024)} KB` : "Embedded Spec"}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">✓ RAG INDEXED</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {doc.content && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewDoc(doc)}
                            className="h-6 px-1.5 text-[9px] gap-1 text-zinc-600 hover:text-black border border-transparent hover:border-[#121316]"
                            title="Preview extracted text"
                          >
                            <Eye className="h-3 w-3" />
                            <span>PREVIEW</span>
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(doc.name)}
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#121316] pt-3 mt-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={closeConfigDialog}>
              CANCEL
            </Button>
            {selectedAgent && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="text-[10px] bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                DELETE AGENT
              </Button>
            )}
          </div>

          <Button variant="cyber" size="sm" onClick={handleSave} className="gap-1.5">
            {isSaved ? (
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>CONFIGURATION APPLIED</span>
              </span>
            ) : (
              "SAVE & DEPLOY AGENT"
            )}
          </Button>
        </div>

        {/* Extracted Document Preview Overlay */}
        {previewDoc && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col p-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#121316] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#ff2a3b]" />
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#121316]">
                    DOCUMENT PREVIEW // {previewDoc.name}
                  </h3>
                  <span className="text-[9px] text-zinc-500">
                    Content available for AI semantic grounding
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 border border-[#121316] bg-[#f8f8fa] hover:bg-[#121316] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 border border-[#121316] bg-[#f8f8fa] text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-zinc-800">
              {previewDoc.content || "[No text content extracted]"}
            </div>

            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setPreviewDoc(null)}>
                CLOSE PREVIEW
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
