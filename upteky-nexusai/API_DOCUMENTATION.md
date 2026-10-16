# 📡 Upteky NexusAI - Backend & AI API Contract
> For Frontend Engineers (Person A) and Pitch Lead (Person C).  
> All endpoints are live and running under Next.js 14 App Router (`src/app/api/...`).

---

## 🌟 Quick Overview of Endpoints

| Endpoint | Method | Description |
|:---|:---|:---|
| `/api/chat` | `POST` | **Streaming AI Chat** (Groq Llama 3.3 + Gemini 2.0 Flash with auto-fallback) |
| `/api/agents` | `GET`, `POST` | List pre-configured agents or create custom client agents |
| `/api/workflow/execute` | `POST` | Execute visual pipeline simulation (Intent Scoring -> ERP Sync) |
| `/api/scenarios` | `GET` | Retrieve 4 pre-built 1-click test scenarios for judges |
| `/api/analytics` | `GET`, `POST` | Upteky case-study benchmarks & dynamic ROI calculator |
| `/api/health` | `GET` | Check API key status and active AI providers |

---

## 1. Streaming Chat Endpoint (`POST /api/chat`)

Use this for the Omnichannel Inbox (WhatsApp, Email, Web Chat). Supports streaming plain text chunks with custom response headers.

### Request Body:
```json
{
  "messages": [
    { "role": "user", "content": "What is the MOQ for 500ml HDPE bottles?" }
  ],
  "channel": "whatsapp",        // "whatsapp" | "email" | "web"
  "model": "auto",              // "groq" | "gemini" | "auto"
  "vertical": "manufacturing",  // "manufacturing" | "logistics" | "real_estate" | "pharma" | "general"
  "customInstruction": "Optional client specific prompt override",
  "temperature": 0.7
}
```

### Response Headers:
- `Content-Type`: `text/plain; charset=utf-8`
- `X-AI-Provider`: `"groq"` | `"gemini"` | `"simulated"`
- `X-AI-Model`: `"Groq Llama 3.3 70B (Ultra-Low Latency)"` (Used to show speed badge in UI!)

### Frontend Streaming Consumer Snippet:
```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Quote for 10k bottles" }],
    channel: "whatsapp",
    model: "groq",
    vertical: "manufacturing"
  })
});

const provider = response.headers.get("X-AI-Provider"); // "groq"
const modelName = response.headers.get("X-AI-Model");   // "Groq Llama 3.3 70B"

const reader = response.body.getReader();
const decoder = new TextDecoder();
let aiReply = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  aiReply += decoder.decode(value);
  setChatBubbleText(aiReply); // React state update
}
```

---

## 2. Agents Registry (`GET /api/agents`)

Returns the 4 industry agents based on Upteky's actual case studies:
1. `agent-realestate-01`: **AuraEstate Sales Copilot** (WhatsApp, Web)
2. `agent-plastopack-02`: **JM PlastoPack Manufacturing Bot** (WhatsApp, Web, Email - Gujarati/English)
3. `agent-logistics-03`: **UAE Logistics Lead Reviver** (WhatsApp, Email - 52% reactivation benchmark)
4. `agent-pharma-04`: **PharmaDoc Compliance Validator** (Web, Email - 70% error reduction benchmark)

### Response Body:
```json
{
  "success": true,
  "total": 4,
  "data": [
    {
      "id": "agent-plastopack-02",
      "name": "JM PlastoPack Manufacturing Bot",
      "vertical": "manufacturing",
      "channel": ["whatsapp", "web", "email"],
      "preferredModel": "groq",
      "avatar": "📦",
      "conversationsHandled": 5120,
      "conversionRate": 42.1,
      "avgResponseSeconds": 0.8,
      "samplePrompts": [
        "What is the MOQ and rate per kg for 500ml HDPE bottles?",
        "મારી ઓર્ડર સ્થિતિ શું છે? ઓર્ડર નંબર JMP-4402 છે."
      ]
    }
  ]
}
```

---

## 3. Workflow Pipeline Simulation (`POST /api/workflow/execute`)

Triggered when the user clicks **"Run Simulation"** on the React Flow canvas.

### Request Body:
```json
{
  "channel": "whatsapp",
  "sender": "+91-98250-99120",
  "message": "Need quotation for 25,000 units delivered to Sanand GIDC."
}
```

### Response Body:
```json
{
  "success": true,
  "data": {
    "workflowId": "wf-omnichannel-lead-reviver",
    "executionId": "exec-9a7f3b12",
    "status": "success",
    "totalDurationMs": 249,
    "steps": [
      {
        "step": 1,
        "nodeId": "node-1",
        "nodeLabel": "Inbound Message Trigger",
        "type": "trigger",
        "status": "completed",
        "executionTimeMs": 14,
        "log": "Captured inbound event from WHATSAPP (+91-98250-99120). Message parsed."
      },
      {
        "step": 2,
        "nodeId": "node-2",
        "nodeLabel": "NexusAI Intent & Lead Scorer",
        "type": "ai_eval",
        "status": "completed",
        "executionTimeMs": 185,
        "log": "Groq Llama 3.3 evaluated message in 185ms. Intent classified as high_intent_rfq (92% confidence)."
      },
      {
        "step": 3,
        "nodeId": "node-3",
        "nodeLabel": "Lead Intent Threshold (>75%)",
        "type": "decision",
        "status": "completed",
        "executionTimeMs": 8,
        "log": "Decision check evaluated: score 92% >= 75%. Routing to VIP Fast-Track Action."
      },
      {
        "step": 4,
        "nodeId": "node-4",
        "nodeLabel": "Auto-Dispatch Response & ERP Sync",
        "type": "action",
        "status": "completed",
        "executionTimeMs": 42,
        "log": "Dispatched automated WHATSAPP quotation. Created CRM deal record. Notified sales rep."
      }
    ],
    "finalOutput": {
      "leadStatus": "Qualified & Dispatched",
      "confidence": 92,
      "actionTaken": "Automated WHATSAPP response delivered."
    }
  }
}
```

---

## 4. 1-Click Judge Demo Scenarios (`GET /api/scenarios`)

Returns pre-written realistic customer inquiries ready for the inbox UI test buttons:
- **Button 1**: `JM PlastoPack: Order Status & Custom Packaging MOQ` (WhatsApp)
- **Button 2**: `UAE Logistics: Dormant Lead Re-engagement` (WhatsApp)
- **Button 3**: `Real Estate: High-Net-Worth Lead Qualification` (Web)
- **Button 4**: `Pharma: BMR Regulatory Compliance Flagging` (Email)

---

## 5. Analytics & Custom ROI Calculator

### `GET /api/analytics`
Returns Upteky's actual client benchmarks:
- Total conversations: `12,847`
- Average response time: `0.8 min` (down from 240 mins)
- Recovered leads: `52%` (UAE Logistics)
- Error reduction: `70%` (Game of Pharma)
- Channel mix: `58% WhatsApp, 27% Web, 15% Email`

### `POST /api/analytics` (Custom ROI Simulator)
```json
// Request:
{ "monthlyInquiries": 5000, "avgHumanCostInr": 200000 }

// Response:
{
  "success": true,
  "data": {
    "monthlyInquiries": 5000,
    "automatedInquiries": 3900,
    "hoursSaved": 780,
    "projectedSavings": 130000,
    "nexusCost": 4999,
    "netMonthlyProfit": 125001,
    "roiMultiplier": 26.0
  }
}
```
