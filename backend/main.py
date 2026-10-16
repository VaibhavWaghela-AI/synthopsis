import time
import os
import re
from pathlib import Path
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import httpx
import uvicorn
import io
import pypdf

from config import PORT, HOST, is_groq_configured, is_gemini_configured
from models import (
    ChatRequest,
    AgentCreateRequest,
    WorkflowExecutionRequest,
    ROIRequest
)
from router import stream_chat_response
from agents import DEMO_SCENARIOS
from workflow import execute_workflow_pipeline
from analytics import SYNTHOPSIS_BENCHMARKS, calculate_roi
from email_service import send_real_email
import database
import rag_engine
import campaign_engine
import proposal_generator

app = FastAPI(
    title="Synthopsis - Autonomous Multi-Agent API",
    description="Enterprise Multi-Model AI Backend for Omnichannel Agents (WhatsApp, Email, Web).",
    version="1.0.0"
)

# CORS Configuration for Next.js and external frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (serves /static/widget.js for external websites)
static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Synthopsis Autonomous Multi-Agent Engine",
        "version": "1.0.0",
        "docs_url": "/docs",
        "live_channels": {
            "whatsapp_webhook": "/whatsapp-incoming",
            "email_dispatch": "/api/email/send",
            "web_widget": "/static/widget.js",
            "test_client_website": "/test-website"
        }
    }

@app.get("/test-website")
def serve_test_website():
    """Serves a real client website with the NexusAI chat widget embedded live."""
    html_path = Path(__file__).resolve().parent / "test_website.html"
    return FileResponse(str(html_path))

