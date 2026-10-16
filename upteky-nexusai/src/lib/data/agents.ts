import { AgentConfig } from "../types/api";

export const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: "agent-realestate-01",
    name: "AuraEstate Sales Copilot",
    vertical: "real_estate",
    channel: ["whatsapp", "web"],
    preferredModel: "groq",
    description: "Autonomous high-ticket property qualification agent. Dispatches floorplans, calculates EMI estimates, and reserves site-visit slots.",
    avatar: "🏢",
    status: "active",
    conversationsHandled: 3410,
    conversionRate: 38.4,
    avgResponseSeconds: 1.2,
    caseStudyRef: "Upteky Real Estate Automation Insights 2026",
    systemPrompt: "Specialized in luxury residential & commercial properties in Ahmedabad and Dubai.",
    samplePrompts: [
      "What are the 3 BHK options available in GIFT City under ₹1.5 Cr?",
      "Can you send the brochure and floorplan on my WhatsApp?",
      "I want to book an on-site property viewing this Sunday afternoon."
    ]
  },
  {
    id: "agent-plastopack-02",
    name: "JM PlastoPack Manufacturing Bot",
    vertical: "manufacturing",
    channel: ["whatsapp", "web", "email"],
    preferredModel: "groq",
    description: "B2B injection molding and custom packaging specialist with Gujarati & English bilingual support and ERP order synchronization.",
    avatar: "📦",
    status: "active",
    conversationsHandled: 5120,
    conversionRate: 42.1,
    avgResponseSeconds: 0.8,
    caseStudyRef: "JM PlastoPack Case Study (68% faster response rate)",
    systemPrompt: "Handles MOQ queries, custom mold specs, and order tracking (JMP-XXXX).",
    samplePrompts: [
      "What is the MOQ and rate per kg for 500ml HDPE bottles?",
      "મારી ઓર્ડર સ્થિતિ શું છે? ઓર્ડર નંબર JMP-4402 છે.",
      "Track shipment status for order JMP-8912 dispatched from Ahmedabad."
    ]
  },
  {
    id: "agent-logistics-03",
    name: "UAE Logistics Lead Reviver",
    vertical: "logistics",
    channel: ["whatsapp", "email"],
    preferredModel: "gemini",
    description: "Autonomous cold lead reactivation engine. Re-engages dormant shipping accounts with dynamic spot rate discounts.",
    avatar: "🚚",
    status: "active",
    conversationsHandled: 2890,
    conversionRate: 52.0,
    avgResponseSeconds: 2.1,
    caseStudyRef: "UAE Logistics Firm Case Study (52% lead reactivation rate)",
    systemPrompt: "Re-engages shippers, calculates ocean/air freight estimates, and provides port demurrage waivers.",
    samplePrompts: [
      "I received your WhatsApp note about discounted 40ft container rates to Mundra.",
      "Can you quote ocean freight for 2x20ft GP containers from Jebel Ali to Nhava Sheva?",
      "We paused shipping last month due to high demurrage. What are current terms?"
    ]
  },
  {
    id: "agent-pharma-04",
    name: "PharmaDoc Compliance Validator",
    vertical: "pharma",
    channel: ["web", "email"],
    preferredModel: "gemini",
    description: "Regulatory inspection copilot for Batch Manufacturing Records (BMR), Certificate of Analysis (CoA), and WHO-GMP compliance.",
    avatar: "💊",
    status: "active",
    conversationsHandled: 1427,
    conversionRate: 29.5,
    avgResponseSeconds: 3.4,
    caseStudyRef: "Game of Pharma & Vtalix Case Studies (70% document error reduction)",
    systemPrompt: "Structures technical drug stability reports and cross-references regulatory monographs.",
    samplePrompts: [
      "Check this CoA summary for Paracetamol IP 500mg against dissolution tolerances.",
      "Draft a deviation explanation letter for temperature excursion during transport (2-8°C).",
      "Verify if this BMR documentation meets WHO-GMP record retention guidelines."
    ]
  }
];
