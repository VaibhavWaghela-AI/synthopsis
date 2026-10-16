import { create } from "zustand";
import { DEMO_SCENARIOS, DemoScenario } from "../data/demo-scenarios";

export interface Message {
  id: string;
  sender: "user" | "agent" | "system";
  content: string;
  timestamp: string;
  channel: "whatsapp" | "email" | "web";
  modelUsed?: "groq" | "gemini";
  status?: "sent" | "delivered" | "read";
  metadata?: {
    subject?: string;
    fromEmail?: string;
    toEmail?: string;
    orderId?: string;
    leadScore?: number;
  };
}

export interface ChannelConversation {
  channel: "whatsapp" | "email" | "web";
  title: string;
  subtitle: string;
  unreadCount: number;
  messages: Message[];
}

interface InboxStoreState {
  activeChannel: "whatsapp" | "email" | "web";
  activeModel: "groq" | "gemini";
  isStreaming: boolean;
  selectedScenarioId: string | null;
  conversations: Record<"whatsapp" | "email" | "web", ChannelConversation>;
  setActiveChannel: (channel: "whatsapp" | "email" | "web") => void;
  setActiveModel: (model: "groq" | "gemini") => void;
  injectScenario: (scenarioId: string) => Promise<void>;
  injectWorkflowResult: (payload: {
    channel: "whatsapp" | "email" | "web";
    sender: string;
    company: string;
    inboundText: string;
    agentReplyText: string;
    voucherNumber?: string;
    dealValue?: number;
  }) => void;
  sendMessage: (channel: "whatsapp" | "email" | "web", text: string, model?: "groq" | "gemini") => Promise<void>;
  clearChannel: (channel: "whatsapp" | "email" | "web") => void;
}

const INITIAL_CONVERSATIONS: Record<"whatsapp" | "email" | "web", ChannelConversation> = {
  whatsapp: {
    channel: "whatsapp",
    title: "+91 98254 11029 (Rajesh Patel)",
    subtitle: "Lead Qualification Agent (Active)",
    unreadCount: 2,
    messages: [
      {
        id: "wa-1",
        sender: "user",
        content: "Hi, I wanted to know if 2BHK is still available in SkyLine Heights?",
        timestamp: "10:14 AM",
        channel: "whatsapp",
        status: "read"
      },
      {
        id: "wa-2",
        sender: "agent",
        content: "Namaste Rajesh Ji! Yes, we have 4 premium garden-facing 2BHK units available on the 7th & 12th floors starting at ₹64 Lakhs. Would you like me to share the floor layout and pricing breakdown here?",
        timestamp: "10:14 AM",
        channel: "whatsapp",
        modelUsed: "groq",
        status: "read"
      }
    ]
  },
  email: {
    channel: "email",
    title: "Apex Healthcare Solutions",
    subtitle: "Enterprise Regulatory & RFP Desk",
    unreadCount: 1,
    messages: [
      {
        id: "em-1",
        sender: "user",
        content: `Dear Synthopsis Team, We are exploring automated diagnostic scheduling across 14 hubs in Gujarat and Maharashtra. Please provide data privacy certifications and SAP API integration details.`,
        timestamp: "Yesterday, 4:32 PM",
        channel: "email",
        metadata: {
          subject: "Inquiry: Automated Patient Scheduling & SAP Integration",
          fromEmail: "s.nambiar@apexhealth.in",
          toEmail: "enterprise@synthopsis.ai"
        }
      },
      {
        id: "em-2",
        sender: "agent",
        content: `Dear Mr. Nambiar,\n\nThank you for reaching out to Synthopsis AI. Our multi-agent infrastructure is built with HIPAA and DPDP-ready data masking, and provides turnkey SAP ECC / S/4HANA webhooks.\n\nOur full enterprise security whitepaper and sample B2B SLA have been attached.\n\nBest regards,\nSynthopsis AI Operations Desk`,
        timestamp: "Yesterday, 4:33 PM",
        channel: "email",
        modelUsed: "gemini",
        metadata: {
          subject: "Re: Inquiry: Automated Patient Scheduling & SAP Integration",
          fromEmail: "enterprise@synthopsis.ai",
          toEmail: "s.nambiar@apexhealth.in"
        }
      }
    ]
  },
  web: {
    channel: "web",
    title: "Website Live Visitor #4092",
    subtitle: "JM PlastoPack B2B Widget",
    unreadCount: 1,
    messages: [
      {
        id: "wb-1",
        sender: "user",
        content: "What is your MOQ for 1-litre chemical containers with induction wads?",
        timestamp: "11:05 AM",
        channel: "web"
      },
      {
        id: "wb-2",
        sender: "agent",
        content: "Hello! Our standard MOQ for 1000ml HDPE containers with induction heat seal wads is 5,000 units. For quantities above 25,000, we provide a 12% bulk rebate and customized color masterbatching. Would you like a formal proforma quote sent to your email?",
        timestamp: "11:05 AM",
        channel: "web",
        modelUsed: "groq"
      }
    ]
  }
};

