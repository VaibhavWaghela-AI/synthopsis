# -*- coding: utf-8 -*-
"""
Synthopsis Outbound AI Broadcast & Campaign Sequencer
=====================================================
Automated, hyper-personalized multi-channel outreach engine:
- Inbound Lead Synchronization & Auto-Capture
- AI Personalized Message Generation (Groq 70B / Gemini Flash)
- Omnichannel Dispatch (Live WhatsApp Web & Real Gmail/SMTP)
- Automated Brochure Delivery & Back-and-Forth Dialogue Loop
"""

import os
import json
import time
import httpx
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

import database
import rag_engine
from email_service import send_real_email
from router import get_gemini_client
from groq import Groq
from config import GROQ_API_KEY, is_groq_configured

WHATSAPP_SERVICE_URL = "http://localhost:3006"

_sync_groq: Groq | None = None

def get_sync_groq() -> Groq | None:
    global _sync_groq
    if not is_groq_configured():
        return None
    if _sync_groq is None:
        _sync_groq = Groq(api_key=GROQ_API_KEY)
    return _sync_groq

def get_brochure_context(brochure_filename: Optional[str], interest: str) -> str:
    """Retrieves relevant text snippets from uploaded catalogs or RAG documents."""
    if not brochure_filename:
        # Fallback to general RAG search on interest
        results = rag_engine.search_knowledge_base(query=interest, top_k=2)
        if results:
            return "\n".join([r.get("text", "") for r in results])
        return ""
    
    # Check if brochure exists in HACK root directory or backend
    root_path = Path(__file__).resolve().parent.parent / brochure_filename
    if root_path.exists():
        try:
            content = root_path.read_text(encoding="utf-8", errors="ignore")
            # Take first 1500 chars as relevant context
            return content[:1500]
        except Exception:
            pass
            
    # Search in indexed RAG chunks for this filename
    with database.get_connection() as conn:
        doc = conn.execute("SELECT id FROM rag_documents WHERE filename LIKE ?", (f"%{brochure_filename}%",)).fetchone()
        if doc:
            chunks = conn.execute("SELECT chunk_text FROM rag_chunks WHERE doc_id = ? LIMIT 3", (doc["id"],)).fetchall()
            return "\n".join([c["chunk_text"] for c in chunks])
            
    return ""

