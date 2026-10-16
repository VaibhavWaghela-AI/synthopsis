# 🐍 Synthopsis - Python (FastAPI) Multi-Model AI Backend

The official Python backend for **Synthopsis** — Autonomous B2B Multi-Agent Orchestration platform.

## 🚀 Quick Start

### 1. Configure API Keys
Edit `backend/.env`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
GROQ_API_KEY="your_groq_api_key_here"
PORT=8000
```

### 2. Start the Server
Run directly with Python:
```bash
python main.py
```
Or use Uvicorn with live reload:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Or double-click `run_backend.bat` on Windows!

The server will be live at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## 🧪 Running Automated Tests
Run the complete 30-test verification suite:
```bash
python test_backend.py
```
*Current status: 30/30 Tests Passed (100%)*

---

## 📡 API Endpoints Reference

### 1. Multi-Model Streaming Chat (`POST /api/chat`)
Streams real-time plain text responses using Groq (Llama 3.3 70B) or Google Gemini 2.0 Flash.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What is the MOQ for 500ml HDPE bottles?" }
  ],
  "channel": "whatsapp",
  "model": "auto",
  "vertical": "manufacturing"
}
```
**Response**: Plain-text chunk stream with headers:
- `X-AI-Provider`: `groq` | `gemini`
- `X-AI-Engine`: `Synthopsis`

### 2. Industry Agents Registry (`GET /api/agents`, `POST /api/agents`)
Returns pre-configured agents built from real industry case studies:
- **JM PlastoPack Manufacturing Bot** (English + Gujarati bilingual, MOQ calculation, ERP sync)
- **UAE Logistics Lead Reviver** (Cold lead reactivation, 52% recovery rate)
- **AuraEstate Sales Copilot** (Property lead qualification, WhatsApp brochure delivery)
- **PharmaDoc Compliance Validator** (BMR/CoA regulatory inspection, 70% error reduction)

### 3. Multi-Agent Workflow Pipeline (`POST /api/workflow/execute`)
Simulates the autonomous pipeline:
`Inbound Trigger` ➔ `AI Intent Scorer` ➔ `Decision Gate (>75% Intent)` ➔ `Auto-Dispatch & ERP Sync`

**Request:**
```json
{
  "channel": "whatsapp",
  "sender": "+91-98250-99120",
  "message": "Urgent quotation for 25,000 units delivered to Sanand GIDC."
}
```

### 4. 1-Click Demo Scenarios for Judges (`GET /api/scenarios`)
Returns 4 pre-written realistic customer inquiries ready for 1-click test buttons.

### 5. Synthopsis Analytics & Client ROI Simulator
- `GET /api/analytics`: Benchmark metrics (68% faster response, 52% recovery, 70% fewer errors).
- `POST /api/analytics/roi`: Computes custom ROI multiplier, hours saved, and net profit for prospective clients.