@app.get("/api/health")
def health_check():
    db_status = "healthy"
    counts = {}
    try:
        with database.get_connection() as conn:
            agents_count = conn.execute("SELECT COUNT(*) as c FROM agents").fetchone()["c"]
            convs_count = conn.execute("SELECT COUNT(*) as c FROM conversations").fetchone()["c"]
            docs_count = conn.execute("SELECT COUNT(*) as c FROM rag_documents").fetchone()["c"]
            runs_count = conn.execute("SELECT COUNT(*) as c FROM workflow_runs").fetchone()["c"]
            counts = {
                "agents": agents_count,
                "conversations": convs_count,
                "rag_documents": docs_count,
                "workflow_runs": runs_count
            }
    except Exception as e:
        db_status = f"unhealthy: {e}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": {
            "status": db_status,
            "metrics": counts
        },
        "providers": {
            "groq": {
                "configured": is_groq_configured(),
                "model": "llama-3.3-70b-versatile"
            },
            "gemini": {
                "configured": is_gemini_configured(),
                "model": "gemini-2.0-flash"
            },
            "simulation_fallback": {
                "configured": True,
                "role": "Guaranteed Zero-Downtime Presentation Mode"
            }
        }
    }

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Streaming AI chat endpoint with dynamic multi-model routing (Groq/Gemini).
    Yields plain text chunks in real-time.
    """
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    raw_msgs = [m.model_dump() for m in req.messages]

    resolved_provider = "groq" if req.model == "groq" or (req.model == "auto" and req.channel != "email") else "gemini"

    generator = stream_chat_response(
        messages=raw_msgs,
        channel=req.channel,
        model=req.model,
        vertical=req.vertical,
        custom_instruction=req.custom_instruction or "",
        temperature=req.temperature
    )

    headers = {
        "Content-Type": "text/plain; charset=utf-8",
        "X-AI-Provider": resolved_provider,
        "X-AI-Engine": "Synthopsis",
        "Cache-Control": "no-cache"
    }

    return StreamingResponse(generator, media_type="text/plain", headers=headers)

def is_business_inquiry(text: str) -> tuple[bool, str]:
    """
    Evaluates whether an incoming WhatsApp message is a commercial inquiry
    or a personal/social message.
    Protects the user's personal WhatsApp account from accidental bot replies.
    """
    clean = text.strip().lower()

    # 1. Explicit triggers always activate the AI agent
    triggers = [
        "#bot", "!bot", "#ai", "!ai", "#synthopsis", "quotation", "quote",
        "pricing", "catalogue", "catalog", "order", "moq", "sample",
        "proposal", "proposals", "brochure", "office", "real estate", "property"
    ]
    for t in triggers:
        if t in clean:
            return True, f"Trigger keyword matched: {t}"

    # 2. Check for personal casual phrases (Hindi/Hinglish/English)
    # Only flag as personal if it does NOT mention commercial intent
    personal_markers = [
        "kaha hai", "kaha ho", "kidhar hai", "ghar", "mummy",
        "papa", "didi", "call kar", "phone kar",
        "dinner", "lunch", "party", "bday", "birthday", "lol",
        "lmao", "kal mile", "reach", "pohcha", "good morning", "good night",
        "gym", "class", "college", "exam", "kya kar raha", "kya chal raha",
        "oyee", "sunn", "aaja", "chal", "haa", "nahi"
    ]
    is_personal = any(re.search(rf"\b{re.escape(p)}\b", clean) for p in personal_markers)

    # 3. Commercial markers (Manufacturing, Real Estate, Gaming PC Hardware & Services)
    business_markers = [
        "price", "rate", "bottle", "bottles", "plastic", "pack", "packaging",
        "order", "moq", "quotation", "quote", "delivery", "dispatch", "gst",
        "specs", "specification", "hdpe", "pet", "pp", "molding", "moulding",
        "factory", "supply", "supplier", "manufacturer", "cost", "buy",
        "purchase", "wholesale", "bulk", "discount", "lead time", "units",
        "caps", "jars", "container", "containers", "jm plastopack",
        # Real Estate & Commercial Space markers
        "office", "commercial", "space", "property", "sq.ft", "sqft", "real estate",
        "inventory", "floor plan", "floor plans", "proposal", "budget", "lakhs",
        "sg highway", "ahmedabad", "gandhinagar", "rent", "lease", "contract",
        # Gaming PC & Computer Hardware markers
        "pc", "gaming", "rig", "build", "gpu", "graphics card", "cpu", "processor",
        "rtx", "4090", "4080", "4070", "4060", "ryzen", "7800x3d", "7950x", "intel",
        "i9", "i7", "i5", "motherboard", "ram", "ddr5", "ssd", "nvme", "cooler",
        "aio", "cabinet", "fps", "apexrig", "hardware", "benchmark", "psu"
    ]
    is_business = any(re.search(rf"\b{re.escape(b)}\b", clean) for b in business_markers)

    if is_business:
        return True, "Commercial/business inquiry detected"

    if is_personal:
        return False, "Personal casual conversation detected"

    return False, "Non-commercial message (personal privacy protection)"

# ---------------------------------------------------------------------------
# REAL WHATSAPP INCOMING WEBHOOK
# ---------------------------------------------------------------------------
@app.post("/whatsapp-incoming")
async def handle_whatsapp_webhook(req: Request):
    """
    Webhook receiver for real WhatsApp messages.
    Bridges with whatsapp-service (whatsapp-web.js) on port 3006 or Meta Cloud API.
    Guarded with an intelligent Business vs Personal classifier to protect personal privacy.
    """
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    sender = data.get("from") or data.get("sender") or "+91-98250-XXXXX"
    body_text = data.get("body") or data.get("message") or ""
    chat_id = data.get("chatId") or sender

    if not body_text:
        return {"status": "ignored", "reason": "empty body"}

    # Guard 1: Filter out group chats & broadcast status updates
    if "@g.us" in str(sender) or "@g.us" in str(chat_id) or "broadcast" in str(sender):
        return {"status": "ignored", "reason": "group_or_broadcast_chat"}

    # Guard 2: Business vs Personal Classification
    is_biz, reason = is_business_inquiry(body_text)

    if not is_biz:
        print(f"[WhatsApp Guard] SUPPRESSED auto-reply for personal message from {sender}: \"{body_text[:40]}\" ({reason})")
        return {
            "status": "suppressed",
            "reason": "personal_message",
            "sender": sender,
            "detail": reason,
            "query": body_text
        }

    print(f"[WhatsApp Webhook] Business inquiry validated from {sender}: {body_text[:60]}")

    # Ensure conversation exists in persistent SQLite
    clean_sender = re.sub(r"[^a-zA-Z0-9]", "", str(sender))[-10:]
    conv_id = f"conv-wa-{clean_sender}"
    try:
        with database.get_connection() as conn:
            row = conn.execute("SELECT id FROM conversations WHERE sender = ? OR id = ?", (sender, conv_id)).fetchone()
            if not row:
                conn.execute("""
                INSERT INTO conversations (id, channel, sender, title, subtitle, unread_count)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (conv_id, "whatsapp", sender, f"{sender} (WhatsApp)", "WhatsApp Ingestion Lead", 0))
                conn.commit()
            else:
                conv_id = row["id"]

        # Store incoming user message
        database.add_message(
            conversation_id=conv_id,
            sender_role="user",
            content=body_text,
            channel="whatsapp"
        )
    except Exception as e:
        print(f"[WhatsApp Webhook] Database error recording user message: {e}")

    # ── Dynamic Company & Vertical Detection ─────────────────────────────────
    clean_body = body_text.lower()
    
    # 1. Real Estate & Commercial Property
    is_real_estate = any(k in clean_body for k in [
        "office", "commercial", "space", "property", "real estate", "sq.ft", "sqft",
        "square feet", "inventory", "floor plan", "floor plans", "bhk", "villa", "flat",
        "apartment", "plot", "sg highway", "gift city", "gandhinagar", "site visit",
        "lease", "rent", "rera", "infrastructure"
    ])
    
    # 2. Gaming PC & Hardware
    is_pc_query = any(k in clean_body for k in [
        "pc", "gaming", "rig", "build", "gpu", "graphics card", "cpu", "processor",
        "rtx", "4090", "4080", "4070", "4060", "ryzen", "7800x3d", "7950x", "intel",
        "i9", "i7", "i5", "motherboard", "ram", "ddr5", "ssd", "nvme", "cooler",
        "aio", "cabinet", "fps", "apexrig", "hardware", "computer"
    ])
    
    # 3. Logistics & Freight
    is_logistics = any(k in clean_body for k in [
        "freight", "container", "shipping", "cargo", "demurrage", "mundra",
        "jebel ali", "nhava sheva", "crd", "teu", "ocean freight", "air freight"
    ])
    
    # 4. Pharma & Regulatory
    is_pharma = any(k in clean_body for k in [
        "bmr", "coa", "pharma", "compliance", "fda", "gmp", "batch manufacturing",
        "api stability", "formulation"
    ])
    
    # 5. Manufacturing (JM PlastoPack)
    is_manufacturing = any(k in clean_body for k in [
        "mold", "mould", "injection", "packaging", "hdpe", "pp", "pet", "polymers",
        "plastic", "bottles", "gidc", "extrusion", "caps", "jars"
    ])

    if is_real_estate:
        vertical = "real_estate"
        company_name = "AuraEstate Commercial & Luxury Realty"
    elif is_pc_query:
        vertical = "gaming_pc"
        company_name = "ApexRig Gaming Technologies"
    elif is_logistics:
        vertical = "logistics"
        company_name = "Synthopsis Global Freight & Logistics"
    elif is_pharma:
        vertical = "pharma"
        company_name = "Synthopsis BioPharma Compliance"
    elif is_manufacturing:
        vertical = "manufacturing"
        company_name = "JM PlastoPack Manufacturing Pvt Ltd"
    else:
        vertical = "general"
        company_name = "Synthopsis Enterprise AI Systems"

    # ── Trigger Custom Enterprise DAG Workflow Pipeline ───────────────────────
    dag_run_id = None
    dag_summary = None
    try:
        dag_result = execute_workflow_pipeline(
            channel="whatsapp",
            sender=sender,
            message=body_text,
            customer_name=sender,
            company_name=company_name,
            skip_live_dispatch=True
        )
        scenario_meta = dag_result.get("scenario_used", {})
        dag_run_id = database.record_workflow_run({
            "scenario_id": "real_whatsapp_inbound",
            "channel": "whatsapp",
            "sender": sender,
            "customer_name": sender,
            "company_name": company_name,
            "deal_value": scenario_meta.get("deal_value_inr", 0.0),
            "is_vip": scenario_meta.get("is_vip", False),
            "status": dag_result.get("status", "completed"),
            "duration_ms": dag_result.get("total_duration_ms", 0),
            "logs": dag_result.get("steps", [])
        })
        dag_summary = {
            "run_id": dag_run_id,
            "company": company_name,
            "active_branch": dag_result.get("active_branch"),
            "deal_value_inr": scenario_meta.get("deal_value_inr", 0),
            "is_vip": scenario_meta.get("is_vip", False),
            "steps_count": len(dag_result.get("steps", []))
        }
        print(f"[WhatsApp Webhook] DAG Workflow executed: Run #{dag_run_id} | Company: {company_name} | Branch: {dag_summary['active_branch']} | Deal: ₹{dag_summary['deal_value_inr']:,}")
    except Exception as e:
        print(f"[WhatsApp Webhook] DAG Workflow execution error: {e}")

    # Generate AI response using grounded vertical persona
    chunks = []
    async for chunk in stream_chat_response(
        messages=[{"role": "user", "content": body_text}],
        channel="whatsapp",
        vertical=vertical,
        model="auto"
    ):
        chunks.append(chunk)

    reply_text = "".join(chunks).strip()

    # Auto-compile dynamic PDF proposal if user asked for proposal/quote/pricing/brochure
    prop_pdf_url = None
    if any(k in clean_body for k in [
        "proposal", "proposals", "quote", "quotation", "brochure", "pricing",
        "rate", "cost", "budget", "plan", "plans", "terms", "inventory"
    ]):
        try:
            lead_mock = {
                "id": f"lead-wa-{clean_sender}",
                "name": data.get("senderName") or "Valued Client",
                "company": company_name,
                "interest": body_text[:80],
                "channel": "whatsapp"
            }
            # Calculate realistic deal budget
            deal_val = 450000.0
            if "lakh" in clean_body or "lakhs" in clean_body:
                deal_val = 5000000.0
            elif is_real_estate:
                deal_val = 4800000.0
            elif is_pc_query:
                deal_val = 215000.0

            prop_res = proposal_generator.compile_proposal_pdf(lead_mock, deal_value=deal_val)
            prop_pdf_url = prop_res.get("public_url")
            if prop_pdf_url:
                reply_text += f"\n\n📄 *Official PDF Proposal & Commercial Quote:* http://localhost:3000{prop_pdf_url}"
        except Exception as e:
            print(f"[WhatsApp Webhook] Auto-proposal error: {e}")

    # Store agent reply in persistent database
    try:
        database.add_message(
            conversation_id=conv_id,
            sender_role="agent",
            content=reply_text,
            channel="whatsapp",
            model_used="groq"
        )
    except Exception as e:
        print(f"[WhatsApp Webhook] Database error recording agent reply: {e}")

    # Automatically dispatch reply back to the real WhatsApp client if running!
    wa_service_url = os.getenv("WHATSAPP_SERVICE_URL", "http://127.0.0.1:3006/send")
    dispatched_to_phone = False

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                wa_service_url,
                json={"chatId": chat_id, "message": reply_text, "pdfUrl": prop_pdf_url},
                timeout=15.0
            )
            if res.status_code == 200:
                dispatched_to_phone = True
                print(f"[WhatsApp Webhook] Successfully delivered reply + PDF to {chat_id}")
            else:
                print(f"[WhatsApp Webhook] WhatsApp bridge response: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"[WhatsApp Webhook] Local whatsapp-service not reachable on port 3006 ({e}). Returned text in HTTP response.")

    return {
        "status": "success",
        "sender": sender,
        "query": body_text,
        "reply": reply_text,
        "dispatched_to_phone": dispatched_to_phone,
        "conversation_id": conv_id,
        "workflow": dag_summary
    }

# ---------------------------------------------------------------------------
# REAL INBOUND EMAIL WEBHOOK & INGESTION PIPELINE
# ---------------------------------------------------------------------------
@app.post("/api/email/incoming")
@app.post("/email-incoming")
async def handle_email_incoming(req: Request):
    """
    Webhook receiver for incoming customer emails.
    Can be called by external email webhooks (Mailgun, SendGrid), IMAP listener, or UI simulation.
    Parses RFQ specifications, checks hardware bottlenecks, executes Enterprise DAG workflow,
    stores messages in SQLite, and dispatches the AI email quotation back to the sender.
    """
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    sender = data.get("from") or data.get("sender") or "vaibhavwaghelaa@gmail.com"
    subject = data.get("subject") or "Inquiry: Custom PC / Enterprise Quote"
    body_text = data.get("body") or data.get("message") or ""
    to_email = data.get("to") or os.getenv("COMPANY_EMAIL", "vaibhavwaghelaa@gmail.com")

    if not body_text:
        return {"status": "ignored", "reason": "empty body"}

    print(f"[Email Inbound Webhook] Received email from {sender} to {to_email}: \"{subject}\"")

    # Ensure conversation exists in persistent SQLite
    conv_id = "conv-em-1"
    try:
        with database.get_connection() as conn:
            row = conn.execute("SELECT id FROM conversations WHERE id = ?", (conv_id,)).fetchone()
            if not row:
                conn.execute("""
                INSERT INTO conversations (id, channel, sender, title, subtitle, unread_count)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (conv_id, "email", sender, f"{sender} (Email Inquiry)", subject, 0))
                conn.commit()

        # Store incoming user email
        database.add_message(
            conversation_id=conv_id,
            sender_role="user",
            content=f"Subject: {subject}\nFrom: {sender}\nTo: {to_email}\n\n{body_text}",
            channel="email"
        )
    except Exception as e:
        print(f"[Email Inbound] Database error recording user message: {e}")

    # Dynamic Vertical & Company Detection
    clean_body = (body_text + " " + subject).lower()
    is_pc_query = any(k in clean_body for k in [
        "pc", "gaming", "rig", "build", "gpu", "graphics card", "cpu", "processor",
        "rtx", "4090", "4080", "4070", "4060", "ryzen", "7800x3d", "7950x", "intel",
        "i9", "i7", "i3", "12000", "12100", "i5", "motherboard", "ram", "ddr5", "ssd", "nvme", "cooler",
        "aio", "cabinet", "fps", "apexrig", "hardware", "computer", "bottleneck"
    ])
    vertical = "gaming_pc" if is_pc_query else "manufacturing"
    company_name = "ApexRig Gaming Technologies" if is_pc_query else "JM PlastoPack"

    # Trigger Custom Enterprise DAG Workflow Pipeline
    dag_run_id = None
    dag_summary = None
    try:
        dag_result = execute_workflow_pipeline(
            channel="email",
            sender=sender,
            message=body_text,
            customer_name=sender.split("@")[0].capitalize(),
            company_name=company_name
        )
        scenario_meta = dag_result.get("scenario_used", {})
        dag_run_id = database.record_workflow_run({
            "scenario_id": "real_email_inbound",
            "channel": "email",
            "sender": sender,
            "customer_name": sender.split("@")[0].capitalize(),
            "company_name": company_name,
            "deal_value": scenario_meta.get("deal_value_inr", 215000.0 if is_pc_query else 850000.0),
            "is_vip": True,
            "status": dag_result.get("status", "completed"),
            "duration_ms": dag_result.get("total_duration_ms", 150),
            "logs": dag_result.get("steps", [])
        })
        dag_summary = {
            "run_id": dag_run_id,
            "company": company_name,
            "deal_value_inr": scenario_meta.get("deal_value_inr", 215000.0 if is_pc_query else 850000.0),
            "is_vip": True,
            "steps_count": len(dag_result.get("steps", []))
        }
        print(f"[Email Inbound] DAG Workflow executed: Run #{dag_run_id} | Company: {company_name}")
    except Exception as e:
        print(f"[Email Inbound] DAG Workflow execution error: {e}")

    # Generate Professional Email Response via Groq / Gemini
    chunks = []
    async for chunk in stream_chat_response(
        messages=[{"role": "user", "content": f"Subject: {subject}\n\n{body_text}"}],
        channel="email",
        vertical=vertical,
        model="auto"
    ):
        chunks.append(chunk)

    reply_text = "".join(chunks).strip()

    # Store agent reply in persistent database
    try:
        database.add_message(
            conversation_id=conv_id,
            sender_role="agent",
            content=reply_text,
            channel="email",
            model_used="groq"
        )
    except Exception as e:
        print(f"[Email Inbound] Database error recording agent reply: {e}")

    # Dispatch real email reply back to the sender
    dispatch_result = send_real_email(
        to_email=sender,
        subject=f"Re: {subject}",
        body_text=reply_text,
        from_email=to_email
    )

    return {
        "status": "success",
        "sender": sender,
        "subject": subject,
        "query": body_text,
        "reply": reply_text,
        "dispatch": dispatch_result,
        "conversation_id": conv_id,
        "workflow": dag_summary
    }

# ---------------------------------------------------------------------------
# REAL EMAIL DISPATCH ENDPOINT
# ---------------------------------------------------------------------------
@app.get("/api/email/status")
def get_email_status():
    user = os.getenv("SMTP_USER") or os.getenv("EMAIL_USER")
    has_token = (Path(__file__).resolve().parent / "token.json").exists()
    return {
        "status": "configured" if (user or has_token) else "unconfigured",
        "provider": "google_api" if has_token else ("smtp" if user else "preview_mode"),
        "active_account": user or ("Authenticated Google OAuth Account" if has_token else None)
    }

@app.post("/api/email/send")
async def handle_email_send(req: Request):
    """Dispatches a real email using SMTP or Google API, and records it in database."""
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    to_email = data.get("to") or data.get("recipient") or "client@example.com"
    subject = data.get("subject", "Quotation & Product Specification from Synthopsis")
    body_text = data.get("body") or data.get("message") or "Thank you for contacting Synthopsis. Here is your requested documentation."
    smtp_user = data.get("smtp_user")
    smtp_password = data.get("smtp_password")
    smtp_server = data.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(data.get("smtp_port", 587))

    result = send_real_email(
        to_email=to_email,
        subject=subject,
        body_text=body_text,
        smtp_user=smtp_user,
        smtp_password=smtp_password,
        smtp_server=smtp_server,
        smtp_port=smtp_port
    )

    # Persist sent email in conversation history
    try:
        database.add_message(
            conversation_id="conv-em-1",
            sender_role="agent",
            content=f"To: {to_email}\nSubject: {subject}\n\n{body_text}",
            channel="email",
            model_used="groq"
        )
    except Exception as e:
        print(f"[Email Persistence Error]: {e}")

    return result

# ---------------------------------------------------------------------------
# AGENTS PERSISTENCE API
# ---------------------------------------------------------------------------
@app.get("/api/agents")
def get_agents():
    agents = database.get_all_agents()
    return {
        "success": True,
        "total": len(agents),
        "data": agents
    }

@app.post("/api/agents")
def create_agent(req: AgentCreateRequest):
    new_agent = {
        "id": f"agent-{int(time.time())}",
        "name": req.name,
        "vertical": req.vertical,
        "channel": req.channel,
        "preferred_model": req.preferred_model,
        "description": req.description,
        "avatar": req.avatar,
        "status": "active",
        "conversations_handled": 0,
        "conversion_rate": 0.0,
        "avg_response_seconds": 1.0,
        "sample_prompts": []
    }
    database.insert_agent(new_agent)
    return {"success": True, "message": "Agent registered and saved", "data": new_agent}

@app.get("/api/scenarios")
def get_scenarios():
    return {
        "success": True,
        "total": len(DEMO_SCENARIOS),
        "data": DEMO_SCENARIOS
    }

# ---------------------------------------------------------------------------
# WORKFLOW EXECUTION & AUDIT API
# ---------------------------------------------------------------------------
@app.post("/api/workflow/execute")
def run_workflow(req: WorkflowExecutionRequest):
    result = execute_workflow_pipeline(
        channel=req.channel,
        sender=req.sender,
        message=req.message,
        customer_name=req.customer_name or "Ramesh Patel",
        company_name=req.company_name or "Sun Pharma Dahej",
        scenario_id=req.scenario_id
    )
    
    # Audit log to persistent database
    run_id = None
    try:
        scenario_meta = result.get("scenario_used", {})
        run_id = database.record_workflow_run({
            "scenario_id": req.scenario_id,
            "channel": req.channel,
            "sender": req.sender,
            "customer_name": req.customer_name or scenario_meta.get("customer_name", "Valued Client"),
            "company_name": req.company_name or scenario_meta.get("company_name", "Enterprise Client"),
            "deal_value": scenario_meta.get("deal_value_inr", 0.0),
            "is_vip": scenario_meta.get("is_vip", False),
            "status": result.get("status", "completed"),
            "duration_ms": result.get("total_duration_ms", 0),
            "logs": result.get("steps", [])
        })
    except Exception as e:
        print(f"[Workflow Audit Error]: {e}")
        
    return {"success": True, "data": result, "run_id": run_id}

@app.get("/api/workflow/history")
def get_workflow_history(limit: int = 20):
    runs = database.get_workflow_runs(limit=limit)
    return {
        "success": True,
        "total": len(runs),
        "data": runs
    }

# ---------------------------------------------------------------------------
# OMNICHANNEL INBOX & CONVERSATIONS API
# ---------------------------------------------------------------------------
@app.get("/api/inbox/conversations")
def get_inbox_conversations(channel: Optional[str] = None):
    convs = database.get_conversations(channel=channel)
    return {
        "success": True,
        "total": len(convs),
        "data": convs
    }

@app.get("/api/inbox/conversations/{conversation_id}/messages")
def get_inbox_messages(conversation_id: str):
    messages = database.get_conversation_messages(conversation_id)
    return {
        "success": True,
        "conversation_id": conversation_id,
        "total": len(messages),
        "data": messages
    }

@app.post("/api/inbox/conversations/{conversation_id}/messages")
async def add_inbox_message(conversation_id: str, req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    sender_role = data.get("sender_role", "user")
    content = data.get("content", "")
    channel = data.get("channel", "web")
    model_used = data.get("model_used")

    if not content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    new_msg = database.add_message(
        conversation_id=conversation_id,
        sender_role=sender_role,
        content=content,
        channel=channel,
        model_used=model_used
    )
    return {"success": True, "data": new_msg}

# ---------------------------------------------------------------------------
# ANALYTICS & ROI
# ---------------------------------------------------------------------------
@app.get("/api/analytics")
def get_analytics():
    return {
        "success": True,
        "data": SYNTHOPSIS_BENCHMARKS
    }

@app.post("/api/analytics/roi")
def calculate_custom_roi(req: ROIRequest):
    result = calculate_roi(req.monthly_inquiries, req.avg_human_cost_inr)
    return {"success": True, "data": result}

# ---------------------------------------------------------------------------
# RAG KNOWLEDGE BASE & DOCUMENT MANAGEMENT
# ---------------------------------------------------------------------------
@app.get("/api/documents")
def get_documents():
    docs = rag_engine.list_indexed_documents()
    return {
        "success": True,
        "total": len(docs),
        "data": docs
    }

@app.delete("/api/documents/{doc_id}")
def remove_document(doc_id: str):
    success = rag_engine.delete_document(doc_id)
    return {
        "success": success,
        "message": f"Document '{doc_id}' deleted from knowledge base."
    }

@app.post("/api/documents/search")
async def search_documents(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    query = data.get("query", "")
    top_k = int(data.get("top_k", 3))
    results = rag_engine.search_knowledge_base(query=query, top_k=top_k)
    return {
        "success": True,
        "query": query,
        "total": len(results),
        "data": results
    }

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    RAG ingestion endpoint: parses PDF, TXT, CSV, JSON, MD files into text.
    Extracts content, splits into overlapping chunks, and indexes in SQLite for grounding.
    """
    filename = file.filename or "document.txt"
    content_bytes = await file.read()
    extracted_text = ""
    num_pages = 1

    if filename.lower().endswith(".pdf"):
        try:
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            num_pages = len(reader.pages)
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_text.append(f"--- Page {i+1} ---\n{text.strip()}")
            extracted_text = "\n\n".join(pages_text)
        except Exception as e:
            extracted_text = f"[PDF Parse Error: {str(e)}]"
    else:
        try:
            extracted_text = content_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            extracted_text = f"[Text Decode Error: {str(e)}]"

    # Index into RAG engine & SQLite database
    indexed_info = rag_engine.index_document(filename, extracted_text, num_pages)

    return {
        "success": True,
        "filename": filename,
        "doc_id": indexed_info["doc_id"],
        "size_bytes": len(content_bytes),
        "num_pages": num_pages,
        "char_count": len(extracted_text),
        "chunks_indexed": indexed_info["chunks_indexed"],
        "preview": extracted_text[:250] + ("..." if len(extracted_text) > 250 else "")
    }

# ---------------------------------------------------------------------------
# LEADS & CRM MANAGEMENT
# ---------------------------------------------------------------------------
@app.get("/api/leads")
def get_leads(status: Optional[str] = None):
    leads = database.get_all_leads(status=status)
    return {
        "success": True,
        "total": len(leads),
        "data": leads
    }

@app.post("/api/leads")
async def create_lead(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    if not data.get("name"):
        raise HTTPException(status_code=400, detail="Lead name is required")
        
    created = database.insert_lead(data)
    return {
        "success": True,
        "message": "Lead created successfully",
        "data": created
    }

@app.put("/api/leads/{lead_id}")
async def update_lead_endpoint(lead_id: str, req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    success = database.update_lead(lead_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found or no valid fields to update")
    return {
        "success": True,
        "message": "Lead updated successfully"
    }

@app.delete("/api/leads/{lead_id}")
def delete_lead_endpoint(lead_id: str):
    success = database.delete_lead(lead_id)
    return {
        "success": success,
        "message": "Lead deleted"
    }

@app.post("/api/leads/sync-inbound")
def sync_inbound_leads():
    """Syncs contacts from incoming WhatsApp/Email conversations into Leads CRM."""
    count = database.sync_inbound_leads_from_conversations()
    return {
        "success": True,
        "synced_count": count,
        "message": f"Successfully synced {count} new inbound lead(s) from conversations."
    }

@app.post("/api/leads/upload-csv")
async def upload_leads_csv(file: UploadFile = File(...)):
    """Upload and parse a CSV file containing leads (Name, Phone, Email, Company, Interest)."""
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    lines = text.strip().split("\n")
    if not lines:
        raise HTTPException(status_code=400, detail="Empty CSV file")
        
    headers = [h.strip().lower() for h in lines[0].split(",")]
    # Map header indices
    name_idx = next((i for i, h in enumerate(headers) if "name" in h), 0)
    phone_idx = next((i for i, h in enumerate(headers) if "phone" in h or "mobile" in h or "contact" in h), -1)
    email_idx = next((i for i, h in enumerate(headers) if "email" in h or "mail" in h), -1)
    company_idx = next((i for i, h in enumerate(headers) if "company" in h or "org" in h), -1)
    interest_idx = next((i for i, h in enumerate(headers) if "interest" in h or "product" in h or "requirement" in h), -1)

    imported_leads = []
    for line in lines[1:]:
        if not line.strip():
            continue
        parts = [p.strip() for p in line.split(",")]
        name = parts[name_idx] if len(parts) > name_idx else "Prospect"
        phone = parts[phone_idx] if phone_idx != -1 and len(parts) > phone_idx else None
        email = parts[email_idx] if email_idx != -1 and len(parts) > email_idx else None
        company = parts[company_idx] if company_idx != -1 and len(parts) > company_idx else "Independent"
        interest = parts[interest_idx] if interest_idx != -1 and len(parts) > interest_idx else "General Solutions"

        lead_data = {
            "name": name,
            "phone": phone,
            "email": email,
            "company": company,
            "interest": interest,
            "status": "new",
            "channel": "whatsapp" if phone else "email",
            "notes": "Imported via CSV batch upload"
        }
        database.insert_lead(lead_data)
        imported_leads.append(lead_data)

    return {
        "success": True,
        "imported_count": len(imported_leads),
        "data": imported_leads
    }

# ---------------------------------------------------------------------------
# CAMPAIGN SEQUENCER & OUTBOUND BROADCAST
# ---------------------------------------------------------------------------
@app.get("/api/campaigns")
def list_campaigns():
    campaigns = database.get_all_campaigns()
    return {
        "success": True,
        "total": len(campaigns),
        "data": campaigns
    }

@app.post("/api/campaigns")
async def create_campaign_endpoint(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    camp = database.insert_campaign(data)
    return {
        "success": True,
        "message": "Campaign created",
        "data": camp
    }

@app.post("/api/campaigns/create-and-run")
async def create_and_run_campaign(req: Request):
    try:
        data = await req.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    camp = database.insert_campaign(data)
    lead_ids = data.get("lead_ids")
    execution_result = campaign_engine.execute_campaign(camp["id"], lead_ids=lead_ids)
    return {
        "success": True,
        "campaign": camp,
        "execution": execution_result
    }

@app.post("/api/campaigns/{campaign_id}/run")
async def run_existing_campaign(campaign_id: str, req: Request):
    data = {}
    try:
        data = await req.json()
    except Exception:
        pass
    lead_ids = data.get("lead_ids")
    execution_result = campaign_engine.execute_campaign(campaign_id, lead_ids=lead_ids)
    return {
        "success": True,
        "execution": execution_result
    }

@app.get("/api/campaigns/{campaign_id}/logs")
def get_campaign_delivery_logs(campaign_id: str):
    logs = database.get_campaign_logs(campaign_id)
    return {
        "success": True,
        "total": len(logs),
        "data": logs
    }

@app.post("/api/leads/{lead_id}/simulate-reply")
async def simulate_lead_reply_endpoint(lead_id: str, req: Request):
    """
    Simulates a lead answering our outreach on WhatsApp/Email.
    The AI Agent immediately reads the RAG brochure and replies back, demonstrating the back-and-forth dialogue!
    """
    custom_reply = None
    try:
        body = await req.json()
        custom_reply = body.get("reply_text")
    except Exception:
        pass
        
    result = campaign_engine.simulate_lead_reply(lead_id, custom_reply_text=custom_reply)
    return result

# ---------------------------------------------------------------------------
# DYNAMIC PDF PROPOSAL & BROCHURE ENGINE ENDPOINTS
# ---------------------------------------------------------------------------
@app.post("/api/leads/{lead_id}/generate-proposal")
async def generate_proposal_for_lead(lead_id: str, req: Request):
    """Generates an executive, branded PDF proposal for a specific lead."""
    lead = database.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    deal_value = None
    custom_title = None
    try:
        body = await req.json()
        deal_value = body.get("deal_value")
        custom_title = body.get("title")
    except Exception:
        pass

    result = proposal_generator.compile_proposal_pdf(
        lead=lead,
        deal_value=deal_value,
        custom_title=custom_title
    )
    return {
        "success": True,
        "message": f"Compiled executive proposal for {lead['name']}",
        "data": result
    }

@app.get("/api/leads/{lead_id}/proposals")
def get_lead_proposals(lead_id: str):
    """Fetches all generated proposals for a lead."""
    proposals = database.get_proposals_by_lead(lead_id)
    return {
        "success": True,
        "total": len(proposals),
        "data": proposals
    }

@app.get("/api/proposals")
def get_all_proposals_endpoint():
    """Lists all proposals generated across all leads."""
    proposals = database.get_all_proposals()
    return {
        "success": True,
        "total": len(proposals),
        "data": proposals
    }

@app.post("/api/proposals/{proposal_id}/dispatch-whatsapp")
async def dispatch_proposal_whatsapp(proposal_id: str):
    """Dispatches a generated proposal via WhatsApp to the lead's phone."""
    prop = database.get_proposal_by_id(proposal_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Proposal not found")
        
    lead = database.get_lead_by_id(prop["lead_id"])
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    phone = lead.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Lead does not have a valid WhatsApp phone number")

    pdf_link = f"http://localhost:3000{prop['public_url']}"
    msg_text = (
        f"Hello {lead.get('name')}! As requested, here is your official Synthopsis Enterprise Technical Proposal "
        f"and Commercial Quote: {pdf_link}\n\nTotal Contract Value: ₹{int(prop.get('pricing_total', 0)):,} (incl. 18% GST). "
        f"Our engineering team is standing by for deployment."
    )

    # Attempt to send via WhatsApp Web service
    dispatched = False
    try:
        clean_phone = "".join(filter(str.isdigit, phone))
        if len(clean_phone) == 10:
            clean_phone = "91" + clean_phone
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                "http://localhost:3006/api/send",
                json={"phone": clean_phone, "message": msg_text, "pdfUrl": prop["public_url"]}
            )
            dispatched = resp.status_code == 200
    except Exception:
        pass

    # Update status in db
    database.update_proposal_status(proposal_id, "sent_whatsapp")
    
    return {
        "success": True,
        "dispatched_live": dispatched,
        "message": f"Proposal dispatched to {phone}",
        "pdf_url": prop["public_url"]
    }

@app.get("/api/proposals/file/{filename}")
def serve_proposal_pdf(filename: str):
    """Directly serves the compiled proposal PDF binary."""
    file_path = proposal_generator.PUBLIC_PROPOSALS_DIR / filename
    if not file_path.exists():
        file_path = proposal_generator.BACKEND_PROPOSALS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")
    return FileResponse(path=str(file_path), media_type="application/pdf", filename=filename)

if __name__ == "__main__":
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)