def generate_personalized_pitch(
    lead: Dict[str, Any],
    campaign: Dict[str, Any],
    agent: Optional[Dict[str, Any]] = None
) -> str:
    """
    Generates a 1-to-1 tailored outreach message using Groq Llama 3.3 70B or Gemini.
    Adapts formatting for WhatsApp (emojis, concise, friendly hook) vs Email (formal proposal).
    """
    channel = campaign.get("channel", "whatsapp")
    if channel == "both":
        channel = lead.get("channel", "whatsapp")
        
    brochure_context = get_brochure_context(campaign.get("brochure_filename"), lead.get("interest", ""))
    
    system_prompt = f"""You are an elite, highly professional B2B Outbound AI Sales Specialist representing Synthopsis.
Your mission is to initiate a warm, personalized 1-to-1 conversation with a high-value prospect.

PROSPECT DETAILS:
- Name: {lead.get('name')}
- Company: {lead.get('company')}
- Specific Interest: {lead.get('interest')}
- Channel: {channel.upper()}

CAMPAIGN OBJECTIVE:
{campaign.get('objective', 'Introduce our flagship solutions and offer a custom consultation.')}

BROCHURE / CATALOG KNOWLEDGE:
{brochure_context if brochure_context else 'Synthopsis Autonomous AI Agents and Enterprise Workstation Rigs.'}

GUIDELINES FOR {channel.upper()}:
"""
    if channel == "whatsapp":
        system_prompt += """
- Keep it under 80 words.
- Use natural, polite Indian business etiquette (e.g., 'Namaste [Name]ji', 'Hope you are doing well').
- Specifically mention their company and exact interest.
- Mention that we have the 2026 specifications / brochure ready for them.
- Use 2-3 clean emojis (e.g. 🚀, 📄, ✨).
- Close with a polite, low-pressure question: e.g., 'May I share the PDF catalog here with you?'
- Output ONLY the message text. No prefixes like 'Subject:' or explanations.
"""
    else:
        system_prompt += """
- Provide a clear, compelling SUBJECT LINE on the first line (e.g., 'Subject: Tailored B2B Proposal for [Company]').
- Followed by a formal, structured business email body.
- Address them respectfully by name.
- Highlight 2-3 key value propositions mapped to their interest.
- Offer an attached specification sheet and propose a 10-minute discovery call.
- Close with a professional sign-off from Synthopsis Enterprise Team.
- Output ONLY the email text.
"""

    # Try Groq Llama 3.3 70B for ultra-fast generation
    client = get_sync_groq()
    if client:
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Generate the personalized outreach message for {lead.get('name')} at {lead.get('company')}."}
                ],
                temperature=0.7,
                max_tokens=400
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[Campaign Engine] Groq generation failed: {e}, falling back to Gemini")

    # Fallback to Gemini
    gemini_client = get_gemini_client()
    if gemini_client:
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"{system_prompt}\n\nGenerate the personalized outreach message for {lead.get('name')} at {lead.get('company')}."
            )
            return response.text.strip()
        except Exception as e:
            print(f"[Campaign Engine] Gemini generation failed: {e}")

    # Offline / Template Fallback
    if channel == "whatsapp":
        return (
            f"Namaste {lead.get('name')}ji! 🙏 Reaching out from Synthopsis. "
            f"We noticed your team at {lead.get('company')} has been exploring {lead.get('interest')}. "
            f"We have compiled our 2026 technical specifications and custom volume pricing. "
            f"Would you like me to share the PDF brochure with you here?"
        )
    else:
        return (
            f"Subject: Technical Specifications & Partnership for {lead.get('company')}\n\n"
            f"Dear {lead.get('name')},\n\n"
            f"I hope this email finds you well at {lead.get('company')}.\n\n"
            f"We understand your ongoing requirements regarding {lead.get('interest')}. At Synthopsis, "
            f"we deliver enterprise-grade automation and hardware solutions with proven 99.8% operational uptime.\n\n"
            f"Attached is our comprehensive 2026 product guide. Would you have 10 minutes this Thursday for a brief walkthrough?\n\n"
            f"Best regards,\nSynthopsis Enterprise Team"
        )

