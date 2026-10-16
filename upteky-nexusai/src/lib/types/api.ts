/**
 * Upteky NexusAI - Unified Backend & AI Type Contracts
 * Contract-first interfaces for Multi-Model Routing, Agents, Workflows & Analytics
 */

export type AIModelProvider = "groq" | "gemini" | "auto";
export type CommunicationChannel = "whatsapp" | "email" | "web";

export type IndustryVertical = 
  | "real_estate" 
  | "manufacturing" 
  | "logistics" 
  | "pharma" 
  | "general";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  channel?: CommunicationChannel;
  model?: AIModelProvider;
  agentId?: string;
  systemInstruction?: string;
  temperature?: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  vertical: IndustryVertical;
  channel: CommunicationChannel[];
  preferredModel: AIModelProvider;
  systemPrompt: string;
  description: string;
  avatar: string;
  status: "active" | "draft" | "paused";
  conversationsHandled: number;
  conversionRate: number;
  avgResponseSeconds: number;
  caseStudyRef?: string;
  samplePrompts: string[];
}

export interface WorkflowNode {
  id: string;
  type: "trigger" | "ai_eval" | "decision" | "action";
  label: string;
  config: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecutionStep {
  step: number;
  nodeId: string;
  nodeLabel: string;
  type: "trigger" | "ai_eval" | "decision" | "action";
  status: "pending" | "running" | "completed" | "failed";
  inputData: any;
  outputData: any;
  executionTimeMs: number;
  log: string;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  executionId: string;
  status: "success" | "error";
  totalDurationMs: number;
  steps: WorkflowExecutionStep[];
  finalOutput: any;
}

export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  channel: CommunicationChannel;
  industry: IndustryVertical;
  suggestedModel: AIModelProvider;
  initialMessage: string;
  agentId: string;
  expectedOutcome: string;
}

export interface KPIMetrics {
  totalConversations: number;
  activeAgents: number;
  avgResponseMinutes: number;
  leadConversionRate: number;
  recoveredLeadsPercentage: number;
  docErrorReductionPercentage: number;
  totalCostSavedInr: number;
  channelDistribution: {
    whatsapp: number;
    web: number;
    email: number;
  };
  monthlyPerformance: Array<{
    month: string;
    conversations: number;
    qualifiedLeads: number;
    costSaved: number;
  }>;
}
