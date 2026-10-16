import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AGENT_TEMPLATES, AgentTemplate } from "../data/templates";

export interface AttachedDoc {
  name: string;
  size?: number;
  content?: string;
}

export interface ConfiguredAgent {
  id: string;
  name: string;
  category: string;
  channel: "whatsapp" | "email" | "web" | "both";
  model: "groq" | "gemini";
  status: "active" | "draft" | "paused";
  conversationsHandled: number;
  systemPrompt: string;
  knowledgeBaseFiles: string[];
  attachedDocs?: AttachedDoc[];
  temperature: number;
  lastActive: string;
  companyEmail?: string;
  senderDisplayName?: string;
  emailPassword?: string;
}

interface AgentStoreState {
  agents: ConfiguredAgent[];
  selectedAgent: ConfiguredAgent | null;
  testingAgent: ConfiguredAgent | null;
  isConfigDialogOpen: boolean;
  toggleAgentStatus: (id: string) => void;
  openConfigDialog: (agent?: ConfiguredAgent) => void;
  closeConfigDialog: () => void;
  setTestingAgent: (agent: ConfiguredAgent | null) => void;
  saveAgent: (agent: Partial<ConfiguredAgent> & { id?: string }) => void;
  createFromTemplate: (template: AgentTemplate) => void;
  deleteAgent: (id: string) => void;
}

const INITIAL_AGENTS: ConfiguredAgent[] = [
  {
    id: "agent-apexrig",
    name: "ApexRig Gaming PC Architect",
    category: "Custom PC Hardware",
    channel: "both",
    model: "groq",
    status: "active",
    conversationsHandled: 8420,
    systemPrompt:
      "You are the Lead Hardware Architect at ApexRig Gaming Technologies (company email: vaibhavwaghelaa@gmail.com). You evaluate gaming PC builds, detect CPU/GPU bottlenecks (e.g., warning against pairing an RTX 4080 Super with an Intel i3), and dispatch quotes via WhatsApp (+91 87800 42609) and Email.",
    knowledgeBaseFiles: ["ApexRig_Q1_2026_Catalog.pdf", "GPU_CPU_Bottleneck_Matrix.xlsx"],
    companyEmail: "vaibhavwaghelaa@gmail.com",
    senderDisplayName: "ApexRig Gaming Support",
    temperature: 0.3,
    lastActive: "Active now"
  },
  {
    id: "agent-1",
    name: "Real Estate Sales Agent",
    category: "Real Estate",
    channel: "whatsapp",
    model: "groq",
    status: "active",
    conversationsHandled: 5412,
    systemPrompt: AGENT_TEMPLATES[0].systemPrompt,
    knowledgeBaseFiles: ["SkyLine_Brochure_2026.pdf", "Pricing_Matrix_Q1.xlsx"],
    companyEmail: "vaibhavwaghelaa@gmail.com",
    senderDisplayName: "Skyline Properties Sales",
    temperature: 0.4,
    lastActive: "Just now"
  },
  {
    id: "agent-2",
    name: "JM PlastoPack Bot",
    category: "Manufacturing",
    channel: "web",
    model: "groq",
    status: "active",
    conversationsHandled: 3820,
    systemPrompt: AGENT_TEMPLATES[1].systemPrompt,
    knowledgeBaseFiles: ["Container_Specs_v3.pdf", "MOQ_Discount_Tiers.pdf"],
    companyEmail: "vaibhavwaghelaa@gmail.com",
    senderDisplayName: "JM PlastoPack Desk",
    temperature: 0.3,
    lastActive: "2m ago"
  },
  {
    id: "agent-3",
    name: "Pharma Compliance Reviewer",
    category: "Healthcare & Pharma",
    channel: "email",
    model: "gemini",
    status: "active",
    conversationsHandled: 1240,
    systemPrompt: AGENT_TEMPLATES[2].systemPrompt,
    knowledgeBaseFiles: ["CDSCO_Stability_Guidelines.pdf"],
    companyEmail: "vaibhavwaghelaa@gmail.com",
    senderDisplayName: "Pharma Compliance Desk",
    temperature: 0.2,
    lastActive: "14m ago"
  },
  {
    id: "agent-4",
    name: "UAE Logistics Reactivator",
    category: "Logistics",
    channel: "whatsapp",
    model: "groq",
    status: "paused",
    conversationsHandled: 2375,
    systemPrompt: AGENT_TEMPLATES[3].systemPrompt,
    knowledgeBaseFiles: ["Q1_Freight_Rate_Card.xlsx"],
    companyEmail: "vaibhavwaghelaa@gmail.com",
    senderDisplayName: "UAE Logistics Ops",
    temperature: 0.5,
    lastActive: "1h ago"
  }
];

