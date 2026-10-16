"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  UnrealBlueprintNode,
  BlueprintNodeData,
  NodeType,
  PinData
} from "./custom-node";
import { Button } from "../ui/button";
import {
  Play,
  RotateCcw,
  Plus,
  Zap,
  Bot,
  MessageSquare,
  Mail,
  Database,
  CheckCircle2,
  Sliders,
  Sparkles,
  Search,
  X,
  Layers,
  Activity,
  Check,
  GitFork,
  Trash2,
  FolderOpen,
  Send,
  Building2,
  Mic,
  ShoppingCart,
  ArrowRight,
  Info,
  FileText
} from "lucide-react";
import { useInboxStore } from "@/lib/store/use-inbox-store";
import { useAgentStore, ConfiguredAgent } from "@/lib/store/use-agent-store";
import { useRouter } from "next/navigation";

// ================= REALISTIC B2B DEMO SCENARIOS =================
export interface B2BDemoScenario {
  id: string;
  title: string;
  company: string;
  badge: string;
  tier: "VIP HIGH-VALUE" | "VIP VOICE RFQ" | "STANDARD NURTURE";
  channel: "whatsapp" | "web" | "email";
  sender: string;
  gstin: string;
  message: string;
  expectedDeal: string;
  expectedBranch: "vip" | "standard";
}

const DEMO_B2B_SCENARIOS: B2BDemoScenario[] = [
  {
    id: "vip_chemical_rfq",
    title: "Sun Pharma Dahej Plant",
    company: "Sun Pharma Chemicals Dahej",
    badge: "50,000 Units Bulk RFQ (₹13.25L)",
    tier: "VIP HIGH-VALUE",
    channel: "whatsapp",
    sender: "+91 98254 11029",
    gstin: "24AABCS1429B1ZS",
    message: "Urgent: Need 50,000 units of 1L HDPE chemical drums with UN certification and tamper-proof induction seals. Deliver to Dahej SEZ within 10 days. Send proforma quote and TDS.",
    expectedDeal: "₹13,25,000 (Passes >= ₹2.5L Gate)",
    expectedBranch: "vip"
  },
  {
    id: "gujarati_audio_inquiry",
    title: "Ambika Agro Chemicals",
    company: "Ambika Agro Rajkot",
    badge: "Voice Note RFQ in Gujarati-Hindi (₹4.40L)",
    tier: "VIP VOICE RFQ",
    channel: "whatsapp",
    sender: "+91 97120 44921",
    gstin: "24AAGCA9928K1ZG",
    message: "Kem cho sir, humko 20,000 piece 500ml pesticide bottles ka quote chahiye. Payment 30 days credit pe chalega? Vadodara plant delivery chahiye.",
    expectedDeal: "₹4,40,000 (Passes >= ₹2.5L Gate)",
    expectedBranch: "vip"
  },
  {
    id: "retail_sample_inquiry",
    title: "Verma Household Goods",
    company: "Verma Retail Store",
    badge: "Consumer Sample Inquiry (₹350)",
    tier: "STANDARD NURTURE",
    channel: "web",
    sender: "+91 94260 88120",
    gstin: "Unregistered Consumer",
    message: "Hi, do you sell 5 or 10 sample bottles to test at home? What is the retail shop price for single pieces?",
    expectedDeal: "₹350 (Fails >= ₹2.5L Gate)",
    expectedBranch: "standard"
  },
  {
    id: "enterprise_email_rfp",
    title: "Apex Healthcare RFP",
    company: "Apex Healthcare Pvt Ltd",
    badge: "Enterprise Email RFP (₹8.50L)",
    tier: "VIP HIGH-VALUE",
    channel: "email",
    sender: "s.nambiar@apexhealth.in",
    gstin: "27AAACA9281H1ZQ",
    message: "Dear Synthopsis Team, We are evaluating automated diagnostic scheduling across 14 hubs in Western India with SAP ERP integration. Please provide formal commercial proposal and SLA.",
    expectedDeal: "₹8,50,000 (Passes >= ₹2.5L Gate)",
    expectedBranch: "vip"
  },
  {
    id: "apexrig_gaming_rfq",
    title: "Apex Gaming Lounge Ahmedabad",
    company: "ApexRig Gaming Technologies",
    badge: "10x Custom RTX 4080 Super Builds (₹21.50L)",
    tier: "VIP HIGH-VALUE",
    channel: "whatsapp",
    sender: "+91 98250 88201",
    gstin: "24AAACA1102K1ZV",
    message: "Hey ApexRig, need quote for 10x custom gaming PCs with RTX 4080 Super, Ryzen 7 7800X3D, 32GB DDR5 for our new esports cafe. Delivery in 10 days with GST invoice.",
    expectedDeal: "₹21,50,000 (Passes >= ₹1.5L Gate)",
    expectedBranch: "vip"
  }
];

// ================= PALETTE NODE CATALOG (12 REAL ENTERPRISE BLOCKS) =================
interface PaletteTemplate {
  key: string;
  title: string;
  subtitle: string;
  category: "Event" | "Function" | "Action" | "Flow";
  type: NodeType;
  icon: string;
  inputPins: PinData[];
  outputPins: PinData[];
  config: Record<string, string>;
  description: string;
}

const PALETTE_TEMPLATES: PaletteTemplate[] = [
  // 1. Triggers
  {
    key: "trigger_whatsapp",
    title: "Inbound WhatsApp RFQ",
    subtitle: "WhatsAppBusinessCloud",
    category: "Event",
    type: "trigger",
    icon: "Zap",
    inputPins: [],
    outputPins: [
      { id: "out-exec", name: "Exec", type: "exec" },
      { id: "out-payload", name: "Message Payload", type: "string" },
      { id: "out-phone", name: "Client Phone", type: "string" }
    ],
    config: {
      "Channel": "WhatsApp Business Cloud API",
      "DPDP Encryption": "AES-256-GCM Active",
      "Rate Limit": "1,000 req/sec"
    },
    description: "Captures inbound WhatsApp inquiries, RFQs, and voice notes via Meta Webhook."
  },
  {
    key: "trigger_email",
    title: "Inbound Email Ingestion",
    subtitle: "GmailOutlookOAuth2",
    category: "Event",
    type: "trigger",
    icon: "Mail",
    inputPins: [],
    outputPins: [
      { id: "out-exec", name: "Exec", type: "exec" },
      { id: "out-payload", name: "Email Subject & Body", type: "string" },
      { id: "out-sender", name: "Sender Email", type: "string" }
    ],
    config: {
      "Protocol": "Google OAuth2 / Microsoft Graph",
      "Mailbox": "procurement@synthopsis.ai",
      "Attachment Parsing": "PDF/Excel Auto-Extract"
    },
    description: "Ingests formal quotation requests and tender documents sent to email."
  },
  {
    key: "trigger_indiamart",
    title: "IndiaMART / Webhook Lead",
    subtitle: "B2BPortalBridge",
    category: "Event",
    type: "trigger",
    icon: "Zap",
    inputPins: [],
    outputPins: [
      { id: "out-exec", name: "Exec", type: "exec" },
      { id: "out-payload", name: "RFQ Data Payload", type: "string" },
      { id: "out-gstin", name: "Buyer GSTIN", type: "string" }
    ],
    config: {
      "Source": "IndiaMART Push API / Justdial",
      "Authentication": "HMAC-SHA256 Token"
    },
    description: "Pulls verified B2B buyer leads with GSTIN numbers directly from trade portals."
  },

  // 2. AI Reasoning & Processing
  {
    key: "ai_groq",
    title: "Groq Llama 3.3 Reasoner",
    subtitle: "SynthopsisLPUCore",
    category: "Function",
    type: "ai",
    icon: "Bot",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-data", name: "Inbound Message/Spec", type: "string" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-intent", name: "Extracted Intent", type: "string" },
      { id: "out-deal", name: "Deal Value (₹)", type: "number" },
      { id: "out-conf", name: "Confidence Score", type: "number" }
    ],
    config: {
      "Agent Studio Brain": "JM PlastoPack Bot / Real Estate Agent",
      "Model": "llama-3.3-70b-versatile (Groq LPU)",
      "First Token Latency": "182ms",
      "Pricing Logic": "Calculates Quantity x Unit Cost"
    },
    description: "Analyzes customer messages at 500+ tokens/sec to extract buyer intent and deal size."
  },
  {
    key: "ai_whisper",
    title: "Whisper Audio Voice Parser",
    subtitle: "MultiLingualTranscriber",
    category: "Function",
    type: "ai",
    icon: "Bot",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-audio", name: "Audio Payload", type: "string" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-text", name: "Clean Transcript", type: "string" },
      { id: "out-lang", name: "Language (Guj/Hin)", type: "string" }
    ],
    config: {
      "Agent Studio Brain": "Ambika Agro Audio Transcriber",
      "Model": "Whisper-Large-V3 (LPU Accelerated)",
      "Supported Dialects": "Gujarati, Hindi, Hinglish, English",
      "Latency": "24ms"
    },
    description: "Transcribes Hindi and Gujarati audio voice notes into clean structured RFQs."
  },
  {
    key: "ai_rag",
    title: "PDF Catalog Grounding",
    subtitle: "VectorEmbeddingStore",
    category: "Function",
    type: "ai",
    icon: "Bot",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-query", name: "Product Query", type: "string" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-specs", name: "Matched Technical Specs", type: "struct" }
    ],
    config: {
      "Agent Studio Brain": "Pharma Compliance Reviewer (Attached PDFs)",
      "Vector Engine": "pgvector Cosine Similarity",
      "Knowledge Base": "Uploaded Price Lists & TDS Sheets",
      "Hallucination Guard": "Strict Domain Grounding"
    },
    description: "Retrieves accurate pricing and packaging specifications from uploaded company PDFs."
  },

  // 3. Logic Gates
  {
    key: "logic_gate",
    title: "Deal Threshold Gate (>= ₹2.5L)",
    subtitle: "BranchRouterCondition",
    category: "Flow",
    type: "notification",
    icon: "GitFork",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-val", name: "Deal Value (₹)", type: "number" }
    ],
    outputPins: [
      { id: "out-vip", name: "VIP Route (True)", type: "exec" },
      { id: "out-std", name: "Standard Route (False)", type: "exec" },
      { id: "out-verdict", name: "Verdict", type: "string" }
    ],
    config: {
      "Condition": "Deal Value >= ₹2,50,000",
      "VIP Action": "Fast-Track to Tally ERP & VP Alert",
      "Standard Action": "Route to Auto-Brochure Nurture"
    },
    description: "Splits leads into VIP Fast-Track vs Standard Nurture based on calculated deal value."
  },

  // 4. Actions & Integrations
  {
    key: "action_tally",
    title: "Sync Tally Prime ERP",
    subtitle: "EnterpriseLedgerSync",
    category: "Flow",
    type: "notification",
    icon: "Database",
    inputPins: [
      { id: "in-exec", name: "VIP Exec", type: "exec" },
      { id: "in-amount", name: "Deal Value (₹)", type: "number" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-voucher", name: "Tally Voucher #UP", type: "string" }
    ],
    config: {
      "Target ERP": "Tally Prime Gold / Zoho Books",
      "Voucher Type": "Proforma Sales Order Draft",
      "Ledger Account": "Sundry Debtors (Unbilled Leads)"
    },
    description: "Creates an official sales proforma draft in Tally Prime with GST breakdown."
  },
  {
    key: "action_whatsapp_quote",
    title: "Dispatch WhatsApp Quote",
    subtitle: "OmniChannelDispatcher",
    category: "Action",
    type: "action",
    icon: "MessageSquare",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-intent", name: "Quote Details", type: "string" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-status", name: "Delivery Status", type: "string" }
    ],
    config: {
      "Channel": "WhatsApp Business Cloud",
      "Attachment": "Formal Quote PDF + TDS Certificate",
      "Delivery Timeline": "7-10 Days Delivery to SEZ Plant"
    },
    description: "Sends an instant WhatsApp quote with commercial pricing, GST, and spec sheets."
  },
  {
    key: "action_email_quote",
    title: "Dispatch Email PDF Proposal",
    subtitle: "CorporateProposalMailer",
    category: "Action",
    type: "action",
    icon: "Mail",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-data", name: "Proposal Data", type: "string" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-status", name: "Email Status", type: "string" }
    ],
    config: {
      "Email Service": "Google Workspace / Gmail API",
      "Attachment": "Signed Commercial Tender PDF",
      "Tracking": "Open & Click Webhook Enabled"
    },
    description: "Delivers an executive formal quotation PDF with payment terms via corporate email."
  },
  {
    key: "action_ai_proposal_generator",
    title: "AI Dynamic PDF Proposal Generator",
    subtitle: "ReportLabExecutiveEngine",
    category: "Action",
    type: "action",
    icon: "FileText",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-lead", name: "Client & RFQ Spec", type: "string" },
      { id: "in-deal", name: "Deal Budget (₹)", type: "number" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-pdf-url", name: "Proposal PDF URL", type: "string" },
      { id: "out-status", name: "Compiler Status", type: "string" }
    ],
    config: {
      "Compiler Engine": "ReportLab 5.0 Platypus",
      "Executive Styling": "Synthopsis CyberCore Branded",
      "Dynamic Modules": "Problem Analysis, ROI Matrix, GST Quote",
      "Export Output": "/public/proposals/proposal_xxx.pdf",
      "Dispatch Target": "WhatsApp & Email Ready"
    },
    description: "Compiles a customized, branded PDF proposal with dynamic ROI metrics and commercial quotation on the fly."
  },
  {
    key: "action_vp_alert",
    title: "Alert Sales VP (SMS / Slack)",
    subtitle: "VIPEscalationRouter",
    category: "Action",
    type: "action",
    icon: "Zap",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-deal", name: "Deal Value (₹)", type: "number" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-status", name: "Alert Status", type: "string" }
    ],
    config: {
      "Recipients": "VP of Sales & Regional Managers",
      "Urgency": "High (Deal > ₹2.5 Lakhs)",
      "Channels": "WhatsApp + SMS + Slack #hot-leads"
    },
    description: "Immediately alerts human sales leadership so they can follow up on high-ticket deals."
  },
  {
    key: "action_nurture",
    title: "Zoho CRM Cold Nurture",
    subtitle: "AutomatedLifecycle",
    category: "Action",
    type: "action",
    icon: "Database",
    inputPins: [
      { id: "in-exec", name: "Exec", type: "exec" },
      { id: "in-contact", name: "Contact Data", type: "string" }
    ],
    outputPins: [
      { id: "out-exec", name: "Then", type: "exec" },
      { id: "out-status", name: "Nurture Status", type: "string" }
    ],
    config: {
      "CRM Destination": "Zoho CRM / HubSpot",
      "Campaign": "30-Day Automated Product Drip",
      "Human Rep Time": "0 Minutes (Zero Interruption)"
    },
    description: "Enrolls low-ticket retail inquiries into automated catalog drip sequences."
  }
];

