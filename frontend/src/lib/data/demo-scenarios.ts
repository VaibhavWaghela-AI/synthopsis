export interface DemoScenario {
  id: string;
  title: string;
  channel: "whatsapp" | "email" | "web";
  badgeText: string;
  sender: string;
  senderAvatar: string;
  inboundMessage: string;
  expectedModel: "groq" | "gemini";
  simulatedResponse: string;
  metadata?: {
    subject?: string;
    orderId?: string;
    leadScore?: number;
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "urgent-refund-wa",
    title: "Urgent Refund (WhatsApp)",
    channel: "whatsapp",
    badgeText: "High Priority",
    sender: "+91 98254 11029 (Rajesh Patel)",
    senderAvatar: "RP",
    inboundMessage: "Hi, I placed order #UP-8924 for 500 plastic packaging bottles yesterday, but our factory specs changed. I need to cancel and get an urgent refund immediately. Please assist!",
    expectedModel: "groq",
    simulatedResponse: `Hello Rajesh Ji! We understand your urgency. 

I have located your order **#UP-8924** (500 units HDPE bottles). Since production has not yet started on your batch, I have placed an immediate hold on dispatch and initiated a 100% refund of ₹14,200 to your original payment method. 

You will receive the bank reference number via SMS within 15 minutes. Would you also like our packaging engineer to send updated catalog specs for your new requirements?`,
    metadata: {
      orderId: "UP-8924",
      leadScore: 92
    }
  },
  {
    id: "enterprise-rfp-email",
    title: "Enterprise RFP (Email)",
    channel: "email",
    badgeText: "Enterprise Deal",
    sender: "s.nambiar@apexhealth.in (Apex Healthcare Pvt Ltd)",
    senderAvatar: "AN",
    inboundMessage: `Dear Synthopsis AI Solutions Team,

We are evaluating enterprise agent orchestration platforms across our 14 diagnostic laboratory branches in Western India. 

Our core requirements:
1. Automated patient appointment scheduling via WhatsApp with CDSCO/HIPAA compliant data processing.
2. Direct integration with our SAP ERP system for lab reagent reordering.
3. Multi-language support (Hindi, Gujarati, English).

Kindly provide your formal commercial proposal, technical data security architecture, and SLA commitments by end of week.

Best regards,
Suresh Nambiar
Chief Technology Officer | Apex Healthcare Pvt Ltd`,
    expectedModel: "gemini",
    simulatedResponse: `Subject: Re: Enterprise AI Agent Architecture & Commercial Proposal — Apex Healthcare x Synthopsis AI

Dear Mr. Nambiar,

Thank you for reaching out to Synthopsis AI. We would be delighted to partner with Apex Healthcare to automate patient workflows across your 14 Western India diagnostic hubs.

Regarding your core requirements:
1. **CDSCO / Healthcare Compliance**: Synthopsis AI operates with isolated tenant encryption, role-based data anonymization, and audit logs that adhere strictly to Indian Digital Personal Data Protection (DPDP) and healthcare regulatory benchmarks.
2. **ERP & SAP Integration**: Our pre-built REST webhooks and SAP connectors allow real-time inventory threshold triggers for automated reagent PO generation.
3. **Vernacular AI**: Synthopsis AI natively supports Gujarati, Hindi, and English through our low-latency multi-model routing engine.

We have attached our preliminary Enterprise Architecture Whitepaper and tiered SLA documentation. I have tentatively held 3:00 PM IST tomorrow for a brief technical alignment call with our Solution Engineering team.

Warm regards,

Synthopsis AI Enterprise Solutions Team
Synthopsis Autonomous Systems | Ahmedabad, India`,
    metadata: {
      subject: "RFP: Multi-channel AI Agent Deployment for 14 Diagnostic Branches",
      leadScore: 98
    }
  },
  {
    id: "pricing-inquiry-web",
    title: "Pricing Inquiry (Web Chat)",
    channel: "web",
    badgeText: "High Intent",
    sender: "Anonymous Visitor from Ahmedabad",
    senderAvatar: "AV",
    inboundMessage: "Hi! We are a 45-person real estate agency with 12 property consultants. We want to know how much Synthopsis AI costs to handle WhatsApp inquiries and book weekend visits. Can we customize the prompts?",
    expectedModel: "groq",
    simulatedResponse: `Welcome to Synthopsis AI!

For a 45-person real estate firm with 12 consultants, our **Growth Plan (₹14,999/month)** is the ideal match! 

Here is what you get out of the box:
- Up to **10 specialized AI Agents** across WhatsApp and Web Chat
- Handles **10,000 conversations/month** with real-time site visit booking
- **Full Prompt Customization** with your property catalogs, floor plans, and pricing sheets
- **CRM Sync** to instantly assign qualified leads to your 12 consultants with full chat transcripts!

Would you like me to book a 10-minute live demonstration right now, or should I calculate your estimated ROI based on your current lead volume?`,
    metadata: {
      leadScore: 89
    }
  }
];