export const useAgentStore = create<AgentStoreState>()(
  persist(
    (set) => ({
      agents: INITIAL_AGENTS,
      selectedAgent: null,
      testingAgent: null,
      isConfigDialogOpen: false,

      setTestingAgent: (agent) =>
        set({
          testingAgent: agent
        }),

      toggleAgentStatus: (id: string) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id
              ? {
                  ...agent,
                  status: agent.status === "active" ? "paused" : "active"
                }
              : agent
          )
        })),

      openConfigDialog: (agent) =>
        set({
          selectedAgent: agent || null,
          isConfigDialogOpen: true
        }),

      closeConfigDialog: () =>
        set({
          selectedAgent: null,
          isConfigDialogOpen: false
        }),

      saveAgent: (updatedData) =>
        set((state) => {
          if (updatedData.id && state.agents.some((a) => a.id === updatedData.id)) {
            return {
              agents: state.agents.map((a) =>
                a.id === updatedData.id ? ({ ...a, ...updatedData } as ConfiguredAgent) : a
              ),
              isConfigDialogOpen: false,
              selectedAgent: null
            };
          } else {
            const newAgent: ConfiguredAgent = {
              id: `agent-${Date.now()}`,
              name: updatedData.name || "Custom AI Agent",
              category: updatedData.category || "General",
              channel: updatedData.channel || "whatsapp",
              model: updatedData.model || "groq",
              status: "active",
              conversationsHandled: 0,
              systemPrompt: updatedData.systemPrompt || "You are a helpful business AI agent.",
              knowledgeBaseFiles: updatedData.knowledgeBaseFiles || [],
              attachedDocs: updatedData.attachedDocs || [],
              temperature: updatedData.temperature ?? 0.4,
              lastActive: "Just now",
              companyEmail: updatedData.companyEmail || "vaibhavwaghelaa@gmail.com",
              senderDisplayName: updatedData.senderDisplayName || "ApexRig Gaming Support",
              emailPassword: updatedData.emailPassword
            };
            return {
              agents: [newAgent, ...state.agents],
              isConfigDialogOpen: false,
              selectedAgent: null
            };
          }
        }),

      createFromTemplate: (template: AgentTemplate) =>
        set((state) => {
          const newAgent: ConfiguredAgent = {
            id: `agent-${Date.now()}`,
            name: template.name,
            category: template.category,
            channel: template.channel,
            model: template.model,
            status: "active",
            conversationsHandled: 0,
            systemPrompt: template.systemPrompt,
            knowledgeBaseFiles: ["Uploaded_Catalog_Demo.pdf"],
            temperature: 0.4,
            lastActive: "Just created",
            companyEmail: "vaibhavwaghelaa@gmail.com",
            senderDisplayName: `${template.name} Support`
          };
          return {
            agents: [newAgent, ...state.agents]
          };
        }),

      deleteAgent: (id: string) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id)
        }))
    }),
    {
      name: "synthopsis_agent_fleet_store",
      partialize: (state) => ({ agents: state.agents })
    }
  )
);
