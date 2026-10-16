import {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowExecutionStep
} from "../types/api";

export const DEFAULT_WORKFLOW: WorkflowDefinition = {
  id: "wf-omnichannel-lead-reviver",
  name: "Omnichannel Lead Qualification & Dispatch Pipeline",
  description: "Captures inbound WhatsApp/Web queries, scores purchase intent with Groq/Gemini, synchronizes CRM, and triggers instant notification.",
  nodes: [
    {
      id: "node-1",
      type: "trigger",
      label: "Inbound Message Trigger",
      config: { channel: "whatsapp", event: "message.created" }
    },
    {
      id: "node-2",
      type: "ai_eval",
      label: "NexusAI Intent & Lead Scorer",
      config: { provider: "groq", model: "llama-3.3-70b-versatile" }
    },
    {
      id: "node-3",
      type: "decision",
      label: "Lead Intent Threshold (>75%)",
      config: { threshold: 75 }
    },
    {
      id: "node-4",
      type: "action",
      label: "Auto-Dispatch Response & ERP Sync",
      config: { actions: ["whatsapp_reply", "crm_deal_create", "slack_alert"] }
    }
  ],
  edges: [
    { id: "e1-2", source: "node-1", target: "node-2" },
    { id: "e2-3", source: "node-2", target: "node-3" },
    { id: "e3-4", source: "node-3", target: "node-4", condition: "intent_score >= 75" }
  ]
};

export async function executeWorkflow(
  workflow: WorkflowDefinition = DEFAULT_WORKFLOW,
  inputPayload?: { sender?: string; message?: string; channel?: string }
): Promise<WorkflowExecutionResult> {
  const executionId = "exec-" + Math.random().toString(36).substring(2, 10);
  const sender = inputPayload?.sender || "+91-98250-XXXXX";
  const message = inputPayload?.message || "Interested in 10,000 packaging units. What is the delivery timeframe?";
  const channel = inputPayload?.channel || "whatsapp";

  const startTime = Date.now();
  const steps: WorkflowExecutionStep[] = [];

  // Step 1: Trigger Received
  steps.push({
    step: 1,
    nodeId: "node-1",
    nodeLabel: "Inbound Message Trigger",
    type: "trigger",
    status: "completed",
    inputData: { channel, sender, rawPayload: message },
    outputData: { receivedAt: new Date().toISOString(), payloadSize: message.length },
    executionTimeMs: 14,
    log: `Captured inbound event from ${channel.toUpperCase()} (${sender}). Message parsed.`
  });

  // Step 2: AI Evaluation
  const intentScore = Math.floor(Math.random() * 20) + 80; // 80-99% for high quality demo
  steps.push({
    step: 2,
    nodeId: "node-2",
    nodeLabel: "NexusAI Intent & Lead Scorer",
    type: "ai_eval",
    status: "completed",
    inputData: { message, model: "llama-3.3-70b-versatile" },
    outputData: {
      intent: "high_intent_rfq",
      intentScore,
      sentiment: "positive",
      detectedLanguage: "en",
      keyEntities: { quantity: "10,000", product: "custom packaging" }
    },
    executionTimeMs: 185,
    log: `Groq Llama 3.3 evaluated message in 185ms. Intent classified as high_intent_rfq (${intentScore}% confidence).`
  });

  // Step 3: Decision Gate
  const passedDecision = intentScore >= 75;
  steps.push({
    step: 3,
    nodeId: "node-3",
    nodeLabel: "Lead Intent Threshold (>75%)",
    type: "decision",
    status: "completed",
    inputData: { intentScore, threshold: 75 },
    outputData: { passed: passedDecision, routingBranch: "vip_fasttrack" },
    executionTimeMs: 8,
    log: `Decision check evaluated: score ${intentScore}% >= 75%. Routing to VIP Fast-Track Action.`
  });

  // Step 4: Action Execution
  steps.push({
    step: 4,
    nodeId: "node-4",
    nodeLabel: "Auto-Dispatch Response & ERP Sync",
    type: "action",
    status: "completed",
    inputData: { branch: "vip_fasttrack", recipient: sender },
    outputData: {
      dispatchedChannel: channel,
      crmDealId: "DEAL-" + Math.floor(1000 + Math.random() * 9000),
      deliveryEstimateDays: 10,
      quoteGenerated: true
    },
    executionTimeMs: 42,
    log: `Dispatched automated ${channel.toUpperCase()} quotation. Created CRM deal record. Notified sales representative.`
  });

  const totalDurationMs = Date.now() - startTime;

  return {
    workflowId: workflow.id,
    executionId,
    status: "success",
    totalDurationMs,
    steps,
    finalOutput: {
      leadStatus: "Qualified & Dispatched",
      confidence: intentScore,
      actionTaken: `Automated ${channel.toUpperCase()} response delivered.`
    }
  };
}
