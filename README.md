# 🌌 Upteky NexusAI (Synthopsis) — Master Project Hub
**Enterprise Multi-Model Autonomous AI Agent Orchestration Platform**  
*Hackathon Task 05 — Upteky Solution Pvt. Ltd.*

---

## 🏆 Project Overview & Hackathon Deliverables

Upteky NexusAI productizes the bespoke conversational AI services of Upteky Solution Pvt. Ltd. (Ahmedabad, Gujarat) into a high-margin, self-serve B2B SaaS platform. It combines sub-200ms Groq LPU inference, native omnichannel ingestion (WhatsApp, Email, Web), visual Unreal Blueprint-style workflow orchestration, and verified enterprise case studies.

All 4 required hackathon deliverables are complete, verified, and accessible below:

| # | Hackathon Deliverable | Status | Document / Access Link |
|:---:|:---|:---:|:---|
| **1** | **Live Working Prototype** | ✅ **100% Operational** | **Frontend**: [http://localhost:3000](http://localhost:3000)<br/>**Backend**: [http://127.0.0.1:8000](http://127.0.0.1:8000) |
| **2** | **Production Persistence & RAG** | ✅ **Operational** | SQLite (`synthopsis.db`) + Hybrid BM25 Knowledge Retrieval |
| **3** | **Production Docker Setup** | ✅ **Complete** | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` |
| **4** | **Technical Development Documentation** | ✅ **Complete** | [DEVELOPMENT_DOCUMENTATION.md](./DEVELOPMENT_DOCUMENTATION.md) |
| **5** | **Sales Pitch Deck Content & Master Script** | ✅ **Complete** | [SALES_PITCH_DECK.md](./SALES_PITCH_DECK.md) |
| **6** | **Creative Marketing Strategy & 60s Video Script**| ✅ **Complete** | [MARKETING_STRATEGY.md](./MARKETING_STRATEGY.md) |

---

## ⚡ Live Prototype Quick Navigation

Both servers are pre-configured and running locally:

| Dashboard View | URL | What to Test / Key Features |
|:---|:---|:---|
| **Omnichannel Inbox** | [http://localhost:3000/dashboard/inbox](http://localhost:3000/dashboard/inbox) | **Live Streaming AI Chat**: Test real-time Groq inference. Switch channels between WhatsApp, Email, and Web Chat. Toggle Human Takeover mode. |
| **Blueprint Workflow Builder** | [http://localhost:3000/dashboard/workflow](http://localhost:3000/dashboard/workflow) | **Visual Automation Graph**: Click **"Test Workflow"** to trigger a 4-step live pipeline (Ingest $\rightarrow$ Intent Analysis $\rightarrow$ ERP Invoice $\rightarrow$ Outbound Dispatch). |
| **Agent Fleet Studio** | [http://localhost:3000/dashboard/agents](http://localhost:3000/dashboard/agents) | **Industry Agents**: Deploy pre-built personas for Manufacturing (JM PlastoPack), Cross-Border Logistics, and Luxury Real Estate. |
| **Overview HUD** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | **Mission Control**: Live active agent metrics, SLA indicators, and event activity feed. |
| **ROI & Financial Analytics** | [http://localhost:3000/dashboard/analytics](http://localhost:3000/dashboard/analytics) | **Dynamic 26x ROI Engine**: Adjust lead volume and deal size to calculate payroll savings and recovered revenue. |
| **Live Client Manufacturing Site**| [http://127.0.0.1:8000/test-website](http://127.0.0.1:8000/test-website) | **Real External Embed**: Test the standalone 4KB `widget.js` floating chat widget on a live client packaging company site. |
| **FastAPI Interactive Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | **Swagger API Explorer**: Test all backend endpoints with interactive schemas. |

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│              Next.js 16 Cybercore HUD Frontend              │
│                (React 19 + Tailwind v4 + Zustand)           │
│                   http://localhost:3000                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Real-time Stream & Proxies
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Python FastAPI Orchestration Core             │
│                   http://127.0.0.1:8000                     │
│  - /api/chat               (Multi-Model Streaming Stream)   │
│  - /whatsapp-incoming      (Real WhatsApp Webhook Bridge)   │
│  - /api/email/send         (RFC-822 Email Dispatcher)       │
│  - /static/widget.js       (4KB Zero-Dependency Embed)      │
│  - /api/workflow/execute   (4-Stage Graph Execution)        │
│  - /api/analytics/roi      (Dynamic Upteky Benchmark Model) │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   Groq LPU Hardware Engine   │ │    Google Gemini 2.0 Flash │
│  - Sub-200ms Latency         │ │  - Deep Reasoning Context  │
│  - 540 tokens/second         │ │  - Complex Contract Parser │
└──────────────────────────────┘ └────────────────────────────┘
```
 
---

## 🐳 Production Docker Deployment

Run both the Next.js frontend and Python FastAPI backend with persistent SQLite storage:

```bash
# 1. Build and run in background
docker-compose up --build -d

# 2. Check running services
docker-compose ps
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Core & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Database Persistence**: Saved across restarts to `./backend/synthopsis.db`

---

## 🧪 Verification & Production Test Suite

Run the production integration test suite covering database persistence, RAG semantic search, workflow auditing, and omnichannel webhook handling:

```powershell
cd backend
python test_production.py
```
*Expected Result: `ALL 7 PRODUCTION SUITE TESTS PASSED PERFECTLY! [OK]`.*

To verify the live Groq streaming output from the command line:
```powershell
python -c "import requests; r = requests.post('http://localhost:3000/api/chat', json={'messages': [{'role': 'user', 'content': 'What is Upteky?'}], 'channel': 'web', 'model': 'groq'}); print('Status:', r.status_code); print('Response:', r.text)"
```