def dispatch_lead_outreach(
    lead: Dict[str, Any],
    campaign: Dict[str, Any],
    message_text: str
) -> Dict[str, Any]:
    """
    Dispatches message to WhatsApp or Email, saves it to persistent conversations,
    and records campaign logs.
    """
    channel = campaign.get("channel", "whatsapp")
    if channel == "both":
        channel = lead.get("channel", "whatsapp")

    status = "delivered"
    error_msg = None
    conv_id = lead.get("conversation_id")
    
    # 1. Establish linked conversation in conversations table if not exists
    if not conv_id:
        conv_id = f"conv-{channel[:2]}-lead-{lead['id']}"
        with database.get_connection() as conn:
            sender_id = lead.get("phone") if channel == "whatsapp" else lead.get("email")
            sender_id = sender_id or lead["id"]
            title = f"{lead['name']} ({lead.get('company', 'Enterprise')})"
            subtitle = f"Campaign: {campaign.get('name', 'Outbound Outreach')}"
            
            conn.execute("""
            INSERT OR REPLACE INTO conversations (id, channel, sender, title, subtitle, unread_count, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
            """, (conv_id, channel, sender_id, title, subtitle))
            conn.commit()

    # 2. Record Outbound Message in persistent messages table
    database.add_message(
        conversation_id=conv_id,
        sender_role="agent",
        content=message_text,
        channel=channel,
        model_used="groq"
    )

    # 3. Channel Delivery Execution
    if channel == "whatsapp":
        # Check if live WhatsApp service is online
        phone_num = lead.get("phone")
        if phone_num:
            clean_phone = phone_num.replace("+", "").replace(" ", "").replace("-", "")
            try:
                resp = httpx.post(
                    f"{WHATSAPP_SERVICE_URL}/send",
                    json={"to": clean_phone, "message": message_text},
                    timeout=5.0
                )
                if resp.status_code == 200:
                    status = "sent_live_whatsapp"
                else:
                    status = "queued_offline_whatsapp"
            except Exception:
                status = "queued_offline_whatsapp"
        else:
            status = "simulated_whatsapp"

    elif channel == "email":
        lead_email = lead.get("email")
        if lead_email:
            lines = message_text.split("\n", 2)
            subject = f"Synthopsis Partnership Inquiry: {lead.get('interest', 'Enterprise Solutions')}"
            body = message_text
            if lines[0].lower().startswith("subject:"):
                subject = lines[0].replace("Subject:", "").strip()
                body = lines[1].strip() if len(lines) > 1 else message_text
                if len(lines) > 2:
                    body = lines[2].strip()

            email_res = send_real_email(to_email=lead_email, subject=subject, body=body)
            if email_res.get("success"):
                status = "sent_live_email"
            else:
                status = "email_failed"
                error_msg = email_res.get("message")
        else:
            status = "simulated_email"

    # 4. Update Lead Record
    database.update_lead(lead["id"], {
        "status": "contacted",
        "conversation_id": conv_id,
        "last_contacted_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })

    # 5. Record Campaign Delivery Log
    database.record_campaign_log({
        "campaign_id": campaign["id"],
        "lead_id": lead["id"],
        "channel": channel,
        "message_sent": message_text,
        "status": status
    })

    return {
        "lead_id": lead["id"],
        "lead_name": lead["name"],
        "channel": channel,
        "conversation_id": conv_id,
        "status": status,
        "message_preview": message_text[:120] + "...",
        "error": error_msg
    }

def execute_campaign(campaign_id: str, lead_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Executes a complete AI campaign: iterates through eligible leads, generates
    personalized pitches, and dispatches them across channels.
    """
    camp = database.get_campaign_by_id(campaign_id)
    if not camp:
        raise ValueError(f"Campaign '{campaign_id}' not found.")

    all_leads = database.get_all_leads()
    if lead_ids:
        targets = [l for l in all_leads if l["id"] in lead_ids]
    else:
        # Target new leads or leads matching campaign channel
        targets = [l for l in all_leads if l.get("status") in ("new", "draft", "contacted")]

    if not targets:
        # Default to first 5 leads if all are already contacted
        targets = all_leads[:5]

    database.update_campaign(campaign_id, {
        "status": "running",
        "total_leads": len(targets)
    })

    results = []
    sent_count = 0

    for lead in targets:
        pitch = generate_personalized_pitch(lead, camp)
        res = dispatch_lead_outreach(lead, camp, pitch)
        results.append(res)
        sent_count += 1
        time.sleep(0.4) # polite pacing

    database.update_campaign(campaign_id, {
        "status": "completed",
        "sent_count": sent_count
    })

    return {
        "campaign_id": campaign_id,
        "campaign_name": camp["name"],
        "total_processed": len(results),
        "results": results
    }

def simulate_lead_reply(lead_id: str, custom_reply_text: Optional[str] = None) -> Dict[str, Any]:
    """
    Simulates a prospect replying back to an outreach message on WhatsApp or Email.
    Triggers the AI agent to ground a response on the brochure/catalog and reply back,
    demonstrating the complete back-and-forth automated dialogue loop!
    """
    lead = database.get_lead_by_id(lead_id)
    if not lead:
        raise ValueError(f"Lead '{lead_id}' not found.")

    channel = lead.get("channel", "whatsapp")
    conv_id = lead.get("conversation_id")
    if not conv_id:
        conv_id = f"conv-{channel[:2]}-lead-{lead['id']}"

    # 1. Determine Realistic Inbound Reply from Lead
    reply_text = custom_reply_text
    if not reply_text:
        interest = lead.get("interest", "solutions")
        if "HDPE" in interest or "Drum" in interest:
            reply_text = "Namaste! Yes, please share the technical specification sheet for 50L drums. What is the delivery lead time to Dahej?"
        elif "ApexRig" in interest or "Gaming" in interest or "PC" in interest:
            reply_text = "Hello! Yes, interested in the Titanium Beast rig. Can you share the full specs and pricing with GST invoice?"
        elif "Pharma" in interest:
            reply_text = "Hello, thanks for reaching out. Does your compliance bot support FDA 21 CFR Part 11 audit trails?"
        else:
            reply_text = f"Hi! Thanks for reaching out. Yes, please send over the brochure and pricing details for {interest}."

    # 2. Record Customer Message in messages table
    inbound_msg = database.add_message(
        conversation_id=conv_id,
        sender_role="user",
        content=reply_text,
        channel=channel
    )

    # 3. Update Lead Status
    database.update_lead(lead_id, {
        "status": "replied",
        "last_contacted_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })

    # 4. Generate Dynamic PDF Proposal & AI Agent Reply Grounded in Knowledge Base
    generated_prop = None
    try:
        import proposal_generator
        generated_prop = proposal_generator.compile_proposal_pdf(lead)
    except Exception as e:
        print(f"[Campaign Engine] Proposal auto-gen error: {e}")

    # Search RAG knowledge base for answers to prospect's question
    rag_snippets = rag_engine.search_knowledge_base(query=reply_text, top_k=3)
    rag_context = "\n\n".join([r.get("text", "") for r in rag_snippets])
    
    agent_prompt = f"""You are the Synthopsis AI Sales & Solutions Engineer having a real-time conversation with {lead.get('name')} from {lead.get('company')}.
CHANNEL: {channel.upper()}
LEAD'S MESSAGE:
"{reply_text}"

GROUNDED KNOWLEDGE BASE / CATALOG DETAILS:
{rag_context if rag_context else 'All products come with ISO certification, official warranty, GST invoicing, and 5-7 business day delivery across Gujarat and India.'}

INSTRUCTIONS:
- Directly and enthusiastically answer their question using the catalog knowledge above.
- Confirm that their customized PDF technical proposal and commercial quotation has been generated and attached.
- Offer next concrete step (e.g. sharing proforma invoice, booking an engineer demo call).
- Keep formatting natural for {channel.upper()}.
"""

    agent_reply = ""
    client = get_sync_groq()
    if client:
        try:
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": agent_prompt},
                    {"role": "user", "content": reply_text}
                ],
                temperature=0.6,
                max_tokens=350
            )
            agent_reply = resp.choices[0].message.content.strip()
        except Exception:
            pass

    if not agent_reply:
        agent_reply = (
            f"Namaste {lead.get('name')}ji! Absolutely. I have compiled and attached your customized "
            f"technical proposal and commercial quote for {lead.get('interest')} directly to your file. "
            f"Standard dispatch takes 5-7 business days with full GST input credit. "
            f"Would you like our engineering team to schedule a 15-minute consultation call tomorrow?"
        )

    # Append direct link to generated PDF
    if generated_prop:
        pdf_link = f"http://localhost:3000{generated_prop['public_url']}"
        agent_reply += f"\n\n📄 *Official PDF Proposal & Quote:* {pdf_link}"

    # 5. Record AI Agent Outbound Reply
    agent_msg = database.add_message(
        conversation_id=conv_id,
        sender_role="agent",
        content=agent_reply,
        channel=channel,
        model_used="groq"
    )

    # 6. Update Lead to 'brochure_sent'
    database.update_lead(lead_id, {
        "status": "brochure_sent",
        "last_contacted_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    })

    # If linked to a campaign, increment replied count
    with database.get_connection() as conn:
        log = conn.execute("SELECT campaign_id FROM campaign_logs WHERE lead_id = ? ORDER BY sent_at DESC LIMIT 1", (lead_id,)).fetchone()
        if log:
            conn.execute("UPDATE campaigns SET replied_count = replied_count + 1 WHERE id = ?", (log["campaign_id"],))
            conn.commit()

    return {
        "success": True,
        "lead_id": lead_id,
        "lead_name": lead["name"],
        "conversation_id": conv_id,
        "channel": channel,
        "lead_reply": reply_text,
        "ai_response": agent_reply,
        "proposal": generated_prop,
        "new_status": "brochure_sent"
    }
