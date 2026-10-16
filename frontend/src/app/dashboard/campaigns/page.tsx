"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Users,
  Upload,
  RefreshCw,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Play,
  ArrowRight,
  Plus,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company: string;
  interest: string;
  status: string;
  channel: string;
  notes?: string;
  conversation_id?: string;
  last_contacted_at?: string;
  created_at?: string;
}

interface Campaign {
  id: string;
  name: string;
  channel: string;
  agent_id: string;
  objective: string;
  brochure_filename?: string;
  status: string;
  total_leads: number;
  sent_count: number;
  replied_count: number;
  created_at?: string;
}

interface CampaignLog {
  id: string;
  campaign_id: string;
  lead_id: string;
  lead_name: string;
  lead_company: string;
  channel: string;
  message_sent: string;
  status: string;
  sent_at: string;
}

interface Proposal {
  id?: string;
  proposal_id?: string;
  lead_id: string;
  title: string;
  filename: string;
  public_url: string;
  pricing_total: number;
  roi_metric?: string;
  status?: string;
  created_at?: string;
}

export default function CampaignHubPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "campaigns">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [selectedCampaignLogs, setSelectedCampaignLogs] = useState<CampaignLog[] | null>(null);
  const [dialoguePreview, setDialoguePreview] = useState<{
    leadName: string;
    channel: string;
    customerReply: string;
    aiReply: string;
    proposal?: Proposal | null;
  } | null>(null);

  // Proposal Engine Modal
  const [proposalModal, setProposalModal] = useState<{
    isOpen: boolean;
    lead: Lead | null;
    proposal: Proposal | null;
    isGenerating: boolean;
    isSendingWhatsapp: boolean;
    dealValueInput: string;
  }>({
    isOpen: false,
    lead: null,
    proposal: null,
    isGenerating: false,
    isSendingWhatsapp: false,
    dealValueInput: "450000"
  });

  // Form states for New Campaign
  const [campaignForm, setCampaignForm] = useState({
    name: "ApexRig 2026 Gaming & AI Outbound Sequence",
    channel: "whatsapp",
    agent_id: "agent-1",
    objective: "Introduce 2026 flagship gaming rigs, share catalog specifications, and offer custom volume quotation.",
    brochure_filename: "ApexRig_Gaming_PC_Catalog_2026.txt"
  });

  // CSV Textarea state
  const [csvText, setCsvText] = useState(
    "Name,Phone,Email,Company,Interest\n" +
    "Hardik Mehta,+91 98251 44556,hardik@mehtasteel.com,Mehta Steels Ltd,Industrial High-Load Chemical Containers\n" +
    "Neha Joshi,+91 98790 33221,neha@joshimedia.in,Joshi Digital Media,ApexRig RTX 4090 Video Render Station\n" +
    "Pravin Solanki,+91 99099 88776,pravin@solankipharma.com,Solanki Formulations,Pharma Regulatory Compliance Assistant"
  );

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchCampaigns();
  }, []);

  const handleSyncInbound = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads/sync-inbound", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Synced ${data.synced_count} inbound leads!`);
        fetchLeads();
      } else {
        showToast("Sync failed", "error");
      }
    } catch (e) {
      showToast("Error syncing leads", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCsv = async () => {
    if (!csvText.trim()) return;
    setIsLoading(true);
    try {
      const blob = new Blob([csvText], { type: "text/csv" });
      const formData = new FormData();
      formData.append("file", blob, "leads_batch.csv");

      const res = await fetch("/api/leads/upload-csv", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully imported ${data.imported_count} leads from CSV!`);
        setShowCsvModal(false);
        fetchLeads();
      } else {
        showToast("Failed to parse CSV", "error");
      }
    } catch (e) {
      showToast("CSV import error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/campaigns/create-and-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🚀 Campaign '${campaignForm.name}' launched! Dispatched to ${data.execution?.total_processed || 0} leads.`);
        setShowNewCampaignModal(false);
        fetchCampaigns();
        fetchLeads();
        setActiveTab("campaigns");
      } else {
        showToast(data.error || "Failed to launch campaign", "error");
      }
    } catch (e) {
      showToast("Campaign launch error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateReply = async (leadId: string, leadName: string, channel: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/simulate-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setDialoguePreview({
          leadName: data.lead_name,
          channel: data.channel,
          customerReply: data.lead_reply,
          aiReply: data.ai_response,
          proposal: data.proposal || null
        });
        showToast(`💬 ${leadName} replied! AI Agent generated and dispatched grounded reply.`);
        fetchLeads();
        fetchCampaigns();
      } else {
        showToast("Failed to simulate reply", "error");
      }
    } catch (e) {
      showToast("Error triggering simulation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProposal = async (lead: Lead) => {
    setProposalModal({
      isOpen: true,
      lead: lead,
      proposal: null,
      isGenerating: true,
      isSendingWhatsapp: false,
      dealValueInput: "450000"
    });

    try {
      const res = await fetch(`/api/leads/${lead.id}/generate-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_value: 450000 })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProposalModal((prev) => ({
          ...prev,
          proposal: data.data,
          isGenerating: false
        }));
        showToast(`📄 Executive proposal generated for ${lead.name}!`);
      } else {
        setProposalModal((prev) => ({ ...prev, isGenerating: false }));
        showToast("Failed to compile proposal", "error");
      }
    } catch (e: any) {
      setProposalModal((prev) => ({ ...prev, isGenerating: false }));
      showToast(e?.message || "Proposal compilation error", "error");
    }
  };

  const handleRegenerateProposal = async () => {
    if (!proposalModal.lead) return;
    setProposalModal((prev) => ({ ...prev, isGenerating: true }));
    try {
      const budgetNum = parseFloat(proposalModal.dealValueInput) || 450000;
      const res = await fetch(`/api/leads/${proposalModal.lead.id}/generate-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_value: budgetNum })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProposalModal((prev) => ({
          ...prev,
          proposal: data.data,
          isGenerating: false
        }));
        showToast(`⚡ Re-generated proposal with updated commercial quotation!`);
      } else {
        setProposalModal((prev) => ({ ...prev, isGenerating: false }));
        showToast("Re-compilation failed", "error");
      }
    } catch (e: any) {
      setProposalModal((prev) => ({ ...prev, isGenerating: false }));
      showToast(e?.message || "Error", "error");
    }
  };

  const handleDispatchProposalWhatsapp = async () => {
    const propId = proposalModal.proposal?.proposal_id || proposalModal.proposal?.id;
    if (!propId) return;
    setProposalModal((prev) => ({ ...prev, isSendingWhatsapp: true }));
    try {
      const res = await fetch(`/api/proposals/${propId}/dispatch-whatsapp`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showToast(`📲 Proposal dispatched via WhatsApp to ${proposalModal.lead?.phone || "client"}!`);
      } else {
        showToast(data.error || "Dispatch failed", "error");
      }
    } catch (e: any) {
      showToast("WhatsApp dispatch error", "error");
    } finally {
      setProposalModal((prev) => ({ ...prev, isSendingWhatsapp: false }));
    }
  };

  const handleViewLogs = async (campId: string) => {
    try {
      const res = await fetch(`/api/campaigns/${campId}/logs`);
      const data = await res.json();
      if (data.success) {
        setSelectedCampaignLogs(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (statusFilter === "all") return true;
    return l.status === statusFilter;
  });

  const repliedLeadsCount = leads.filter((l) => l.status === "replied" || l.status === "brochure_sent").length;
  const replyRate = leads.length > 0 ? Math.round((repliedLeadsCount / leads.length) * 100) : 0;

  return (
    <div className="space-y-6 font-mono">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 border text-xs font-bold shadow-[4px_4px_0px_#121316] flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="border border-[#121316] bg-white p-5 shadow-[3px_3px_0px_#121316] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[10px]">
            <span className="px-2 py-0.5 bg-[#ff2a3b] text-white font-bold uppercase inline-flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 fill-white" /> MODULE 06 // AUTONOMOUS OUTREACH
            </span>
            <span className="text-zinc-500 font-mono">WHATSAPP &amp; GMAIL DISPATCH ACTIVE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#121316] tracking-tight uppercase">
            Outbound AI Broadcast &amp; Campaign Hub
          </h1>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Upload prospect lists, auto-sync inbound leads, dispatch personalized AI pitches, and conduct autonomous back-and-forth catalog dialogues.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Button
            onClick={handleSyncInbound}
            disabled={isLoading}
            variant="outline"
            className="border-[#121316] text-[#121316] hover:bg-zinc-100 font-bold text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            SYNC INBOUND LEADS
          </Button>

          <Button
            onClick={() => setShowCsvModal(true)}
            variant="outline"
            className="border-[#121316] text-[#121316] hover:bg-zinc-100 font-bold text-xs flex items-center gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            UPLOAD CSV
          </Button>

          <Button
            onClick={() => setShowNewCampaignModal(true)}
            className="bg-[#121316] hover:bg-black text-white font-bold text-xs border border-[#121316] shadow-[2px_2px_0px_#ff2a3b] flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 text-[#ff2a3b]" />
            NEW AI CAMPAIGN
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-[#121316] bg-white p-3.5 shadow-[2px_2px_0px_#121316]">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center justify-between">
            <span>Total Leads in CRM</span>
            <Users className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div className="text-xl font-black text-[#121316] mt-1">{leads.length}</div>
          <div className="text-[9px] text-zinc-500 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Live Synced
          </div>
        </div>

        <div className="border border-[#121316] bg-white p-3.5 shadow-[2px_2px_0px_#121316]">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center justify-between">
            <span>Active Campaigns</span>
            <Send className="h-3.5 w-3.5 text-[#ff2a3b]" />
          </div>
          <div className="text-xl font-black text-[#121316] mt-1">{campaigns.length}</div>
          <div className="text-[9px] text-zinc-500 mt-0.5">WhatsApp / Email Sequences</div>
        </div>

        <div className="border border-[#121316] bg-white p-3.5 shadow-[2px_2px_0px_#121316]">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center justify-between">
            <span>Contacted Prospects</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-[#121316] mt-1">
            {leads.filter((l) => l.status !== "new").length}
          </div>
          <div className="text-[9px] text-zinc-500 mt-0.5">Dispatched Outreaches</div>
        </div>

        <div className="border border-[#121316] bg-white p-3.5 shadow-[2px_2px_0px_#121316]">
          <div className="text-[10px] text-zinc-500 font-bold uppercase flex items-center justify-between">
            <span>Prospect Reply Rate</span>
            <TrendingUp className="h-3.5 w-3.5 text-cyan-500" />
          </div>
          <div className="text-xl font-black text-[#121316] mt-1">{replyRate}%</div>
          <div className="text-[9px] text-emerald-600 font-bold mt-0.5">
            {repliedLeadsCount} Engaged in Dialogue
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#121316] gap-2">
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2 text-xs font-bold uppercase border-t border-x border-[#121316] transition-all ${
            activeTab === "leads"
              ? "bg-[#121316] text-white shadow-[2px_-2px_0px_#ff2a3b]"
              : "bg-zinc-100 text-[#121316] hover:bg-zinc-200"
          }`}
        >
          // Prospects &amp; Leads ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 text-xs font-bold uppercase border-t border-x border-[#121316] transition-all ${
            activeTab === "campaigns"
              ? "bg-[#121316] text-white shadow-[2px_-2px_0px_#ff2a3b]"
              : "bg-zinc-100 text-[#121316] hover:bg-zinc-200"
          }`}
        >
          // Outbound AI Campaigns ({campaigns.length})
        </button>
      </div>

      {/* TAB 1: LEADS & CRM VIEW */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 border border-[#121316]">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">Filter:</span>
              {["all", "new", "contacted", "replied", "brochure_sent"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase border transition-all ${
                    statusFilter === st
                      ? "bg-[#121316] text-white border-[#121316]"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-black"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-zinc-500 font-medium">
              Showing <strong className="text-[#121316]">{filteredLeads.length}</strong> of {leads.length} records
            </div>
          </div>

          {/* Leads Table */}
          <div className="border border-[#121316] bg-white shadow-[3px_3px_0px_#121316] overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8f8fa] border-b border-[#121316] text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                  <th className="p-3">Prospect &amp; Company</th>
                  <th className="p-3">Channel / Coordinates</th>
                  <th className="p-3">Specific Requirement</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions &amp; Dialogue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-sans">
                {filteredLeads.map((lead) => {
                  const isReplied = lead.status === "replied" || lead.status === "brochure_sent";
                  return (
                    <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-[#121316] font-mono text-xs">{lead.name}</div>
                        <div className="text-[11px] text-zinc-600">{lead.company}</div>
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-emerald-700">
                            <Smartphone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-blue-700 mt-0.5">
                            <Mail className="h-3 w-3" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="text-xs text-zinc-800 font-medium">{lead.interest}</div>
                        {lead.notes && <div className="text-[10px] text-zinc-500 italic mt-0.5">{lead.notes}</div>}
                      </td>

                      <td className="p-3 font-mono">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase inline-block border ${
                            lead.status === "new"
                              ? "bg-zinc-100 text-zinc-700 border-zinc-300"
                              : lead.status === "contacted"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : lead.status === "replied"
                              ? "bg-cyan-50 text-cyan-800 border-cyan-400"
                              : "bg-emerald-50 text-emerald-800 border-emerald-400"
                          }`}
                        >
                          {lead.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-3 text-right font-mono space-x-1.5">
                        {/* Dynamic AI Proposal Button */}
                        <Button
                          onClick={() => handleOpenProposal(lead)}
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-7 px-2 font-bold border-emerald-600 text-emerald-800 hover:bg-emerald-600 hover:text-white"
                          title="Generate, preview, or dispatch an executive PDF proposal with commercial quote"
                        >
                          <FileText className="h-2.5 w-2.5 mr-1 text-emerald-600" />
                          PROPOSAL
                        </Button>

                        {/* Simulate Lead Reply button */}
                        <Button
                          onClick={() => handleSimulateReply(lead.id, lead.name, lead.channel)}
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-7 px-2 font-bold border-[#121316] text-[#121316] hover:bg-[#ff2a3b] hover:text-white hover:border-[#ff2a3b]"
                          title="Simulate this prospect replying on WhatsApp/Email and watch AI answer with the brochure"
                        >
                          <Play className="h-2.5 w-2.5 mr-1" />
                          TEST REPLY
                        </Button>

                        {/* Jump to Inbox */}
                        <Link href="/dashboard/inbox">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-[10px] h-7 px-2 font-bold border-zinc-300 text-zinc-700 hover:border-black"
                            title="Open in Omnichannel Inbox"
                          >
                            <MessageSquare className="h-2.5 w-2.5 mr-1" />
                            INBOX
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGNS VIEW */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="border border-[#121316] bg-white p-5 shadow-[3px_3px_0px_#121316] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-2">
                    <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-700 font-bold uppercase">
                      CHANNEL: {camp.channel.toUpperCase()}
                    </span>
                    <span
                      className={`font-bold uppercase ${
                        camp.status === "completed" ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      ● {camp.status}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#121316] uppercase tracking-tight">{camp.name}</h3>

                  <p className="text-xs text-zinc-600 mt-2 font-sans line-clamp-2">{camp.objective}</p>

                  {camp.brochure_filename && (
                    <div className="mt-3 p-2 bg-[#f8f8fa] border border-zinc-200 text-[11px] flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#ff2a3b]" />
                      <span className="text-zinc-700 font-mono">Attachment: {camp.brochure_filename}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-200 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Dispatched</div>
                      <div className="font-bold text-[#121316]">{camp.sent_count} / {camp.total_leads}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase font-bold">Replied</div>
                      <div className="font-bold text-emerald-600">{camp.replied_count}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleViewLogs(camp.id)}
                    size="sm"
                    variant="outline"
                    className="border-[#121316] text-[#121316] text-[11px] font-bold h-8"
                  >
                    VIEW LOGS →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIALOGUE PREVIEW MODAL (After Test Reply) */}
      {dialoguePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#121316] pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[10px] uppercase">
                  LIVE DIALOGUE CAPTURE
                </span>
                <h3 className="font-black text-sm text-[#121316] uppercase">
                  Back-and-Forth: {dialoguePreview.leadName} ({dialoguePreview.channel.toUpperCase()})
                </h3>
              </div>
              <button onClick={() => setDialoguePreview(null)} className="hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Inbound Customer Reply */}
            <div className="p-3 bg-zinc-100 border border-zinc-300 rounded text-xs space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                <Users className="h-3 w-3 text-zinc-600" />
                <span>Prospect Message ({dialoguePreview.leadName})</span>
              </div>
              <p className="text-zinc-800 font-sans italic">&quot;{dialoguePreview.customerReply}&quot;</p>
            </div>

            {/* AI Grounded Catalog Response */}
            <div className="p-4 bg-emerald-50 border border-emerald-400 rounded text-xs space-y-1.5">
              <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>Synthopsis AI Agent Response (Grounded in Brochure Knowledge)</span>
              </div>
              <p className="text-emerald-950 font-sans whitespace-pre-wrap">{dialoguePreview.aiReply}</p>
            </div>

            {/* Generated PDF Proposal Card (if attached) */}
            {dialoguePreview.proposal && (
              <div className="p-3 bg-white border-2 border-emerald-500 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_#10b981]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 rounded text-emerald-800 font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#121316]">
                      {dialoguePreview.proposal.title || "Custom AI Solution Proposal & Quote"}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      Estimated Investment: <strong className="text-emerald-700">₹{Math.round(dialoguePreview.proposal.pricing_total || 0).toLocaleString()}</strong> (incl. 18% GST)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={dialoguePreview.proposal.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-[10px] font-bold bg-[#121316] text-white hover:bg-black rounded"
                  >
                    PREVIEW PDF ↗
                  </a>
                  <a
                    href={dialoguePreview.proposal.public_url}
                    download
                    className="px-2.5 py-1 text-[10px] font-bold border border-[#121316] text-[#121316] hover:bg-zinc-100 rounded"
                  >
                    DOWNLOAD
                  </a>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-zinc-500 text-[11px]">
                Full conversation synced to Omnichannel Inbox.
              </span>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/inbox">
                  <Button size="sm" className="bg-[#121316] text-white font-bold text-xs">
                    OPEN IN OMNI INBOX →
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => setDialoguePreview(null)}>
                  CLOSE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW CAMPAIGN MODAL */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#121316] pb-3">
              <h3 className="font-black text-sm text-[#121316] uppercase flex items-center gap-2">
                <Send className="h-4 w-4 text-[#ff2a3b]" />
                Launch Outbound AI Campaign
              </h3>
              <button onClick={() => setShowNewCampaignModal(false)} className="hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-700 uppercase text-[10px]">Campaign Name</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full mt-1 p-2 border border-[#121316] font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 uppercase text-[10px]">Channel</label>
                  <select
                    value={campaignForm.channel}
                    onChange={(e) => setCampaignForm({ ...campaignForm, channel: e.target.value })}
                    className="w-full mt-1 p-2 border border-[#121316] font-mono text-xs"
                  >
                    <option value="whatsapp">WhatsApp (Phone Bridge)</option>
                    <option value="email">Email (Gmail / SMTP)</option>
                    <option value="both">Both (Omnichannel)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 uppercase text-[10px]">Brochure / Catalog</label>
                  <input
                    type="text"
                    value={campaignForm.brochure_filename}
                    onChange={(e) => setCampaignForm({ ...campaignForm, brochure_filename: e.target.value })}
                    placeholder="e.g. ApexRig_Gaming_PC_Catalog_2026.txt"
                    className="w-full mt-1 p-2 border border-[#121316] font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 uppercase text-[10px]">Campaign Objective &amp; Prompt Hook</label>
                <textarea
                  rows={3}
                  value={campaignForm.objective}
                  onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })}
                  className="w-full mt-1 p-2 border border-[#121316] font-sans text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewCampaignModal(false)}>
                CANCEL
              </Button>
              <Button
                size="sm"
                disabled={isLoading}
                onClick={handleLaunchCampaign}
                className="bg-[#121316] hover:bg-black text-white font-bold shadow-[2px_2px_0px_#ff2a3b]"
              >
                {isLoading ? "GENERATING & DISPATCHING..." : "LAUNCH AI CAMPAIGN NOW"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CSV UPLOAD MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#121316] pb-3">
              <h3 className="font-black text-sm text-[#121316] uppercase flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Upload Prospects via CSV
              </h3>
              <button onClick={() => setShowCsvModal(false)} className="hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 font-sans">
              Paste or edit the comma-separated prospect data below. Required columns: <code>Name, Phone, Email, Company, Interest</code>.
            </p>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-2 border border-[#121316] font-mono text-[11px] bg-zinc-50"
            />

            <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCsvModal(false)}>
                CANCEL
              </Button>
              <Button
                size="sm"
                disabled={isLoading}
                onClick={handleUploadCsv}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isLoading ? "PARSING LEADS..." : "IMPORT LEADS TO CRM"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CAMPAIGN LOGS MODAL */}
      {selectedCampaignLogs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#121316] pb-3">
              <h3 className="font-black text-sm text-[#121316] uppercase">
                Campaign Delivery &amp; AI Message Logs ({selectedCampaignLogs.length})
              </h3>
              <button onClick={() => setSelectedCampaignLogs(null)} className="hover:opacity-70">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedCampaignLogs.map((log) => (
                <div key={log.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="font-bold text-[#121316]">{log.lead_name} ({log.lead_company})</span>
                    <span className="text-zinc-500">{log.sent_at} ● {log.status}</span>
                  </div>
                  <p className="text-zinc-700 font-sans whitespace-pre-wrap">{log.message_sent}</p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-200 text-right">
              <Button size="sm" variant="outline" onClick={() => setSelectedCampaignLogs(null)}>
                CLOSE LOGS
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC PROPOSAL PREVIEWER & DISPATCH MODAL */}
      {proposalModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#121316] shadow-[8px_8px_0px_#121316] max-w-4xl w-full p-6 space-y-4 max-h-[92vh] overflow-y-auto font-mono">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#121316] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#121316] text-[#00F2FE]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    MODULE 07 // REPORTLAB PLATYPUS ENGINE
                  </div>
                  <h3 className="font-black text-sm text-[#121316] uppercase">
                    Executive Proposal &amp; Quotation // {proposalModal.lead?.name} ({proposalModal.lead?.company})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setProposalModal((prev) => ({ ...prev, isOpen: false }))}
                className="hover:opacity-70 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f8f8fa] p-3 border border-zinc-200 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Prospect Requirement</span>
                <span className="font-bold text-[#121316] text-[11px]">{proposalModal.lead?.interest}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Estimated Contract Value</span>
                <span className="font-black text-emerald-700 text-sm">
                  {proposalModal.proposal ? `₹${Math.round(proposalModal.proposal.pricing_total).toLocaleString()} (with GST)` : "Compiling..."}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">Channel &amp; Target</span>
                <span className="font-bold text-zinc-800 text-[11px]">
                  {proposalModal.lead?.channel.toUpperCase()} ● {proposalModal.lead?.phone || proposalModal.lead?.email || "Direct"}
                </span>
              </div>
            </div>

            {/* PDF Viewer / Compilation State */}
            {proposalModal.isGenerating ? (
              <div className="h-[480px] border border-dashed border-[#121316] bg-zinc-50 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-8 w-8 text-[#00F2FE] animate-spin" />
                <div className="text-center font-mono">
                  <div className="text-xs font-bold text-[#121316] uppercase">Synthesizing Proposal with AI &amp; ReportLab...</div>
                  <div className="text-[10px] text-zinc-500 mt-1">Generating problem diagnosis, ROI impact cards, and commercial GST breakdown.</div>
                </div>
              </div>
            ) : proposalModal.proposal?.public_url ? (
              <div className="border border-[#121316] bg-zinc-100 overflow-hidden shadow-[2px_2px_0px_#121316]">
                <iframe
                  src={proposalModal.proposal.public_url}
                  className="w-full h-[480px] bg-white"
                  title="Proposal PDF Preview"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                No proposal loaded yet. Click Re-Generate below.
              </div>
            )}

            {/* Custom Commercial Recalculation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-2 text-xs">
                <label className="text-[10px] font-bold text-zinc-600 uppercase">Adjust Deal Budget (₹):</label>
                <input
                  type="number"
                  value={proposalModal.dealValueInput}
                  onChange={(e) => setProposalModal((prev) => ({ ...prev, dealValueInput: e.target.value }))}
                  className="px-2 py-1 text-xs border border-zinc-300 w-28 font-mono bg-white"
                  placeholder="450000"
                />
                <Button
                  onClick={handleRegenerateProposal}
                  disabled={proposalModal.isGenerating}
                  size="sm"
                  variant="outline"
                  className="text-[10px] h-7 font-bold border-[#121316]"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                  RE-GENERATE
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {proposalModal.proposal?.public_url && (
                  <>
                    <a
                      href={proposalModal.proposal.public_url}
                      download
                      className="px-3 py-1.5 text-xs font-bold border border-[#121316] bg-white text-[#121316] hover:bg-zinc-100 inline-flex items-center gap-1 shadow-[2px_2px_0px_#121316]"
                    >
                      <Upload className="h-3.5 w-3.5 rotate-180" />
                      DOWNLOAD PDF
                    </a>

                    <Button
                      onClick={handleDispatchProposalWhatsapp}
                      disabled={proposalModal.isSendingWhatsapp}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#121316]"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      {proposalModal.isSendingWhatsapp ? "DISPATCHING..." : "SEND ON WHATSAPP"}
                    </Button>
                  </>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setProposalModal((prev) => ({ ...prev, isOpen: false }))}
                  className="text-xs font-bold"
                >
                  CLOSE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