export const useInboxStore = create<InboxStoreState>((set, get) => ({
  activeChannel: "whatsapp",
  activeModel: "groq",
  isStreaming: false,
  selectedScenarioId: null,
  conversations: INITIAL_CONVERSATIONS,

  setActiveChannel: (channel) =>
    set((state) => ({
      activeChannel: channel,
      conversations: {
        ...state.conversations,
        [channel]: {
          ...state.conversations[channel],
          unreadCount: 0
        }
      }
    })),

  setActiveModel: (model) => set({ activeModel: model }),

  injectScenario: async (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    set({ activeChannel: scenario.channel, selectedScenarioId: scenarioId, isStreaming: true });

    // 1. Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      content: scenario.inboundMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel: scenario.channel,
      status: "delivered",
      metadata: scenario.metadata
    };

    set((state) => ({
      conversations: {
        ...state.conversations,
        [scenario.channel]: {
          ...state.conversations[scenario.channel],
          messages: [...state.conversations[scenario.channel].messages, userMsg]
        }
      }
    }));

    // 2. Stream AI response (call api or fallback to simulation)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: scenario.inboundMessage }],
          model: scenario.expectedModel,
          channel: scenario.channel
        })
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        const agentMsgId = `msg-${Date.now()}-agent`;
        const initialAgentMsg: Message = {
          id: agentMsgId,
          sender: "agent",
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          channel: scenario.channel,
          modelUsed: scenario.expectedModel,
          status: "delivered",
          metadata: scenario.metadata
        };

        set((state) => ({
          conversations: {
            ...state.conversations,
            [scenario.channel]: {
              ...state.conversations[scenario.channel],
              messages: [...state.conversations[scenario.channel].messages, initialAgentMsg]
            }
          }
        }));

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });

          set((state) => ({
            conversations: {
              ...state.conversations,
              [scenario.channel]: {
                ...state.conversations[scenario.channel],
                messages: state.conversations[scenario.channel].messages.map((m) =>
                  m.id === agentMsgId ? { ...m, content: fullText } : m
                )
              }
            }
          }));
        }
      } else {
        throw new Error("Fallback to mock scenario");
      }
    } catch {
      // Graceful simulated typewriter stream fallback
      const agentMsgId = `msg-${Date.now()}-agent`;
      const agentMsg: Message = {
        id: agentMsgId,
        sender: "agent",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        channel: scenario.channel,
        modelUsed: scenario.expectedModel,
        status: "delivered",
        metadata: scenario.metadata
      };

      set((state) => ({
        conversations: {
          ...state.conversations,
          [scenario.channel]: {
            ...state.conversations[scenario.channel],
            messages: [...state.conversations[scenario.channel].messages, agentMsg]
          }
        }
      }));

      const fullText = scenario.simulatedResponse;
      const chunks = fullText.split(" ");
      let currentText = "";

      for (let i = 0; i < chunks.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 35));
        currentText += (i === 0 ? "" : " ") + chunks[i];
        set((state) => ({
          conversations: {
            ...state.conversations,
            [scenario.channel]: {
              ...state.conversations[scenario.channel],
              messages: state.conversations[scenario.channel].messages.map((m) =>
                m.id === agentMsgId ? { ...m, content: currentText } : m
              )
            }
          }
        }));
      }
    } finally {
      set({ isStreaming: false });
    }
  },

  injectWorkflowResult: (payload) => {
    const userMsg: Message = {
      id: `wf-${Date.now()}-inbound`,
      sender: "user",
      content: payload.inboundText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel: payload.channel,
      status: "delivered",
      metadata: {
        orderId: payload.voucherNumber,
        leadScore: 98,
        subject: `${payload.company} Commercial RFQ`
      }
    };

    const agentMsg: Message = {
      id: `wf-${Date.now()}-outbound`,
      sender: "agent",
      content: payload.agentReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel: payload.channel,
      modelUsed: "groq",
      status: "delivered",
      metadata: {
        orderId: payload.voucherNumber,
        leadScore: 98
      }
    };

    set((state) => ({
      activeChannel: payload.channel,
      conversations: {
        ...state.conversations,
        [payload.channel]: {
          channel: payload.channel,
          title: `${payload.sender} (${payload.company})`,
          subtitle: payload.voucherNumber && payload.voucherNumber !== "N/A (Standard Route)"
            ? `Tally ERP Voucher: ${payload.voucherNumber}`
            : "Automated Workflow Response",
          unreadCount: 1,
          messages: [...state.conversations[payload.channel].messages, userMsg, agentMsg]
        }
      }
    }));
  },

  sendMessage: async (channel, text, model) => {
    if (!text.trim()) return;

    const chosenModel = model || get().activeModel || "groq";

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      channel,
      status: "delivered"
    };

    set((state) => ({
      isStreaming: true,
      conversations: {
        ...state.conversations,
        [channel]: {
          ...state.conversations[channel],
          messages: [...state.conversations[channel].messages, userMsg]
        }
      }
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          model: chosenModel,
          channel
        })
      });

      const agentMsgId = `msg-${Date.now()}-agent`;
      const initialAgentMsg: Message = {
        id: agentMsgId,
        sender: "agent",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        channel,
        modelUsed: chosenModel,
        status: "delivered"
      };

      set((state) => ({
        conversations: {
          ...state.conversations,
          [channel]: {
            ...state.conversations[channel],
            messages: [...state.conversations[channel].messages, initialAgentMsg]
          }
        }
      }));

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });

          set((state) => ({
            conversations: {
              ...state.conversations,
              [channel]: {
                ...state.conversations[channel],
                messages: state.conversations[channel].messages.map((m) =>
                  m.id === agentMsgId ? { ...m, content: fullText } : m
                )
              }
            }
          }));
        }
      } else {
        throw new Error("Offline response fallback");
      }
    } catch {
      const fallbackReply =
        channel === "whatsapp"
          ? "Thank you for reaching out via WhatsApp! Our automated AI agent has logged your request and our specialist is reviewing it right now. How else can we assist you today?"
          : channel === "email"
          ? "Dear Valued Client,\n\nWe have registered your inquiry in the Synthopsis AI Enterprise Router. A solution architect will evaluate your specifications and reply shortly.\n\nSincerely,\nSynthopsis Automation Operations"
          : "Thanks for visiting our site! Our AI agent is configured and active. Feel free to ask about our pricing, SLA, or custom agent templates!";

      const agentMsgId = `msg-${Date.now()}-agent`;
      const agentMsg: Message = {
        id: agentMsgId,
        sender: "agent",
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        channel,
        modelUsed: model,
        status: "delivered"
      };

      set((state) => ({
        conversations: {
          ...state.conversations,
          [channel]: {
            ...state.conversations[channel],
            messages: [...state.conversations[channel].messages, agentMsg]
          }
        }
      }));
    } finally {
      set({ isStreaming: false });
    }
  },

  clearChannel: (channel) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [channel]: {
          ...state.conversations[channel],
          messages: []
        }
      }
    }))
}));
