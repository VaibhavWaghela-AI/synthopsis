import { DemoScenario } from "../types/api";

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "scenario-plastopack-order",
    title: "JM PlastoPack: Order Status & Custom Packaging MOQ",
    description: "Demonstrates rapid B2B quotation, multilingual comprehension, and ERP order tracking.",
    channel: "whatsapp",
    industry: "manufacturing",
    suggestedModel: "groq",
    agentId: "agent-plastopack-02",
    initialMessage: "Hello! We urgently need 25,000 HDPE tamper-evident bottles for our agrochemical plant in Sanand. What is your best MOQ price and lead time? Also check status of order JMP-7721.",
    expectedOutcome: "Agent quotes MOQ tiered pricing, confirms 10-day lead time, and pulls ERP status for JMP-7721 with zero lag."
  },
  {
    id: "scenario-logistics-reactivation",
    title: "UAE Logistics: Dormant Lead Re-engagement",
    description: "Demonstrates autonomous cold lead revival with dynamic spot rate incentive.",
    channel: "whatsapp",
    industry: "logistics",
    suggestedModel: "groq",
    agentId: "agent-logistics-03",
    initialMessage: "Hi, I saw your WhatsApp message about lower freight rates. We haven't shipped through you since November because prices spiked. Do you really have 20ft slots from Dubai to Mundra under $650?",
    expectedOutcome: "Agent acknowledges previous shipment history, locks in the spot rate, and offers 14-day free demurrage."
  },
  {
    id: "scenario-realestate-luxury",
    title: "Real Estate: High-Net-Worth Lead Qualification",
    description: "Demonstrates 24/7 lead filtering, instant brochure dispatch, and site inspection booking.",
    channel: "web",
    industry: "real_estate",
    suggestedModel: "groq",
    agentId: "agent-realestate-01",
    initialMessage: "Looking for an ultra-luxury 4 BHK duplex or penthouse in Ahmedabad with golf-course or riverfront view. Budget around ₹3.5 Cr. Can you share floor plans?",
    expectedOutcome: "Agent qualifies budget, confirms brochure dispatched to WhatsApp, and offers two specific viewing times."
  },
  {
    id: "scenario-pharma-compliance",
    title: "Pharma: BMR Regulatory Compliance Flagging",
    description: "Demonstrates deep reasoning, regulatory accuracy, and formal email report drafting.",
    channel: "email",
    industry: "pharma",
    suggestedModel: "gemini",
    agentId: "agent-pharma-04",
    initialMessage: "Subject: Urgent review required for Export Batch Paracetamol 500mg (Batch #PC-902). During granulation, humidity reached 68% for 45 minutes. Please draft the regulatory deviation assessment for WHO-GMP audit readiness.",
    expectedOutcome: "Agent generates a formal, scientifically sound deviation letter citing stability monographs and QA containment protocols."
  }
];