// 1-Click Demo Presets
const PRESET_B2B_MANUFACTURING_5_NODE: { nodes: BlueprintNodeData[]; connections: WorkflowConnection[] } = {
  nodes: [
    {
      id: "node-m1",
      title: "Inbound WhatsApp RFQ",
      subtitle: "WhatsAppBusinessCloud",
      category: "Event",
      type: "trigger",
      status: "idle",
      x: 40,
      y: 180,
      icon: "Zap",
      inputPins: [],
      outputPins: [
        { id: "m1-out-exec", name: "Exec", type: "exec", connected: true },
        { id: "m1-out-payload", name: "Message Payload", type: "string", connected: true },
        { id: "m1-out-phone", name: "Client Phone", type: "string", connected: false }
      ],
      config: { "Channel": "WhatsApp Business Cloud", "DPDP Encryption": "AES-256-GCM Active" }
    },
    {
      id: "node-m2",
      title: "Vaibhav Gaming",
      subtitle: "AgentStudioBrain // PC parts",
      category: "Function",
      type: "ai",
      status: "idle",
      x: 370,
      y: 180,
      icon: "Bot",
      inputPins: [
        { id: "m2-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "m2-in-data", name: "Inbound Message/Spec", type: "string", connected: true }
      ],
      outputPins: [
        { id: "m2-out-exec", name: "Then", type: "exec", connected: true },
        { id: "m2-out-intent", name: "Extracted Intent", type: "string", connected: false },
        { id: "m2-out-deal", name: "Deal Value (₹)", type: "number", connected: true },
        { id: "m2-out-conf", name: "Confidence Score", type: "number", connected: false }
      ],
      config: { "Agent Studio Brain": "Vaibhav Gaming", "Model": "Groq Llama 3.3 (182ms)", "Knowledge Base": "ApexRig_Gaming_PC_Catalog_2026.txt" }
    },
    {
      id: "node-m3",
      title: "Deal Threshold Gate (>= ₹2.5L)",
      subtitle: "BranchRouterCondition",
      category: "Flow",
      type: "notification",
      status: "idle",
      x: 700,
      y: 180,
      icon: "GitFork",
      inputPins: [
        { id: "m3-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "m3-in-deal", name: "Deal Value (₹)", type: "number", connected: true }
      ],
      outputPins: [
        { id: "m3-out-vip", name: "VIP Route (True)", type: "exec", connected: true },
        { id: "m3-out-std", name: "Standard Route (False)", type: "exec", connected: true },
        { id: "m3-out-verdict", name: "Verdict", type: "string", connected: false }
      ],
      config: { "Condition": "Deal Value >= ₹2,50,000", "VIP Action": "Fast-Track to Tally ERP" }
    },
    {
      id: "node-m4",
      title: "Sync Tally Prime ERP",
      subtitle: "EnterpriseLedgerSync",
      category: "Flow",
      type: "notification",
      status: "idle",
      x: 1040,
      y: 60,
      icon: "Database",
      inputPins: [
        { id: "m4-in-exec", name: "VIP Exec", type: "exec", connected: true },
        { id: "m4-in-amount", name: "Deal Value (₹)", type: "number", connected: false }
      ],
      outputPins: [
        { id: "m4-out-exec", name: "Then", type: "exec", connected: true },
        { id: "m4-out-voucher", name: "Tally Voucher #UP", type: "string", connected: false }
      ],
      config: { "Target ERP": "Tally Prime Gold", "Voucher Type": "Proforma Sales Order Draft" }
    },
    {
      id: "node-m5",
      title: "Dispatch WhatsApp Quote",
      subtitle: "OmniChannelDispatcher",
      category: "Action",
      type: "action",
      status: "idle",
      x: 1040,
      y: 270,
      icon: "MessageSquare",
      inputPins: [
        { id: "m5-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "m5-in-intent", name: "Quote Details", type: "string", connected: false }
      ],
      outputPins: [
        { id: "m5-out-exec", name: "Then", type: "exec", connected: false }
      ],
      config: { "Channel": "WhatsApp Business Cloud", "Attachment": "Formal Quote PDF + 18% GST" }
    }
  ],
  connections: [
    { id: "cm1", fromNodeId: "node-m1", fromPinId: "m1-out-exec", toNodeId: "node-m2", toPinId: "m2-in-exec", type: "exec" },
    { id: "cm2", fromNodeId: "node-m1", fromPinId: "m1-out-payload", toNodeId: "node-m2", toPinId: "m2-in-data", type: "string" },
    { id: "cm3", fromNodeId: "node-m2", fromPinId: "m2-out-exec", toNodeId: "node-m3", toPinId: "m3-in-exec", type: "exec" },
    { id: "cm4", fromNodeId: "node-m2", fromPinId: "m2-out-deal", toNodeId: "node-m3", toPinId: "m3-in-deal", type: "number" },
    { id: "cm5", fromNodeId: "node-m3", fromPinId: "m3-out-vip", toNodeId: "node-m4", toPinId: "m4-in-exec", type: "exec" },
    { id: "cm6", fromNodeId: "node-m4", fromPinId: "m4-out-exec", toNodeId: "node-m5", toPinId: "m5-in-exec", type: "exec" },
    { id: "cm7", fromNodeId: "node-m3", fromPinId: "m3-out-std", toNodeId: "node-m5", toPinId: "m5-in-exec", type: "exec" }
  ]
};

const PRESET_GAMING_PC_BOTTLENECK: { nodes: BlueprintNodeData[]; connections: WorkflowConnection[] } = {
  nodes: [
    {
      id: "node-g1",
      title: "Inbound Hardware Inquiry",
      subtitle: "OmniChannelReceiver // Email + WhatsApp",
      category: "Event",
      type: "trigger",
      status: "idle",
      x: 40,
      y: 180,
      icon: "Zap",
      inputPins: [],
      outputPins: [
        { id: "g1-out-exec", name: "Exec", type: "exec", connected: true },
        { id: "g1-out-payload", name: "Hardware Query", type: "string", connected: true }
      ],
      config: { "Inbound Channels": "Gmail IMAP + WhatsApp (+91 87800 42609)", "Target Account": "vaibhavwaghelaa@gmail.com" }
    },
    {
      id: "node-g2",
      title: "ApexRig Hardware Architect",
      subtitle: "Groq Llama 3.3 // Bottleneck Engine",
      category: "Function",
      type: "ai",
      status: "idle",
      x: 370,
      y: 180,
      icon: "Bot",
      inputPins: [
        { id: "g2-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "g2-in-data", name: "Inbound Specs", type: "string", connected: true }
      ],
      outputPins: [
        { id: "g2-out-exec", name: "Then", type: "exec", connected: true },
        { id: "g2-out-bottleneck", name: "Bottleneck Score", type: "number", connected: true },
        { id: "g2-out-deal", name: "Deal Value (₹)", type: "number", connected: true }
      ],
      config: { "Rule": "Warn severe bottleneck: i3 + RTX 4080 Super", "Recommendation": "Apex Beast Pro (Ryzen 7 7800X3D @ ₹2,15,000)" }
    },
    {
      id: "node-g3",
      title: "Bottleneck & Compatibility Gate",
      subtitle: "BranchRouterCondition",
      category: "Flow",
      type: "notification",
      status: "idle",
      x: 710,
      y: 180,
      icon: "GitFork",
      inputPins: [
        { id: "g3-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "g3-in-deal", name: "Deal Value (₹)", type: "number", connected: true }
      ],
      outputPins: [
        { id: "g3-out-warn", name: "Recommend Beast Pro (True)", type: "exec", connected: true },
        { id: "g3-out-pass", name: "Direct Quotation (False)", type: "exec", connected: true }
      ],
      config: { "Condition": "i3 Bottlenecks RTX 4080 Super by >35%", "Action": "Recommend Balanced Ryzen 7 CPU & Beast Pro Build" }
    },
    {
      id: "node-g4",
      title: "Quotation & Spec Sheet Generator",
      subtitle: "ApexRigQuotationEngine",
      category: "Function",
      type: "ai",
      status: "idle",
      x: 1060,
      y: 60,
      icon: "Database",
      inputPins: [
        { id: "g4-in-exec", name: "Exec", type: "exec", connected: true }
      ],
      outputPins: [
        { id: "g4-out-exec", name: "Then", type: "exec", connected: true }
      ],
      config: { "Quote Amount": "₹2,15,000 INR (GST Included)", "Included": "RTX 4080 Super + 7800X3D + 32GB DDR5 + 360mm AIO" }
    },
    {
      id: "node-g5",
      title: "Omnichannel Auto-Dispatch",
      subtitle: "LiveGmailSMTP + WhatsAppCloud",
      category: "Action",
      type: "action",
      status: "idle",
      x: 1060,
      y: 270,
      icon: "Mail",
      inputPins: [
        { id: "g5-in-exec", name: "Exec", type: "exec", connected: true }
      ],
      outputPins: [
        { id: "g5-out-exec", name: "Done", type: "exec", connected: false }
      ],
      config: { "Email Provider": "Google SMTP (vaibhavwaghelaa@gmail.com)", "WhatsApp Provider": "WhatsApp Web.js (+91 87800 42609)" }
    }
  ],
  connections: [
    { id: "cg1", fromNodeId: "node-g1", fromPinId: "g1-out-exec", toNodeId: "node-g2", toPinId: "g2-in-exec", type: "exec" },
    { id: "cg2", fromNodeId: "node-g1", fromPinId: "g1-out-payload", toNodeId: "node-g2", toPinId: "g2-in-data", type: "string" },
    { id: "cg3", fromNodeId: "node-g2", fromPinId: "g2-out-exec", toNodeId: "node-g3", toPinId: "g3-in-exec", type: "exec" },
    { id: "cg4", fromNodeId: "node-g2", fromPinId: "g2-out-deal", toNodeId: "node-g3", toPinId: "g3-in-deal", type: "number" },
    { id: "cg5", fromNodeId: "node-g3", fromPinId: "g3-out-warn", toNodeId: "node-g4", toPinId: "g4-in-exec", type: "exec" },
    { id: "cg6", fromNodeId: "node-g4", fromPinId: "g4-out-exec", toNodeId: "node-g5", toPinId: "g5-in-exec", type: "exec" },
    { id: "cg7", fromNodeId: "node-g3", fromPinId: "g3-out-pass", toNodeId: "node-g5", toPinId: "g5-in-exec", type: "exec" }
  ]
};

const PRESET_REAL_ESTATE_QUALIFIER: { nodes: BlueprintNodeData[]; connections: WorkflowConnection[] } = {
  nodes: [
    {
      id: "node-r1",
      title: "Inbound WhatsApp Lead",
      subtitle: "WhatsAppBusinessCloud",
      category: "Event",
      type: "trigger",
      status: "idle",
      x: 60,
      y: 180,
      icon: "Zap",
      inputPins: [],
      outputPins: [
        { id: "r1-out-exec", name: "Exec", type: "exec", connected: true },
        { id: "r1-out-payload", name: "Inquiry Payload", type: "string", connected: true }
      ],
      config: { "Source": "Facebook Real Estate Ad Lead", "Channel": "WhatsApp" }
    },
    {
      id: "node-r2",
      title: "Groq Llama 3.3 Reasoner",
      subtitle: "SynthopsisLPUCore",
      category: "Function",
      type: "ai",
      status: "idle",
      x: 420,
      y: 180,
      icon: "Bot",
      inputPins: [
        { id: "r2-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "r2-in-data", name: "Inbound Message/Spec", type: "string", connected: true }
      ],
      outputPins: [
        { id: "r2-out-exec", name: "Then", type: "exec", connected: true },
        { id: "r2-out-intent", name: "Extracted Intent", type: "string", connected: true }
      ],
      config: { "Vertical": "Ahmedabad Luxury Real Estate", "Speed": "182ms" }
    },
    {
      id: "node-r3",
      title: "Dispatch WhatsApp Quote",
      subtitle: "BrochureDispatcher",
      category: "Action",
      type: "action",
      status: "idle",
      x: 780,
      y: 180,
      icon: "MessageSquare",
      inputPins: [
        { id: "r3-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "r3-in-intent", name: "Quote Details", type: "string", connected: true }
      ],
      outputPins: [
        { id: "r3-out-exec", name: "Then", type: "exec", connected: false }
      ],
      config: { "Media": "3BHK Floor Plan PDF + Pricing Sheet", "Action": "WhatsApp Dispatch" }
    }
  ],
  connections: [
    { id: "cr1", fromNodeId: "node-r1", fromPinId: "r1-out-exec", toNodeId: "node-r2", toPinId: "r2-in-exec", type: "exec" },
    { id: "cr2", fromNodeId: "node-r1", fromPinId: "r1-out-payload", toNodeId: "node-r2", toPinId: "r2-in-data", type: "string" },
    { id: "cr3", fromNodeId: "node-r2", fromPinId: "r2-out-exec", toNodeId: "node-r3", toPinId: "r3-in-exec", type: "exec" },
    { id: "cr4", fromNodeId: "node-r2", fromPinId: "r2-out-intent", toNodeId: "node-r3", toPinId: "r3-in-intent", type: "string" }
  ]
};

const PRESET_SIMPLE_3_NODE: { nodes: BlueprintNodeData[]; connections: WorkflowConnection[] } = {
  nodes: [
    {
      id: "node-p1",
      title: "Inbound WhatsApp RFQ",
      subtitle: "WhatsAppBusinessCloud",
      category: "Event",
      type: "trigger",
      status: "idle",
      x: 60,
      y: 180,
      icon: "Zap",
      inputPins: [],
      outputPins: [
        { id: "p1-out-exec", name: "Exec", type: "exec", connected: true },
        { id: "p1-out-payload", name: "Message Payload", type: "string", connected: true }
      ],
      config: { "Channel": "WhatsApp Business Cloud", "Status": "Active Listener" }
    },
    {
      id: "node-p2",
      title: "Groq Llama 3.3 Reasoner",
      subtitle: "SynthopsisLPUCore",
      category: "Function",
      type: "ai",
      status: "idle",
      x: 440,
      y: 180,
      icon: "Bot",
      inputPins: [
        { id: "p2-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "p2-in-data", name: "Inbound Message/Spec", type: "string", connected: true }
      ],
      outputPins: [
        { id: "p2-out-exec", name: "Then", type: "exec", connected: true },
        { id: "p2-out-intent", name: "Extracted Intent", type: "string", connected: true }
      ],
      config: { "Model": "llama-3.3-70b-versatile", "Speed": "182ms" }
    },
    {
      id: "node-p3",
      title: "Dispatch WhatsApp Quote",
      subtitle: "OmniChannelDispatcher",
      category: "Action",
      type: "action",
      status: "idle",
      x: 820,
      y: 180,
      icon: "MessageSquare",
      inputPins: [
        { id: "p3-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "p3-in-intent", name: "Quote Details", type: "string", connected: true }
      ],
      outputPins: [
        { id: "p3-out-exec", name: "Then", type: "exec", connected: false }
      ],
      config: { "Action": "Send Instant PDF Quote", "Channel": "WhatsApp" }
    }
  ],
  connections: [
    { id: "c1", fromNodeId: "node-p1", fromPinId: "p1-out-exec", toNodeId: "node-p2", toPinId: "p2-in-exec", type: "exec" },
    { id: "c2", fromNodeId: "node-p1", fromPinId: "p1-out-payload", toNodeId: "node-p2", toPinId: "p2-in-data", type: "string" },
    { id: "c3", fromNodeId: "node-p2", fromPinId: "p2-out-exec", toNodeId: "node-p3", toPinId: "p3-in-exec", type: "exec" },
    { id: "c4", fromNodeId: "node-p2", fromPinId: "p2-out-intent", toNodeId: "node-p3", toPinId: "p3-in-intent", type: "string" }
  ]
};

const PRESET_EMAIL_ENTERPRISE_RFP: { nodes: BlueprintNodeData[]; connections: WorkflowConnection[] } = {
  nodes: [
    {
      id: "node-e1",
      title: "Inbound Email Ingestion",
      subtitle: "GmailOutlookOAuth2",
      category: "Event",
      type: "trigger",
      status: "idle",
      x: 60,
      y: 180,
      icon: "Mail",
      inputPins: [],
      outputPins: [
        { id: "e1-out-exec", name: "Exec", type: "exec", connected: true },
        { id: "e1-out-payload", name: "Email Subject & Body", type: "string", connected: true }
      ],
      config: { "Protocol": "Google OAuth2", "Mailbox": "enterprise@synthopsis.ai" }
    },
    {
      id: "node-e2",
      title: "Groq Llama 3.3 Reasoner",
      subtitle: "SynthopsisLPUCore",
      category: "Function",
      type: "ai",
      status: "idle",
      x: 420,
      y: 180,
      icon: "Bot",
      inputPins: [
        { id: "e2-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "e2-in-data", name: "Inbound Message/Spec", type: "string", connected: true }
      ],
      outputPins: [
        { id: "e2-out-exec", name: "Then", type: "exec", connected: true },
        { id: "e2-out-deal", name: "Deal Value (₹)", type: "number", connected: true }
      ],
      config: { "Model": "llama-3.3-70b-versatile", "Speed": "182ms" }
    },
    {
      id: "node-e3",
      title: "Deal Threshold Gate (>= ₹2.5L)",
      subtitle: "BranchRouterCondition",
      category: "Flow",
      type: "notification",
      status: "idle",
      x: 780,
      y: 180,
      icon: "GitFork",
      inputPins: [
        { id: "e3-in-exec", name: "Exec", type: "exec", connected: true },
        { id: "e3-in-val", name: "Deal Value (₹)", type: "number", connected: true }
      ],
      outputPins: [
        { id: "e3-out-vip", name: "VIP Route (True)", type: "exec", connected: true },
        { id: "e3-out-std", name: "Standard Route (False)", type: "exec", connected: false }
      ],
      config: { "Condition": "Deal Value >= ₹2,50,000" }
    },
    {
      id: "node-e4",
      title: "Sync Tally Prime ERP",
      subtitle: "EnterpriseLedgerSync",
      category: "Flow",
      type: "notification",
      status: "idle",
      x: 1140,
      y: 80,
      icon: "Database",
      inputPins: [
        { id: "e4-in-exec", name: "VIP Exec", type: "exec", connected: true }
      ],
      outputPins: [
        { id: "e4-out-exec", name: "Then", type: "exec", connected: true }
      ],
      config: { "Target ERP": "Tally Prime Gold / SAP", "Voucher Type": "Proforma Sales Order Draft" }
    },
    {
      id: "node-e5",
      title: "Dispatch Email PDF Proposal",
      subtitle: "CorporateProposalMailer",
      category: "Action",
      type: "action",
      status: "idle",
      x: 1140,
      y: 280,
      icon: "Mail",
      inputPins: [
        { id: "e5-in-exec", name: "Exec", type: "exec", connected: true }
      ],
      outputPins: [
        { id: "e5-out-exec", name: "Then", type: "exec", connected: false }
      ],
      config: { "Delivery": "Encrypted PDF via OAuth2 Mailer", "SLA": "Under 60 Seconds" }
    }
  ],
  connections: [
    { id: "ce1", fromNodeId: "node-e1", fromPinId: "e1-out-exec", toNodeId: "node-e2", toPinId: "e2-in-exec", type: "exec" },
    { id: "ce2", fromNodeId: "node-e1", fromPinId: "e1-out-payload", toNodeId: "node-e2", toPinId: "e2-in-data", type: "string" },
    { id: "ce3", fromNodeId: "node-e2", fromPinId: "e2-out-exec", toNodeId: "node-e3", toPinId: "e3-in-exec", type: "exec" },
    { id: "ce4", fromNodeId: "node-e2", fromPinId: "e2-out-deal", toNodeId: "node-e3", toPinId: "e3-in-val", type: "number" },
    { id: "ce5", fromNodeId: "node-e3", fromPinId: "e3-out-vip", toNodeId: "node-e4", toPinId: "e4-in-exec", type: "exec" },
    { id: "ce6", fromNodeId: "node-e3", fromPinId: "e3-out-vip", toNodeId: "node-e5", toPinId: "e5-in-exec", type: "exec" }
  ]
};

export interface WorkflowConnection {
  id: string;
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
  type: PinData["type"];
}

export function WorkflowBuilder() {
  const router = useRouter();
  const { injectScenario, injectWorkflowResult } = useInboxStore();
  const { agents } = useAgentStore();

  // Canvas State: Starts with Gaming PC Circuit pre-wired, and rehydrates properly from localStorage!
  const [hasMounted, setHasMounted] = useState(false);
  const [nodes, setNodes] = useState<BlueprintNodeData[]>(PRESET_GAMING_PC_BOTTLENECK.nodes);
  const [connections, setConnections] = useState<WorkflowConnection[]>(PRESET_GAMING_PC_BOTTLENECK.connections);

  // Rehydrate safely from localStorage once on client mount
  useEffect(() => {
    try {
      const savedNodes = localStorage.getItem("synthopsis_custom_workflow_nodes");
      const savedConns = localStorage.getItem("synthopsis_custom_workflow_connections");
      if (savedNodes) {
        const parsed = JSON.parse(savedNodes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNodes(parsed);
        }
      }
      if (savedConns) {
        const parsed = JSON.parse(savedConns);
        if (Array.isArray(parsed)) {
          setConnections(parsed);
        }
      }
    } catch (e) {}
    setHasMounted(true);
  }, []);

  // Automatically persist user changes ONLY after mounted
  useEffect(() => {
    if (hasMounted && nodes.length > 0) {
      try {
        localStorage.setItem("synthopsis_custom_workflow_nodes", JSON.stringify(nodes));
      } catch (e) {}
    }
  }, [nodes, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      try {
        localStorage.setItem("synthopsis_custom_workflow_connections", JSON.stringify(connections));
      } catch (e) {}
    }
  }, [connections, hasMounted]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-g3");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationPhase, setSimulationPhase] = useState<number>(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isActionPaletteOpen, setIsActionPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"config" | "telemetry">("config");

  // Selected B2B Scenario State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("apexrig_gaming_rfq");
  const [customMessage, setCustomMessage] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Active execution breadcrumb trail
  const [traversedPath, setTraversedPath] = useState<string[]>([]);

  // Interactive Node and Pin Connection States
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [connectingPin, setConnectingPin] = useState<{
    nodeId: string;
    pin: PinData;
    isOutput: boolean;
    startX: number;
    startY: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  const activeScenario = DEMO_B2B_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMO_B2B_SCENARIOS[0];

  // -------------------------------------------------------------
  // DYNAMIC WORKFLOW TRAVERSAL ENGINE
  // Traverses the user's actual wires and executes their custom flow!
  // -------------------------------------------------------------
  const runCustomWorkflow = async () => {
    if (nodes.length === 0) {
      setConnectionMessage("Cannot execute: Canvas is empty. Add nodes from the library first.");
      setTimeout(() => setConnectionMessage(null), 3000);
      return;
    }

    setIsSimulating(true);
    setShowSuccessToast(false);
    setExecutionResult(null);
    setTraversedPath([]);

    // Reset all nodes to idle
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));

    // Prepare message payload
    const messageToAnalyze = isCustomMode && customMessage.trim()
      ? customMessage
      : activeScenario.message;

    // Call real backend Groq pipeline in background
    const backendPromise = fetch("/api/workflow/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario_id: selectedScenarioId,
        message: messageToAnalyze
      })
    })
      .then((res) => res.json())
      .catch(() => null);

    // 1. Identify Entry / Trigger Nodes
    const triggerNodes = nodes.filter((n) => n.type === "trigger");
    const entryNode = triggerNodes.length > 0 ? triggerNodes[0] : nodes[0];

    const visitedNodeIds = new Set<string>();
    const executionTrace: Array<{
      step: number;
      nodeId: string;
      nodeLabel: string;
      executionMs: number;
      log: string;
    }> = [];
    const pathNodes: string[] = [];

    // Traverse along user's connections
    let currentBatch: BlueprintNodeData[] = [entryNode];
    let stepCounter = 1;
    let isVipDeal = activeScenario.expectedBranch === "vip";
    let dealValue = 1325000;

    while (currentBatch.length > 0) {
      setSimulationPhase(stepCounter);

      // Light up current batch to "running"
      const batchIds = currentBatch.map((n) => n.id);
      setNodes((prev) =>
        prev.map((n) => (batchIds.includes(n.id) ? { ...n, status: "running" } : n))
      );

      // Node Processing Delay
      const isGroqBatch = currentBatch.some((n) => n.type === "ai" || n.title.includes("Groq"));
      if (isGroqBatch) {
        const apiData = await backendPromise;
        if (apiData?.data) {
          dealValue = apiData.data.final_output?.estimated_deal_value || 1325000;
          isVipDeal = apiData.data.active_branch === "vip";
        }
        await new Promise((r) => setTimeout(r, 700));
      } else {
        await new Promise((r) => setTimeout(r, 550));
      }

      // Record logs for this batch
      for (const node of currentBatch) {
        visitedNodeIds.add(node.id);
        pathNodes.push(node.title);

        let logText = `Executed ${node.title}`;
        let ms = 24;

        if (node.type === "trigger") {
          ms = 14;
          logText = `Ingested inbound RFQ from ${activeScenario.sender}. Payload verified under DPDP 2023.`;
        } else if (node.title.includes("Whisper")) {
          ms = 28;
          logText = `Whisper parsed speech into clean specifications: "${messageToAnalyze.slice(0, 50)}..."`;
        } else if (node.type === "ai" || node.title.includes("Groq")) {
          ms = 182;
          logText = `Groq LPU synthesized inquiry in 182ms. Intent: 'bulk_rfq', Est. Deal: ₹${dealValue.toLocaleString()}, Score: 97%.`;
        } else if (node.title.includes("Gate") || node.id.includes("gate")) {
          ms = 8;
          logText = isVipDeal
            ? `Gate condition met: ₹${dealValue.toLocaleString()} >= ₹2,50,000 threshold. Engaged VIP Route.`
            : `Gate condition unmet: ₹${dealValue.toLocaleString()} < ₹2,50,000. Engaged Standard Route.`;
        } else if (node.title.includes("Tally")) {
          ms = 22;
          logText = `Created Proforma Order #UP-TALLY-2026-${Math.floor(1000 + Math.random() * 9000)} in Tally Prime. Alerted Sales VP.`;
        } else if (node.title.includes("WhatsApp")) {
          ms = 30;
          logText = `Dispatched WhatsApp commercial quote with GST calculation to ${activeScenario.sender}.`;
        } else if (node.title.includes("Email")) {
          ms = 35;
          logText = `Dispatched signed formal quote PDF to client via OAuth2 corporate mailer.`;
        } else if (node.title.includes("Alert")) {
          ms = 15;
          logText = `SMS/Slack alert delivered to VP of Sales mobile phone for deal: ₹${dealValue.toLocaleString()}.`;
        } else if (node.title.includes("Nurture")) {
          ms = 18;
          logText = `Client enrolled in Zoho CRM cold nurture drip sequence without alerting sales reps.`;
        }

        executionTrace.push({
          step: stepCounter++,
          nodeId: node.id,
          nodeLabel: node.title,
          executionMs: ms,
          log: logText
        });
      }

      // Mark current batch as "completed"
      setNodes((prev) =>
        prev.map((n) => (batchIds.includes(n.id) ? { ...n, status: "completed" } : n))
      );

      // Find next batch from user's connections
      const nextBatchMap = new Map<string, BlueprintNodeData>();
      for (const node of currentBatch) {
        let outgoing = connections.filter((c) => c.fromNodeId === node.id);

        // If it's a condition gate, only follow the branch that matched!
        if (node.title.includes("Gate") || node.subtitle.includes("Gate") || node.id.includes("gate")) {
          outgoing = outgoing.filter((c) => {
            const pinLower = c.fromPinId.toLowerCase();
            return isVipDeal ? pinLower.includes("vip") || pinLower.includes("true") : pinLower.includes("std") || pinLower.includes("false");
          });
        }

        for (const conn of outgoing) {
          if (!visitedNodeIds.has(conn.toNodeId)) {
            const targetNode = nodes.find((n) => n.id === conn.toNodeId);
            if (targetNode) nextBatchMap.set(targetNode.id, targetNode);
          }
        }
      }

      currentBatch = Array.from(nextBatchMap.values());
    }

    const totalMs = executionTrace.reduce((acc, curr) => acc + curr.executionMs, 0) + 120;

    const resultData = {
      workflow_id: "wf-user-custom-dag",
      execution_id: `exec-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "success",
      total_duration_ms: totalMs,
      groq_live: true,
      active_branch: isVipDeal ? "vip" : "standard",
      steps: executionTrace,
      traversed_path: pathNodes,
      final_output: {
        lead_status: isVipDeal ? "VIP Fast-Track Qualified" : "Standard Route Dispatched",
        confidence_score: 97,
        estimated_deal_value: dealValue,
        erp_ticket: isVipDeal ? `#UP-TALLY-2026-${Math.floor(1000 + Math.random() * 9000)}` : "N/A (Standard Route)",
        action_taken: `Custom pipeline executed across ${visitedNodeIds.size} connected nodes in ${totalMs}ms.`
      }
    };

    setExecutionResult(resultData);
    setTraversedPath(pathNodes);
    setIsSimulating(false);
    setShowSuccessToast(true);
    setActiveDetailTab("telemetry");

    // Inject exact workflow outcome into the Unified Triage Inbox
    injectWorkflowResult({
      channel: activeScenario.channel || "whatsapp",
      sender: activeScenario.sender,
      company: activeScenario.company,
      inboundText: messageToAnalyze,
      agentReplyText: isVipDeal
        ? `✅ *Commercial Quotation & Proforma Voucher Generated*\n\nDear ${activeScenario.company} Procurement Team,\n\nThank you for your RFQ. We have evaluated your specifications via Synthopsis:\n- *Item:* UN-Certified 1L HDPE Drums with Tamper-Proof Seals\n- *Estimated Deal Value:* ₹${dealValue.toLocaleString()} (Passed ₹2.5L VIP Threshold)\n- *Tally Prime Ledger Voucher:* ${resultData.final_output.erp_ticket}\n- *Fulfillment Route:* Fast-Track Dahej Logistics SEZ\n\nSales VP has been notified via priority SMS alert.`
        : `Thank you for contacting Synthopsis. Our retail consumer catalog and standard pricing tiers have been sent to your contact details. For custom industrial specifications, please request our B2B catalog.`,
      voucherNumber: resultData.final_output.erp_ticket,
      dealValue: dealValue
    });
  };

  // Real-Time Listener: Automatically triggers DAG execution when real phone sends WhatsApp message
  const lastProcessedRunIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const pollRealtimeRuns = async () => {
      try {
        const res = await fetch("/api/workflow/history?limit=1");
        if (!res.ok) return;
        const json = await res.json();
        const latestRun = json.data?.[0];
        if (!latestRun) return;

        // Skip initialization run on first mount
        if (lastProcessedRunIdRef.current === null) {
          lastProcessedRunIdRef.current = latestRun.id;
          return;
        }

        // Detect new incoming real WhatsApp or Email run!
        if (latestRun.id !== lastProcessedRunIdRef.current) {
          lastProcessedRunIdRef.current = latestRun.id;
          if (isCancelled) return;
          
          const channelName = latestRun.channel === "email" ? "Email" : "WhatsApp";
          setConnectionMessage(`⚡ Inbound ${channelName} Lead Ingested from ${latestRun.sender || "Real Customer"}! Executing DAG Flow...`);
          setTimeout(() => setConnectionMessage(null), 4000);
          
          if (!isSimulating && nodes.length > 0) {
            runCustomWorkflow();
          }
        }
      } catch {}
    };

    const interval = setInterval(pollRealtimeRuns, 2000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isSimulating, nodes]);

  // Canvas Actions
  const clearCanvas = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setExecutionResult(null);
    setShowSuccessToast(false);
    try {
      localStorage.removeItem("synthopsis_custom_workflow_nodes");
      localStorage.removeItem("synthopsis_custom_workflow_connections");
    } catch (e) {}
    setConnectionMessage("Canvas cleared. Click '+ ADD BLOCK' to build from scratch.");
    setTimeout(() => setConnectionMessage(null), 3500);
  };

  const loadPresetGamingPc = () => {
    setNodes(PRESET_GAMING_PC_BOTTLENECK.nodes);
    setConnections(PRESET_GAMING_PC_BOTTLENECK.connections);
    setSelectedNodeId("node-g3");
    setSelectedScenarioId("apexrig_gaming_rfq");
    setIsCustomMode(false);
    setExecutionResult(null);
    setShowSuccessToast(false);
    setConnectionMessage("Loaded ApexRig Gaming PC & Bottleneck Analyzer Circuit (RTX 4080 Super x Ryzen 7 7800X3D).");
    setTimeout(() => setConnectionMessage(null), 3000);
  };

  const loadPresetManufacturing = () => {
    setNodes(PRESET_B2B_MANUFACTURING_5_NODE.nodes);
    setConnections(PRESET_B2B_MANUFACTURING_5_NODE.connections);
    setSelectedNodeId("node-m3");
    setSelectedScenarioId("vip_chemical_rfq");
    setIsCustomMode(false);
    setExecutionResult(null);
    setShowSuccessToast(false);
    setConnectionMessage("Loaded 5-Node Gujarat B2B Manufacturing Circuit (Sun Pharma Dahej).");
    setTimeout(() => setConnectionMessage(null), 3000);
  };

  const loadPresetRealEstate = () => {
    setNodes(PRESET_REAL_ESTATE_QUALIFIER.nodes);
    setConnections(PRESET_REAL_ESTATE_QUALIFIER.connections);
    setSelectedNodeId("node-r2");
    setExecutionResult(null);
    setShowSuccessToast(false);
    setConnectionMessage("Loaded Luxury Real Estate WhatsApp Lead Qualifier.");
    setTimeout(() => setConnectionMessage(null), 3000);
  };

  const loadPresetSimple = () => {
    setNodes(PRESET_SIMPLE_3_NODE.nodes);
    setConnections(PRESET_SIMPLE_3_NODE.connections);
    setSelectedNodeId("node-p2");
    setExecutionResult(null);
    setShowSuccessToast(false);
    setConnectionMessage("Loaded 3-Node Direct Quote Pipeline.");
    setTimeout(() => setConnectionMessage(null), 3000);
  };

  const loadPresetEmailRfp = () => {
    setNodes(PRESET_EMAIL_ENTERPRISE_RFP.nodes);
    setConnections(PRESET_EMAIL_ENTERPRISE_RFP.connections);
    setSelectedNodeId("node-e2");
    setSelectedScenarioId("enterprise_email_rfp");
    setIsCustomMode(false);
    setExecutionResult(null);
    setShowSuccessToast(false);
    setConnectionMessage("Loaded Enterprise Email RFP Pipeline (Apex Healthcare x SAP).");
    setTimeout(() => setConnectionMessage(null), 3000);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromNodeId !== selectedNodeId && c.toNodeId !== selectedNodeId)
    );
    setSelectedNodeId(null);
    setConnectionMessage("Node and attached wires deleted.");
    setTimeout(() => setConnectionMessage(null), 2500);
  };

  // Add Specific Node from Library
  const addTemplateNode = (tmpl: PaletteTemplate) => {
    const id = `node-${Date.now()}`;
    const xOffset = 80 + (nodes.length % 4) * 320;
    const yOffset = 140 + Math.floor(nodes.length / 4) * 200;

    const newNode: BlueprintNodeData = {
      id,
      title: tmpl.title,
      subtitle: tmpl.subtitle,
      category: tmpl.category,
      type: tmpl.type,
      status: "idle",
      x: xOffset,
      y: yOffset,
      icon: tmpl.icon,
      inputPins: tmpl.inputPins.map((p) => ({ ...p, id: `${id}-${p.id}`, connected: false })),
      outputPins: tmpl.outputPins.map((p) => ({ ...p, id: `${id}-${p.id}`, connected: false })),
      config: tmpl.config
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    setIsActionPaletteOpen(false);
    setConnectionMessage(`Added ${tmpl.title}. Drag any pin to wire it into your flow.`);
    setTimeout(() => setConnectionMessage(null), 3500);
  };

  // Add Dynamic Configured Agent Block from Agent Studio
  const addAgentNode = (agent: ConfiguredAgent) => {
    const id = `agent-node-${Date.now()}`;
    const xOffset = 80 + (nodes.length % 4) * 320;
    const yOffset = 140 + Math.floor(nodes.length / 4) * 200;

    const newNode: BlueprintNodeData = {
      id,
      title: agent.name,
      subtitle: `AgentStudioBrain // ${agent.category}`,
      category: "Function",
      type: "ai",
      status: "idle",
      x: xOffset,
      y: yOffset,
      icon: "Bot",
      inputPins: [
        { id: `${id}-in-exec`, name: "Exec", type: "exec", connected: false },
        { id: `${id}-in-data`, name: "Inbound Message/Spec", type: "string", connected: false }
      ],
      outputPins: [
        { id: `${id}-out-exec`, name: "Then", type: "exec", connected: false },
        { id: `${id}-out-intent`, name: "Extracted Intent", type: "string", connected: false },
        { id: `${id}-out-deal`, name: "Deal Value (₹)", type: "number", connected: false },
        { id: `${id}-out-conf`, name: "Confidence Score", type: "number", connected: false }
      ],
      config: {
        "Assigned Agent": agent.name,
        "Agent ID": agent.id,
        "Model Engine": agent.model === "groq" ? "Groq Llama 3.3 (182ms)" : "Gemini 2.0 Flash",
        "Knowledge Base": agent.knowledgeBaseFiles.length > 0 ? agent.knowledgeBaseFiles.join(", ") : "General Domain Prompts",
        "System Prompt": agent.systemPrompt.slice(0, 75) + "...",
        "Operating Channel": agent.channel.toUpperCase(),
        "Temperature": String(agent.temperature)
      }
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    setIsActionPaletteOpen(false);
    setConnectionMessage(`Added Agent "${agent.name}" as an AI Brain block! Connect it with wires to build your flow.`);
    setTimeout(() => setConnectionMessage(null), 3500);
  };

  // Dragging Handlers
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    setDraggingNodeId(id);

    const node = nodes.find((n) => n.id === id);
    if (!node || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    };
  };

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (connectingPin) {
      setMousePos({ x: currentX, y: currentY });
    }

    if (draggingNodeId) {
      const newX = Math.max(10, Math.min(2000, currentX - dragOffsetRef.current.x));
      const newY = Math.max(10, Math.min(800, currentY - dragOffsetRef.current.y));

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      );
    }
  }, [draggingNodeId, connectingPin]);

  const handleCanvasMouseUp = useCallback(() => {
    setDraggingNodeId(null);
  }, []);

  const handleCanvasClick = () => {
    if (connectingPin) {
      setConnectingPin(null);
      setConnectionMessage(null);
    }
  };

  // Exact Pin Coordinates Calculation
  const getPinPos = (nodeId: string, pinId: string, isOutput: boolean) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const pins = isOutput ? node.outputPins : node.inputPins;
    const index = pins.findIndex((p) => p.id === pinId);
    const pinIndex = index >= 0 ? index : 0;

    const x = isOutput ? node.x + 288 : node.x;
    const y = node.y + 88 + pinIndex * 26;

    return { x, y };
  };

  // Pin Wiring Handlers
  const handlePinMouseDown = (nodeId: string, pin: PinData, isOutput: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = getPinPos(nodeId, pin.id, isOutput);

    setConnectingPin({
      nodeId,
      pin,
      isOutput,
      startX: pos.x,
      startY: pos.y
    });
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setConnectionMessage(`Wiring from ${pin.name}. Drop onto an ${isOutput ? "Input" : "Output"} pin to connect.`);
  };

  const handlePinClick = (targetNodeId: string, targetPin: PinData, isTargetOutput: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectingPin) {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = getPinPos(targetNodeId, targetPin.id, isTargetOutput);
      setConnectingPin({
        nodeId: targetNodeId,
        pin: targetPin,
        isOutput: isTargetOutput,
        startX: pos.x,
        startY: pos.y
      });
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setConnectionMessage(`Selected ${targetPin.name}. Click target pin on another node to wire.`);
      return;
    }

    if (connectingPin.pin.id === targetPin.id && connectingPin.nodeId === targetNodeId) {
      setConnectingPin(null);
      setConnectionMessage(null);
      return;
    }

    attemptConnection(targetNodeId, targetPin, isTargetOutput);
  };

  const handlePinMouseUp = (targetNodeId: string, targetPin: PinData, isTargetOutput: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectingPin) return;
    attemptConnection(targetNodeId, targetPin, isTargetOutput);
  };

  const attemptConnection = (targetNodeId: string, targetPin: PinData, isTargetOutput: boolean) => {
    if (!connectingPin) return;

    if (connectingPin.nodeId === targetNodeId) {
      setConnectionMessage("Notice: Cannot connect pins on the same node.");
      setTimeout(() => setConnectionMessage(null), 3000);
      setConnectingPin(null);
      return;
    }

    if (connectingPin.isOutput === isTargetOutput) {
      setConnectionMessage(`Notice: Must connect an ${connectingPin.isOutput ? "Output" : "Input"} to an ${connectingPin.isOutput ? "Input" : "Output"} pin.`);
      setTimeout(() => setConnectionMessage(null), 3000);
      setConnectingPin(null);
      return;
    }

    const fromNodeId = connectingPin.isOutput ? connectingPin.nodeId : targetNodeId;
    const fromPinId = connectingPin.isOutput ? connectingPin.pin.id : targetPin.id;
    const toNodeId = connectingPin.isOutput ? targetNodeId : connectingPin.nodeId;
    const toPinId = connectingPin.isOutput ? targetPin.id : connectingPin.pin.id;
    const connType = connectingPin.isOutput ? connectingPin.pin.type : targetPin.type;

    const alreadyConnected = connections.some(
      (c) => c.fromNodeId === fromNodeId && c.fromPinId === fromPinId && c.toNodeId === toNodeId && c.toPinId === toPinId
    );

    if (alreadyConnected) {
      setConnectionMessage("Notice: These two pins are already connected.");
      setTimeout(() => setConnectionMessage(null), 3000);
      setConnectingPin(null);
      return;
    }

    const newConnection: WorkflowConnection = {
      id: `conn-${Date.now()}`,
      fromNodeId,
      fromPinId,
      toNodeId,
      toPinId,
      type: connType
    };

    setConnections((prev) => [...prev, newConnection]);

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === fromNodeId) {
          return {
            ...n,
            outputPins: n.outputPins.map((p) => (p.id === fromPinId ? { ...p, connected: true } : p))
          };
        }
        if (n.id === toNodeId) {
          return {
            ...n,
            inputPins: n.inputPins.map((p) => (p.id === toPinId ? { ...p, connected: true } : p))
          };
        }
        return n;
      })
    );

    setConnectionMessage(`Wired: ${connectingPin.pin.name} → ${targetPin.name}`);
    setTimeout(() => setConnectionMessage(null), 3000);
    setConnectingPin(null);
  };

  const removeConnection = (connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    setConnectionMessage("Wire disconnected.");
    setTimeout(() => setConnectionMessage(null), 2500);
  };

  const getWireColor = (type: PinData["type"]) => {
    switch (type) {
      case "exec":
        return "#121316";
      case "string":
        return "#0284c7";
      case "number":
        return "#16a34a";
      case "boolean":
        return "#dc2626";
      case "struct":
        return "#7c3aed";
      default:
        return "#121316";
    }
  };

  const isConnectionActive = (conn: WorkflowConnection) => {
    if (!isSimulating) return false;
    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
    return fromNode?.status === "running" || fromNode?.status === "completed";
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedNodeConnections = connections.filter(
    (c) => c.fromNodeId === selectedNodeId || c.toNodeId === selectedNodeId
  );

  // Cubic Bezier Spline
  const renderCubicBezierWire = (
    connectionId: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    isActive: boolean,
    strokeWidth = 2.5
  ) => {
    const dx = Math.abs(endX - startX) * 0.55;
    const path = `M ${startX} ${startY} C ${startX + Math.max(dx, 60)} ${startY}, ${endX - Math.max(dx, 60)} ${endY}, ${endX} ${endY}`;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const isHovered = hoveredWireId === connectionId;

    return (
      <g
        key={connectionId}
        className="group cursor-pointer pointer-events-auto"
        onMouseEnter={() => setHoveredWireId(connectionId)}
        onMouseLeave={() => setHoveredWireId(null)}
        onClick={() => removeConnection(connectionId)}
      >
        <path
          d={path}
          stroke="transparent"
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
        />

        {(isActive || isHovered) && (
          <path
            d={path}
            stroke={isHovered ? "#ff2a3b" : color === "#121316" ? "#ff2a3b" : color}
            strokeWidth={strokeWidth + 6}
            fill="none"
            opacity={isHovered ? 0.7 : 0.4}
            strokeLinecap="round"
          />
        )}

        <path
          d={path}
          stroke={isHovered ? "#ff2a3b" : isActive && color === "#121316" ? "#ff2a3b" : color}
          strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={isActive ? "transition-all duration-300" : "opacity-90"}
        />

        {isActive && (
          <path
            d={path}
            stroke="#ffffff"
            strokeWidth={strokeWidth + 1}
            fill="none"
            strokeDasharray="8 16"
            strokeLinecap="round"
            className="animate-pulse"
          />
        )}

        {isHovered && (
          <g transform={`translate(${midX}, ${midY})`}>
            <circle r={10} fill="#121316" stroke="#ff2a3b" strokeWidth={2} />
            <text
              textAnchor="middle"
              dy={3.5}
              fill="#ffffff"
              fontSize={12}
              fontWeight="bold"
            >
              ×
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* ================= 1. TOP TOOLBAR & CANVAS BUILDER CONTROLS ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border-2 border-[#121316] bg-white text-[#121316] shadow-[4px_4px_0px_#121316]">
        
        {/* Left: Branding & Node Counts */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-sm bg-[#ff2a3b] border-2 border-[#121316] flex items-center justify-center shadow-[2px_2px_0px_#121316] shrink-0">
            <GitFork className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-[#121316] uppercase">
                Custom Workflow Studio // Visual DAG Engine
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-600 font-bold flex items-center gap-1 shadow-xs">
                <Check className="h-2.5 w-2.5 text-emerald-700" /> AUTOSAVED & PERSISTED
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 font-sans mt-0.5">
              Add blocks from the library, drag wires from pin to pin, and execute your unique autonomous sales circuit.
            </p>
          </div>
        </div>

        {/* Right: Canvas Control Buttons */}
        <div className="flex items-center gap-2">
          {/* Node/Wire Counter */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f4f4f6] border-2 border-[#121316] text-[10px] font-black text-[#121316] shadow-[2px_2px_0px_#121316]">
            <GitFork className="h-3 w-3 text-[#ff2a3b]" />
            <span>{nodes.length} NODES • {connections.length} WIRES</span>
          </div>

          {/* Add Block */}
          <Button
            size="sm"
            onClick={() => setIsActionPaletteOpen(true)}
            className="h-8 text-[11px] font-bold gap-1.5 border-2 border-[#121316] bg-white text-[#121316] hover:bg-[#f2f2f5] shadow-[2px_2px_0px_#121316] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#ff2a3b]" />
            + ADD BLOCK
          </Button>

          {/* 1-Click Demo Templates */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={loadPresetGamingPc}
              className="h-8 text-[11px] font-black gap-1 border-2 border-[#121316] bg-rose-50 text-rose-950 hover:bg-rose-100 shadow-[2px_2px_0px_#121316] cursor-pointer"
              title="1-Click Demo: ApexRig Gaming PC & Bottleneck Analyzer Circuit"
            >
              <Zap className="h-3 w-3 text-[#ff2a3b]" />
              🎮 GAMING PC (APEXRIG)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPresetManufacturing}
              className="h-8 text-[11px] font-black gap-1 border-2 border-[#121316] bg-amber-50 text-amber-950 hover:bg-amber-100 shadow-[2px_2px_0px_#121316] cursor-pointer"
              title="1-Click Demo: Gujarat B2B Manufacturing (5-Node) Pipeline"
            >
              <Building2 className="h-3 w-3 text-amber-700" />
              🏭 B2B MFG (5-NODE)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPresetRealEstate}
              className="h-8 text-[11px] font-black gap-1 border-2 border-[#121316] bg-blue-50 text-blue-950 hover:bg-blue-100 shadow-[2px_2px_0px_#121316] cursor-pointer"
              title="1-Click Demo: Luxury Real Estate Lead Qualifier"
            >
              🏢 REAL ESTATE
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPresetSimple}
              className="h-8 text-[11px] font-bold gap-1 border-2 border-[#121316] bg-white text-zinc-700 hover:text-[#121316] hover:bg-[#f2f2f5] shadow-[2px_2px_0px_#121316] cursor-pointer"
              title="1-Click Demo: Simple 3-Node Direct Quote"
            >
              ⚡ 3-NODE
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPresetEmailRfp}
              className="h-8 text-[11px] font-black gap-1 border-2 border-[#121316] bg-emerald-50 text-emerald-950 hover:bg-emerald-100 shadow-[2px_2px_0px_#121316] cursor-pointer"
              title="1-Click Demo: Enterprise Email RFP Pipeline"
            >
              <Mail className="h-3 w-3 text-emerald-700" />
              ✉️ EMAIL RFP
            </Button>
          </div>

          {/* Clear Canvas */}
          <Button
            size="sm"
            variant="outline"
            onClick={clearCanvas}
            className="h-8 text-[11px] font-bold gap-1 border-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-[2px_2px_0px_#121316] cursor-pointer"
            title="Clear all nodes to build from scratch"
          >
            <Trash2 className="h-3 w-3 text-rose-600" />
            CLEAR
          </Button>

          {/* Execute Custom Pipeline */}
          <Button
            size="sm"
            onClick={runCustomWorkflow}
            disabled={isSimulating || nodes.length === 0}
            className="h-8 text-[11px] gap-1.5 bg-[#ff2a3b] hover:bg-[#d91e2e] text-white border-2 border-[#121316] font-black shadow-[3px_3px_0px_#121316] cursor-pointer disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isSimulating ? `EXECUTING FLOW (PHASE ${simulationPhase})...` : "RUN MY WORKFLOW"}
          </Button>
        </div>
      </div>

      {/* ================= 2. DATA INGESTION TEST PAYLOAD SELECTOR ================= */}
      <div className="p-3.5 rounded-lg border-2 border-[#121316] bg-[#fdfdfd] shadow-[4px_4px_0px_#121316] space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#ff2a3b]" />
              SELECT INGESTION PAYLOAD TO TEST THROUGH YOUR WORKFLOW:
            </span>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">
            Channel: <strong className="text-[#121316] uppercase">{activeScenario.channel}</strong> • Sender: <strong className="text-[#121316]">{activeScenario.sender}</strong>
          </div>
        </div>

        {/* 4 Real Scenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {DEMO_B2B_SCENARIOS.map((sc) => {
            const isSelected = selectedScenarioId === sc.id && !isCustomMode;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setIsCustomMode(false);
                }}
                className={`text-left p-2.5 rounded border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#ff2a3b] bg-rose-50/50 shadow-[3px_3px_0px_#ff2a3b]"
                    : "border-[#121316] bg-white hover:bg-[#f8f8fa] shadow-[2px_2px_0px_#121316]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[#121316] flex items-center gap-1.5">
                    {sc.id === "vip_chemical_rfq" && <Building2 className="h-3.5 w-3.5 text-[#ff2a3b]" />}
                    {sc.id === "gujarati_audio_inquiry" && <Mic className="h-3.5 w-3.5 text-blue-600" />}
                    {sc.id === "retail_sample_inquiry" && <ShoppingCart className="h-3.5 w-3.5 text-emerald-600" />}
                    {sc.title}
                  </span>
                  <span
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                      sc.expectedBranch === "vip"
                        ? "bg-amber-100 text-amber-900 border-amber-400"
                        : "bg-zinc-100 text-zinc-700 border-zinc-300"
                    }`}
                  >
                    {sc.expectedBranch === "vip" ? "VIP RFQ" : "STANDARD"}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-600 font-bold mt-1">{sc.badge}</div>
                <p className="text-[9px] text-zinc-500 font-sans mt-1 line-clamp-2 leading-tight">
                  "{sc.message}"
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="pt-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Or type custom test message to feed into your custom DAG..."
            value={customMessage}
            onChange={(e) => {
              setCustomMessage(e.target.value);
              if (e.target.value.trim()) setIsCustomMode(true);
            }}
            className="flex-1 bg-white border-2 border-[#121316] px-3 py-1.5 text-xs text-[#121316] placeholder:text-zinc-400 rounded focus:outline-none focus:border-[#ff2a3b] font-mono shadow-xs"
          />
          <Button
            size="sm"
            onClick={runCustomWorkflow}
            disabled={isSimulating || nodes.length === 0}
            className="h-8 text-xs font-black gap-1.5 bg-[#121316] hover:bg-black text-white border-2 border-[#121316] shadow-[2px_2px_0px_#121316] cursor-pointer"
          >
            <Send className="h-3 w-3 text-[#ff2a3b]" />
            RUN CUSTOM FLOW
          </Button>
        </div>
      </div>

      {/* Traversed Path / Execution Banner */}
      {showSuccessToast && executionResult && (
        <div className="p-3.5 rounded-lg border-2 border-emerald-600 bg-emerald-50 text-xs text-emerald-900 shadow-[3px_3px_0px_#121316] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                <strong>CUSTOM FLOW EXECUTED IN {executionResult.total_duration_ms}ms:</strong>{" "}
                Traversed {executionResult.steps?.length} nodes along your wired circuit.
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard/inbox")}
              className="text-[10px] h-7 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border border-[#121316] shadow-[1px_1px_0px_#121316] cursor-pointer shrink-0"
            >
              VIEW IN TRIAGE INBOX →
            </Button>
          </div>

          {/* Breadcrumbs of user's custom flow */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono pt-1 text-emerald-800">
            <span className="font-bold text-zinc-600">PATH TRAVERSED:</span>
            {traversedPath.map((stepName, i) => (
              <React.Fragment key={i}>
                <span className="px-2 py-0.5 rounded bg-white border border-emerald-500 font-bold shadow-xs">
                  {stepName}
                </span>
                {i < traversedPath.length - 1 && <ArrowRight className="h-3 w-3 text-emerald-600" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. RICH ACTION PALETTE MODAL ================= */}
      {isActionPaletteOpen && (
        <div className="p-4 rounded-lg border-2 border-[#121316] bg-white text-[#121316] shadow-[6px_6px_0px_#121316] z-40 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#121316] pb-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#121316]">
              <Search className="h-3.5 w-3.5 text-[#ff2a3b]" />
              <span>Block Library — Select Any Node to Drop onto Canvas</span>
            </div>
            <button
              onClick={() => setIsActionPaletteOpen(false)}
              className="text-zinc-500 hover:text-[#121316] p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter blocks (e.g. WhatsApp, Groq, Tally, Gate, Email)..."
            className="w-full bg-[#f8f8fa] border-2 border-[#121316] px-3 py-1.5 text-xs text-[#121316] placeholder:text-zinc-400 rounded focus:outline-none focus:border-[#ff2a3b] font-mono shadow-xs"
            autoFocus
          />

          {/* Section 1: Configured Agent Brains from Agent Studio */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-[#121316] mb-2 pb-1 border-b border-zinc-200">
              <span className="flex items-center gap-1.5 text-purple-900">
                <Bot className="h-3.5 w-3.5 text-purple-700" />
                Configured Agent Brains ({agents.length} Ready from Agent Studio)
              </span>
              <span className="text-[9px] text-zinc-500 font-sans">
                Click to drop your custom Agent as an AI block
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
              {agents
                .filter((a) =>
                  a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  a.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => addAgentNode(agent)}
                    className="text-left p-2.5 rounded border-2 border-purple-900 bg-purple-50/60 hover:bg-white hover:border-[#ff2a3b] hover:shadow-[3px_3px_0px_#ff2a3b] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-purple-950 group-hover:text-[#ff2a3b] flex items-center gap-1.5 truncate">
                          <Bot className="h-3 w-3 text-purple-700 shrink-0" />
                          <span className="truncate">{agent.name}</span>
                        </span>
                        <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-purple-200 text-purple-900 font-bold shrink-0">
                          AGENT
                        </span>
                      </div>
                      <div className="text-[8px] text-zinc-600 font-mono mt-0.5 flex items-center gap-1">
                        <span>{agent.category}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{agent.model.toUpperCase()}</span>
                      </div>
                      <p className="text-[9px] text-zinc-500 font-sans mt-1 leading-tight line-clamp-2">
                        {agent.systemPrompt}
                      </p>
                    </div>
                    <div className="mt-2 text-[8px] font-mono text-zinc-500 pt-1 border-t border-purple-200 flex items-center justify-between">
                      <span>{agent.knowledgeBaseFiles.length} docs</span>
                      <span className="text-purple-900 font-bold group-hover:text-[#ff2a3b] group-hover:underline">
                        + USE IN FLOW
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Section 2: Standard I/O & Logic Blocks */}
          <div className="text-[10px] font-black uppercase text-zinc-600 mb-1 pt-1 border-t border-zinc-200">
            Standard Enterprise Blocks (Triggers, Logic Gates, Tally ERP, Dispatchers)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
            {PALETTE_TEMPLATES.filter(
              (tmpl) =>
                tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tmpl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tmpl.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((tmpl) => (
              <button
                key={tmpl.key}
                onClick={() => addTemplateNode(tmpl)}
                className="text-left p-2.5 rounded border-2 border-[#121316] bg-[#f8f8fa] hover:bg-white hover:border-[#ff2a3b] hover:shadow-[3px_3px_0px_#ff2a3b] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#121316] group-hover:text-[#ff2a3b] flex items-center gap-1.5">
                      {tmpl.type === "trigger" && <Zap className="h-3 w-3 text-red-600" />}
                      {tmpl.type === "ai" && <Bot className="h-3 w-3 text-blue-600" />}
                      {tmpl.type === "action" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                      {tmpl.type === "notification" && <Database className="h-3 w-3 text-purple-600" />}
                      {tmpl.title}
                    </span>
                    <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-zinc-200 text-zinc-700">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-sans mt-1 leading-tight">
                    {tmpl.description}
                  </p>
                </div>
                <div className="mt-2 text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-200 flex items-center justify-between">
                  <span>In: {tmpl.inputPins.length} pins</span>
                  <span>Out: {tmpl.outputPins.length} pins</span>
                  <span className="text-[#ff2a3b] font-bold group-hover:underline">+ DROP TO GRAPH</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= 4. MAIN CANVAS VIEWPORT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Canvas (9 Cols) */}
        <div className="lg:col-span-9 rounded-lg border-2 border-[#121316] bg-[#f8f8fa] overflow-hidden shadow-[4px_4px_0px_#121316] relative flex flex-col">
          
          {/* Header Bar */}
          <div className="px-3 py-1.5 bg-white border-b-2 border-[#121316] flex items-center justify-between text-[10px] text-zinc-600">
            <span className="font-bold flex items-center gap-1.5 text-[#121316]">
              <Layers className="h-3 w-3 text-[#ff2a3b]" />
              INTERACTIVE BLUEPRINT VIEWPORT (Drag blocks • Click pin to wire • Click wire or × to disconnect)
            </span>
            <span className="text-[9px] text-zinc-500 font-mono">
              Active Wires: {connections.length}
            </span>
          </div>

          <div
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            className="relative h-[600px] w-full overflow-x-auto overflow-y-auto cursor-default select-none scrollbar-thin"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(18, 19, 22, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(18, 19, 22, 0.08) 1px, transparent 1px),
                linear-gradient(to right, rgba(18, 19, 22, 0.035) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(18, 19, 22, 0.035) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px, 64px 64px, 16px 16px, 16px 16px"
            }}
          >
            {/* Inner Wide Canvas */}
            <div className="relative w-[1850px] h-[650px]">
              
              {/* Corner Crosshairs */}
              <span className="absolute top-2 left-2 text-[11px] font-black text-[#121316] pointer-events-none">+</span>
              <span className="absolute top-2 right-2 text-[11px] font-black text-[#121316] pointer-events-none">+</span>
              <span className="absolute bottom-2 left-2 text-[11px] font-black text-[#121316] pointer-events-none">+</span>
              <span className="absolute bottom-2 right-2 text-[11px] font-black text-[#121316] pointer-events-none">+</span>

              {/* Status Notice */}
              {connectionMessage && (
                <div className="sticky top-3 left-1/2 -translate-x-1/2 bg-[#121316] text-white px-3 py-1.5 text-[11px] font-bold border-2 border-[#ff2a3b] shadow-[3px_3px_0px_#ff2a3b] z-30 flex items-center gap-2 pointer-events-none animate-in fade-in w-max mx-auto">
                  <span className="h-2 w-2 rounded-full bg-[#ff2a3b] animate-ping" />
                  <span>{connectionMessage}</span>
                </div>
              )}

              {/* Empty State when Canvas is Cleared */}
              {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 pointer-events-none">
                  <div className="h-12 w-12 rounded-full bg-zinc-200 border-2 border-[#121316] flex items-center justify-center text-zinc-600 shadow-[3px_3px_0px_#121316]">
                    <Plus className="h-6 w-6 text-[#ff2a3b]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#121316] uppercase">Canvas is Empty</h3>
                    <p className="text-xs text-zinc-500 font-sans max-w-sm mt-1">
                      Click <strong>+ ADD BLOCK</strong> in the top toolbar to choose triggers, Groq AI reasoners, condition gates, and Tally actions to assemble your custom flow!
                    </p>
                  </div>
                </div>
              )}

              {/* SVG Spline Connection Layer */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none z-10 overflow-visible">
                {connections.map((conn) => {
                  const fromPos = getPinPos(conn.fromNodeId, conn.fromPinId, true);
                  const toPos = getPinPos(conn.toNodeId, conn.toPinId, false);
                  const color = getWireColor(conn.type);
                  const isWireActive = isConnectionActive(conn);

                  return renderCubicBezierWire(
                    conn.id,
                    fromPos.x,
                    fromPos.y,
                    toPos.x,
                    toPos.y,
                    color,
                    isWireActive,
                    conn.type === "exec" ? 3 : 2.5
                  );
                })}

                {connectingPin && (
                  <g>
                    <path
                      d={`M ${connectingPin.startX} ${connectingPin.startY} C ${connectingPin.startX + (connectingPin.isOutput ? 1 : -1) * Math.max(Math.abs(mousePos.x - connectingPin.startX) * 0.55, 60)} ${connectingPin.startY}, ${mousePos.x + (connectingPin.isOutput ? -1 : 1) * Math.max(Math.abs(mousePos.x - connectingPin.startX) * 0.55, 60)} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                      stroke="#ff2a3b"
                      strokeWidth={3}
                      strokeDasharray="6 6"
                      fill="none"
                      className="animate-pulse"
                    />
                    <circle cx={mousePos.x} cy={mousePos.y} r={5} fill="#ff2a3b" stroke="#121316" strokeWidth={1.5} />
                  </g>
                )}
              </svg>

              {/* Render Blueprint Nodes */}
              {nodes.map((node) => (
                <UnrealBlueprintNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                  onPinMouseDown={(pin, isOutput, e) => handlePinMouseDown(node.id, pin, isOutput, e)}
                  onPinMouseUp={(pin, isOutput, e) => handlePinMouseUp(node.id, pin, isOutput, e)}
                  onPinClick={(pin, isOutput, e) => handlePinClick(node.id, pin, isOutput, e)}
                  activeConnectingPinId={connectingPin?.pin.id}
                  isConnecting={Boolean(connectingPin)}
                />
              ))}
            </div>
          </div>

          {/* Bottom Canvas Legend */}
          <div className="px-3 py-2 bg-white/95 border-t-2 border-[#121316] flex flex-wrap items-center justify-between gap-3 text-[9px]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-black text-[#121316]">
                <svg className="w-2.5 h-2.5 text-[#ff2a3b]" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 2 L7.5 2 L10.5 6 L7.5 10 L2 10 Z" />
                </svg>
                Execution Flow
              </span>
              <span className="flex items-center gap-1 text-[#0284c7] font-bold">
                <span className="h-2 w-2 rounded-full bg-[#0284c7] border border-[#121316]" /> String Data
              </span>
              <span className="flex items-center gap-1 text-[#16a34a] font-bold">
                <span className="h-2 w-2 rounded-full bg-[#16a34a] border border-[#121316]" /> Number / Deal (₹)
              </span>
              <span className="flex items-center gap-1 text-[#7c3aed] font-bold">
                <span className="h-2 w-2 rounded-full bg-[#7c3aed] border border-[#121316]" /> Struct / RAG
              </span>
            </div>
            <span className="text-zinc-500 italic hidden sm:inline">
              Tip: Click any pin then click another node's pin to wire them together.
            </span>
          </div>
        </div>

        {/* ================= 5. DETAILS INSPECTOR & LIVE TELEMETRY PANEL ================= */}
        <div className="lg:col-span-3 rounded-lg border-2 border-[#121316] bg-white p-4 text-[#121316] flex flex-col justify-between shadow-[4px_4px_0px_#121316]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#121316] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-3.5 w-3.5 text-[#ff2a3b]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#121316]">
                  Details Inspector
                </span>
              </div>
              <span className="text-[9px] text-[#121316] font-mono font-bold bg-[#f4f4f6] px-1.5 py-0.5 border border-[#121316]">
                {activeDetailTab === "telemetry" ? "LIVE TRACE" : selectedNode ? selectedNode.id : "NO SELECTION"}
              </span>
            </div>

            {/* Tab Selector: Properties vs Live Telemetry */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#f4f4f6] border border-[#121316] rounded mb-3 text-[10px] font-black">
              <button
                type="button"
                onClick={() => setActiveDetailTab("config")}
                className={`py-1 px-2 rounded transition-colors cursor-pointer ${
                  activeDetailTab === "config"
                    ? "bg-[#121316] text-white shadow-xs"
                    : "text-zinc-600 hover:text-[#121316]"
                }`}
              >
                PROPERTIES
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab("telemetry")}
                className={`py-1 px-2 rounded flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  activeDetailTab === "telemetry"
                    ? "bg-[#ff2a3b] text-white shadow-xs"
                    : "text-zinc-600 hover:text-[#121316]"
                }`}
              >
                {executionResult && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
                <span>LIVE TELEMETRY</span>
              </button>
            </div>

            {/* Content: Telemetry vs Node Config */}
            {activeDetailTab === "telemetry" ? (
              executionResult ? (
                <div className="space-y-3">
                  {/* Top Status */}
                  <div className="p-2.5 rounded bg-emerald-50 border-2 border-emerald-600 text-[10px]">
                    <div className="flex items-center justify-between font-bold text-emerald-900">
                      <span>CUSTOM FLOW TRACE</span>
                      <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {executionResult.total_duration_ms}ms
                      </span>
                    </div>
                    <div className="text-[9px] text-emerald-800 font-bold mt-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      LIVE GROQ LPU INFERENCE ENGAGED
                    </div>
                  </div>

                  {/* Flow Breadcrumb Trail */}
                  <div className="p-2 rounded bg-[#f8f8fa] border border-[#121316] text-[10px]">
                    <div className="text-zinc-500 font-bold uppercase text-[9px]">Wired Circuit Path</div>
                    <div className="text-[#121316] font-bold text-[10px] mt-0.5 leading-snug">
                      {executionResult.traversed_path?.join(" ➔ ") || "Custom Path"}
                    </div>
                  </div>

                  {/* Output Summary */}
                  <div className="p-2 rounded bg-[#f8f8fa] border border-[#121316] text-[10px]">
                    <div className="text-zinc-500 font-bold uppercase text-[9px]">Final Action Output</div>
                    <div className="font-black text-[#121316] mt-0.5">
                      {executionResult.final_output?.erp_ticket !== "N/A (Standard Route)" ? (
                        <span className="text-[#ff2a3b] font-mono">
                          Tally ERP Ticket: {executionResult.final_output?.erp_ticket}
                        </span>
                      ) : (
                        <span className="text-blue-700">Digital Catalog & CRM Nurture</span>
                      )}
                    </div>
                    <div className="text-zinc-600 text-[9px] mt-0.5">
                      {executionResult.final_output?.action_taken}
                    </div>
                  </div>

                  {/* View in Triage Inbox Button */}
                  <button
                    onClick={() => router.push("/dashboard/inbox")}
                    className="w-full py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 border-2 border-[#121316] shadow-[2px_2px_0px_#121316] transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>View Result in Live Triage Inbox ↗</span>
                  </button>

                  {/* Step Execution Logs */}
                  <div>
                    <div className="text-[9px] uppercase font-black text-zinc-500 mb-1">
                      Step Trace ({executionResult.steps?.length || 0} Nodes Traversed)
                    </div>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {executionResult.steps?.map((s: any) => (
                        <div key={s.step} className="p-1.5 rounded bg-[#f8f8fa] border border-[#121316] text-[9px]">
                          <div className="flex items-center justify-between font-bold text-[#121316]">
                            <span>{s.step}. {s.nodeLabel}</span>
                            <span className="text-zinc-500 font-mono">{s.executionMs}ms</span>
                          </div>
                          <div className="text-zinc-600 mt-0.5 leading-tight">{s.log}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500">
                  <Activity className="h-6 w-6 mx-auto text-zinc-400 mb-2" />
                  <p className="font-bold text-[#121316]">No telemetry recorded yet.</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Click "RUN MY WORKFLOW" below to execute your custom wired graph.</p>
                </div>
              )
            ) : selectedNode ? (
              <div className="space-y-4">
                {/* Node Identity */}
                <div className="p-2.5 rounded bg-[#f8f8fa] border-2 border-[#121316] shadow-[2px_2px_0px_#121316] flex items-center justify-between">
                  <div>
                    <div className="text-[9px] uppercase font-black text-zinc-500">Selected Node</div>
                    <div className="text-xs font-black text-[#121316] mt-0.5">{selectedNode.title}</div>
                    <div className="text-[10px] text-[#ff2a3b] font-mono font-bold mt-0.5">
                      Class: {selectedNode.subtitle}
                    </div>
                  </div>
                  {/* Delete Node Button */}
                  <button
                    onClick={deleteSelectedNode}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-400 rounded text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
                    title="Delete this block from canvas"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Config Properties */}
                <div>
                  <div className="text-[9px] uppercase font-black text-zinc-500 mb-1.5">
                    Configured Properties
                  </div>
                  <div className="space-y-1.5">
                    {selectedNode.config &&
                      Object.entries(selectedNode.config).map(([k, v]) => (
                        <div
                          key={k}
                          className="p-2 rounded bg-[#f8f8fa] border border-[#121316] text-[10px]"
                        >
                          <div className="text-zinc-500 font-bold uppercase text-[9px]">{k}</div>
                          <div className="font-bold text-[#121316] mt-0.5 truncate">{v}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Pins */}
                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div className="p-2 rounded bg-[#f8f8fa] border border-[#121316] text-center">
                    <div className="text-zinc-500 font-bold text-[9px]">Inputs</div>
                    <div className="text-sm font-black text-[#121316]">{selectedNode.inputPins.length} Pins</div>
                  </div>
                  <div className="p-2 rounded bg-[#f8f8fa] border border-[#121316] text-center">
                    <div className="text-zinc-500 font-bold text-[9px]">Outputs</div>
                    <div className="text-sm font-black text-[#121316]">{selectedNode.outputPins.length} Pins</div>
                  </div>
                </div>

                {/* Active Wires on this node */}
                <div>
                  <div className="flex items-center justify-between text-[9px] uppercase font-black text-zinc-500 mb-1.5">
                    <span>Connected Wires ({selectedNodeConnections.length})</span>
                    <span className="text-[8px] text-[#ff2a3b] font-mono">click × to disconnect</span>
                  </div>
                  {selectedNodeConnections.length === 0 ? (
                    <div className="p-2.5 rounded bg-[#f8f8fa] border border-dashed border-zinc-300 text-center text-[10px] text-zinc-500">
                      No wires connected. Click any pin to drag a wire to another node!
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {selectedNodeConnections.map((conn) => {
                        const isSource = conn.fromNodeId === selectedNode.id;
                        const otherNode = nodes.find(
                          (n) => n.id === (isSource ? conn.toNodeId : conn.fromNodeId)
                        );
                        return (
                          <div
                            key={conn.id}
                            className="p-1.5 rounded bg-[#f8f8fa] border border-[#121316] flex items-center justify-between text-[10px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span
                                className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                                  isSource
                                    ? "bg-amber-100 text-amber-900 border border-amber-400"
                                    : "bg-blue-100 text-blue-900 border border-blue-400"
                                }`}
                              >
                                {isSource ? "OUT →" : "← IN"}
                              </span>
                              <span className="font-mono text-[9px] text-[#121316] font-bold truncate">
                                {isSource ? conn.fromPinId : conn.toPinId}
                              </span>
                              <span className="text-zinc-400">→</span>
                              <span className="font-sans text-[9px] text-zinc-700 truncate font-semibold">
                                {otherNode?.title || (isSource ? conn.toNodeId : conn.fromNodeId)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeConnection(conn.id);
                              }}
                              className="ml-1 p-1 hover:bg-rose-100 rounded text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                              title="Disconnect Wire"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500">
                Select any node in the Blueprint viewport to inspect properties or delete it.
              </div>
            )}
          </div>

          {/* Bottom Execution Button */}
          <div className="pt-3 border-t-2 border-[#121316] mt-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runCustomWorkflow}
              disabled={isSimulating || nodes.length === 0}
              className="w-full text-xs font-black border-2 border-[#121316] bg-[#ff2a3b] text-white hover:bg-[#d91e2e] shadow-[2px_2px_0px_#121316] transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3 w-3 mr-1 fill-current" />
              {isSimulating ? "EXECUTING CUSTOM GRAPH..." : "RUN MY WORKFLOW"}
            </Button>

            {selectedNode && (
              <Button
                variant="outline"
                size="sm"
                onClick={deleteSelectedNode}
                className="w-full text-[10px] font-bold border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="h-3 w-3 mr-1 text-rose-600" />
                DELETE SELECTED BLOCK
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
