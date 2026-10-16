# -*- coding: utf-8 -*-
"""
Synthopsis Production Persistence Engine
========================================
SQLite-backed persistent data layer for:
- Conversations & Message History (WhatsApp, Email, Web)
- Registered Custom Agents
- Workflow Execution Runs & Audit Logs
- Grounded RAG Knowledge Base Documents & Chunks
"""

import sqlite3
import os
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_PATH = Path(__file__).resolve().parent / "synthopsis.db"

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds default data if not present."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # 1. Conversations Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            channel TEXT NOT NULL,
            sender TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT NOT NULL,
            unread_count INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 2. Messages Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            conversation_id TEXT NOT NULL,
            sender_role TEXT NOT NULL, -- 'user', 'agent', 'system'
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            channel TEXT NOT NULL,
            model_used TEXT,
            status TEXT DEFAULT 'delivered',
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )
        """)
        
        # 3. Agents Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            vertical TEXT NOT NULL,
            channel TEXT NOT NULL,
            preferred_model TEXT NOT NULL,
            description TEXT NOT NULL,
            avatar TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            conversations_handled INTEGER DEFAULT 0,
            conversion_rate REAL DEFAULT 0.0,
            avg_response_seconds REAL DEFAULT 1.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 4. Workflow Runs Audit Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS workflow_runs (
            id TEXT PRIMARY KEY,
            scenario_id TEXT,
            channel TEXT NOT NULL,
            sender TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            company_name TEXT NOT NULL,
            deal_value REAL DEFAULT 0.0,
            is_vip BOOLEAN DEFAULT 0,
            status TEXT NOT NULL,
            duration_ms INTEGER DEFAULT 0,
            logs_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 5. RAG Documents Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS rag_documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            char_count INTEGER NOT NULL,
            num_pages INTEGER DEFAULT 1,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # 6. RAG Document Chunks Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS rag_chunks (
            id TEXT PRIMARY KEY,
            doc_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            chunk_text TEXT NOT NULL,
            page_number INTEGER DEFAULT 1,
            FOREIGN KEY (doc_id) REFERENCES rag_documents(id) ON DELETE CASCADE
        )
        """)

        # 7. Leads Table (Outbound & Inbound CRM)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            company TEXT,
            interest TEXT,
            status TEXT DEFAULT 'new', -- 'new', 'contacted', 'replied', 'brochure_sent', 'qualified', 'converted'
            channel TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'email', 'both'
            notes TEXT,
            conversation_id TEXT,
            last_contacted_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 8. Outbound Campaigns Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            channel TEXT NOT NULL, -- 'whatsapp', 'email', 'both'
            agent_id TEXT NOT NULL,
            objective TEXT NOT NULL,
            brochure_filename TEXT,
            status TEXT DEFAULT 'draft', -- 'draft', 'running', 'completed', 'paused'
            total_leads INTEGER DEFAULT 0,
            sent_count INTEGER DEFAULT 0,
            replied_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # 9. Campaign Delivery Logs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaign_logs (
            id TEXT PRIMARY KEY,
            campaign_id TEXT NOT NULL,
            lead_id TEXT NOT NULL,
            channel TEXT NOT NULL,
            message_sent TEXT NOT NULL,
            status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'replied'
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
        )
        """)

        # 10. Proposals Table (Dynamic PDF Proposal & Brochure Generator)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS proposals (
            id TEXT PRIMARY KEY,
            lead_id TEXT NOT NULL,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            public_url TEXT NOT NULL,
            pricing_total REAL DEFAULT 0,
            roi_metric TEXT,
            status TEXT DEFAULT 'generated', -- 'generated', 'sent_whatsapp', 'sent_email', 'viewed'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
        )
        """)

        # Indexes for fast lookup
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_chunks_doc ON rag_chunks(doc_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_campaign_logs_camp ON campaign_logs(campaign_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_proposals_lead ON proposals(lead_id)")
        
        conn.commit()

    seed_default_data()

def seed_default_data():
    """Seeds initial production data if empty."""
    from agents import INITIAL_AGENTS
    
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Seed Agents if empty
        cursor.execute("SELECT COUNT(*) as count FROM agents")
        if cursor.fetchone()["count"] == 0:
            for ag in INITIAL_AGENTS:
                ch = ag.get("channel", "web")
                channel_str = json.dumps(ch) if isinstance(ch, (list, dict)) else str(ch)
                cursor.execute("""
                INSERT OR IGNORE INTO agents 
                (id, name, vertical, channel, preferred_model, description, avatar, status, conversations_handled, conversion_rate, avg_response_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    ag["id"], ag["name"], ag["vertical"], channel_str,
                    ag["preferred_model"], ag["description"], ag["avatar"],
                    ag.get("status", "active"), ag.get("conversations_handled", 0),
                    ag.get("conversion_rate", 0.0), ag.get("avg_response_seconds", 1.0)
                ))
            conn.commit()
            
        # Seed Conversations if empty
        cursor.execute("SELECT COUNT(*) as count FROM conversations")
        if cursor.fetchone()["count"] == 0:
            default_convs = [
                ("conv-wa-1", "whatsapp", "+91 98254 11029", "+91 98254 11029 (Ramesh Patel)", "Lead Qualification Agent (Active)", 2),
                ("conv-em-1", "email", "s.nambiar@apexhealth.in", "Suresh Nambiar (CTO - Apex Health)", "Enterprise RFQ Assistant", 1),
                ("conv-wb-1", "web", "Visitor #8421", "Live Web Visitor (Ahmedabad, IN)", "Web Ingestion Copilot", 0)
            ]
            for c_id, ch, snd, tit, sub, unread in default_convs:
                cursor.execute("""
                INSERT OR IGNORE INTO conversations (id, channel, sender, title, subtitle, unread_count)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (c_id, ch, snd, tit, sub, unread))
            
            # Seed sample message
            cursor.execute("""
            INSERT OR IGNORE INTO messages (id, conversation_id, sender_role, content, timestamp, channel, model_used)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "msg-init-1",
                "conv-wa-1",
                "user",
                "Urgent: Need 50,000 units of 1L HDPE chemical drums with UN certification. Deliver to Dahej SEZ within 10 days.",
                datetime.utcnow().strftime("%I:%M %p"),
                "whatsapp",
                "groq"
            ))
            cursor.execute("""
            INSERT OR IGNORE INTO messages (id, conversation_id, sender_role, content, timestamp, channel, model_used)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "msg-init-2",
                "conv-wa-1",
                "agent",
                "Namaste Rameshji! We can supply 50,000 units of UN-certified 1L HDPE drums with tamper-proof induction seals. Standard delivery to Dahej SEZ takes 7-8 business days. Proforma quotation has been generated under Ticket #JMP-8841.",
                datetime.utcnow().strftime("%I:%M %p"),
                "whatsapp",
                "groq"
            ))

        # Seed Leads if empty
        cursor.execute("SELECT COUNT(*) as count FROM leads")
        if cursor.fetchone()["count"] == 0:
            sample_leads = [
                ("lead-1", "Ramesh Patel", "+91 98254 11029", "ramesh@patelchem.com", "Patel Chemicals & Solvents", "UN Certified HDPE 50L Chemical Drums", "contacted", "whatsapp", "Active buyer from Dahej SEZ. Wants proforma invoice.", "conv-wa-1"),
                ("lead-2", "Suresh Nambiar", "+91 98980 44210", "s.nambiar@apexhealth.in", "Apex Health Laboratories", "Pharma AI Regulatory Compliance Bot", "replied", "email", "Received RFQ, asked for FDA 21 CFR Part 11 validation proof.", "conv-em-1"),
                ("lead-3", "Vikram Sharma", "+91 98791 55321", "vikram@sharmatech.in", "Sharma Tech & Gaming Lounge", "ApexRig 4K RTX 4090 Workstation Rig", "new", "whatsapp", "Interested in 5 units for esport studio in Ahmedabad.", None),
                ("lead-4", "Ananya Desai", "+91 98240 66789", "ananya@desaiagro.com", "Desai Agro Commodities", "Bulk Food-Grade Drum Packaging", "new", "email", "Found our brochure via B2B trade portal.", None),
                ("lead-5", "Rahul Mehta", "+971 50 123 4567", "r.mehta@mehtarealty.ae", "Mehta Realty UAE", "WhatsApp Real Estate Lead Reviver Bot", "brochure_sent", "whatsapp", "Sent Dubai luxury villa automation catalog.", None)
            ]
            for l_id, nm, ph, em, co, intr, st, ch, nts, cid in sample_leads:
                cursor.execute("""
                INSERT OR IGNORE INTO leads (id, name, phone, email, company, interest, status, channel, notes, conversation_id, last_contacted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (l_id, nm, ph, em, co, intr, st, ch, nts, cid))

        # Seed Campaigns if empty
        cursor.execute("SELECT COUNT(*) as count FROM campaigns")
        if cursor.fetchone()["count"] == 0:
            cursor.execute("""
            INSERT OR IGNORE INTO campaigns (id, name, channel, agent_id, objective, brochure_filename, status, total_leads, sent_count, replied_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "camp-apexrig-1",
                "ApexRig 2026 Gaming & AI Workstations Outreach",
                "whatsapp",
                "agent-1",
                "Introduce 2026 flagship gaming rigs, share catalog specifications, and book demo consultation",
                "ApexRig_Gaming_PC_Catalog_2026.txt",
                "completed",
                3,
                3,
                2
            ))
            
            cursor.execute("""
            INSERT OR IGNORE INTO campaign_logs (id, campaign_id, lead_id, channel, message_sent, status)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                "log-init-1",
                "camp-apexrig-1",
                "lead-3",
                "whatsapp",
                "Namaste Vikramji! This is Aryan from ApexRig. We noticed your interest in high-performance workstations for Sharma Tech. We have attached our 2026 Flagship Catalog featuring the Titanium Beast (Dual RTX 4090). Would you like a live demo in Ahmedabad?",
                "delivered"
            ))

        conn.commit()

# --- Public Database Operations ---

def get_all_agents() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM agents ORDER BY created_at ASC").fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get("channel"), str) and d["channel"].startswith("["):
                try:
                    d["channel"] = json.loads(d["channel"])
                except Exception:
                    pass
            result.append(d)
        return result

def insert_agent(agent_data: Dict[str, Any]) -> Dict[str, Any]:
    ch = agent_data.get("channel", "web")
    channel_str = json.dumps(ch) if isinstance(ch, (list, dict)) else str(ch)
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO agents 
        (id, name, vertical, channel, preferred_model, description, avatar, status, conversations_handled, conversion_rate, avg_response_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            agent_data["id"], agent_data["name"], agent_data["vertical"], channel_str,
            agent_data["preferred_model"], agent_data["description"], agent_data["avatar"],
            agent_data.get("status", "active"), 0, 0.0, 1.0
        ))
        conn.commit()
    return agent_data

def get_conversations(channel: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        if channel and channel != "all":
            rows = conn.execute("SELECT * FROM conversations WHERE channel = ? ORDER BY updated_at DESC", (channel,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM conversations ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]

def get_conversation_messages(conversation_id: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC", (conversation_id,)).fetchall()
        return [dict(r) for r in rows]

def add_message(
    conversation_id: str,
    sender_role: str,
    content: str,
    channel: str,
    model_used: Optional[str] = None
) -> Dict[str, Any]:
    msg_id = f"msg-{int(time.time() * 1000)}"
    timestamp_str = datetime.utcnow().strftime("%I:%M %p")
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO messages (id, conversation_id, sender_role, content, timestamp, channel, model_used)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (msg_id, conversation_id, sender_role, content, timestamp_str, channel, model_used))
        
        conn.execute("""
        UPDATE conversations 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
        """, (conversation_id,))
        conn.commit()
        
    return {
        "id": msg_id,
        "conversation_id": conversation_id,
        "sender_role": sender_role,
        "content": content,
        "timestamp": timestamp_str,
        "channel": channel,
        "model_used": model_used
    }

def record_workflow_run(run_data: Dict[str, Any]) -> str:
    run_id = f"wf-{int(time.time() * 1000)}"
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO workflow_runs 
        (id, scenario_id, channel, sender, customer_name, company_name, deal_value, is_vip, status, duration_ms, logs_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            run_id,
            run_data.get("scenario_id"),
            run_data.get("channel", "web"),
            run_data.get("sender", "unknown"),
            run_data.get("customer_name", "Valued Client"),
            run_data.get("company_name", "Enterprise Client"),
            run_data.get("deal_value", 0.0),
            run_data.get("is_vip", False),
            run_data.get("status", "completed"),
            run_data.get("duration_ms", 0),
            json.dumps(run_data.get("logs", []))
        ))
        conn.commit()
    return run_id

def get_workflow_runs(limit: int = 20) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM workflow_runs ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
        result = []
        for r in rows:
            d = dict(r)
            try:
                d["logs"] = json.loads(d["logs_json"])
            except Exception:
                d["logs"] = []
            result.append(d)
        return result

# --- Leads & Outbound CRM Operations ---

def get_all_leads(status: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        if status and status != "all":
            rows = conn.execute("SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC", (status,)).fetchall()
        else:
            rows = conn.execute("SELECT * FROM leads ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

def get_lead_by_id(lead_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM leads WHERE id = ?", (lead_id,)).fetchone()
        return dict(row) if row else None

def insert_lead(lead_data: Dict[str, Any]) -> Dict[str, Any]:
    lead_id = lead_data.get("id") or f"lead-{int(time.time() * 1000)}"
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO leads 
        (id, name, phone, email, company, interest, status, channel, notes, conversation_id, last_contacted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            lead_id,
            lead_data.get("name", "New Lead"),
            lead_data.get("phone"),
            lead_data.get("email"),
            lead_data.get("company", "Independent"),
            lead_data.get("interest", "General Inquiry"),
            lead_data.get("status", "new"),
            lead_data.get("channel", "whatsapp"),
            lead_data.get("notes", ""),
            lead_data.get("conversation_id"),
            lead_data.get("last_contacted_at")
        ))
        conn.commit()
    lead_data["id"] = lead_id
    return lead_data

def update_lead(lead_id: str, updates: Dict[str, Any]) -> bool:
    allowed = ["name", "phone", "email", "company", "interest", "status", "channel", "notes", "conversation_id", "last_contacted_at"]
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        return False
    
    set_clause = ", ".join([f"{k} = ?" for k in filtered.keys()])
    values = list(filtered.values()) + [lead_id]
    
    with get_connection() as conn:
        conn.execute(f"UPDATE leads SET {set_clause} WHERE id = ?", values)
        conn.commit()
    return True

def delete_lead(lead_id: str) -> bool:
    with get_connection() as conn:
        conn.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
        conn.commit()
    return True

def sync_inbound_leads_from_conversations() -> int:
    """
    Scans all existing conversations (WhatsApp, Email, Web) and automatically
    populates the leads database with inbound inquiries if not already present.
    """
    synced_count = 0
    with get_connection() as conn:
        conv_rows = conn.execute("SELECT * FROM conversations").fetchall()
        for conv in conv_rows:
            sender = conv["sender"]
            channel = conv["channel"]
            title = conv["title"] or sender
            conv_id = conv["id"]
            
            # Check if this sender already exists as a lead by phone, email, or conversation_id
            existing = conn.execute("""
            SELECT id FROM leads 
            WHERE phone = ? OR email = ? OR conversation_id = ?
            """, (sender, sender, conv_id)).fetchone()
            
            if not existing:
                # Parse Name & Company from Title (e.g., '+91 98254 11029 (Ramesh Patel)' or 'Suresh Nambiar (CTO - Apex Health)')
                name = title
                company = "Enterprise Client"
                if "(" in title and ")" in title:
                    parts = title.split("(")
                    if channel == "whatsapp":
                        name = parts[1].replace(")", "").strip()
                    else:
                        name = parts[0].strip()
                        company = parts[1].replace(")", "").strip()

                phone = sender if channel == "whatsapp" or "+" in sender else None
                email = sender if channel == "email" or "@" in sender else None
                
                lead_id = f"lead-inbound-{int(time.time() * 1000)}-{synced_count}"
                conn.execute("""
                INSERT INTO leads 
                (id, name, phone, email, company, interest, status, channel, notes, conversation_id, last_contacted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (
                    lead_id,
                    name,
                    phone,
                    email,
                    company,
                    "Inbound Inquiry via " + channel.capitalize(),
                    "replied",
                    channel,
                    f"Auto-captured from inbound {channel} interaction.",
                    conv_id
                ))
                synced_count += 1
        conn.commit()
    return synced_count

# --- Campaigns Operations ---

def get_all_campaigns() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM campaigns ORDER BY created_at DESC").fetchall()
        return [dict(r) for r in rows]

def get_campaign_by_id(campaign_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,)).fetchone()
        return dict(row) if row else None

def insert_campaign(camp_data: Dict[str, Any]) -> Dict[str, Any]:
    camp_id = camp_data.get("id") or f"camp-{int(time.time() * 1000)}"
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO campaigns 
        (id, name, channel, agent_id, objective, brochure_filename, status, total_leads, sent_count, replied_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            camp_id,
            camp_data.get("name", "Untitled Campaign"),
            camp_data.get("channel", "whatsapp"),
            camp_data.get("agent_id", "agent-1"),
            camp_data.get("objective", "Outbound AI outreach"),
            camp_data.get("brochure_filename"),
            camp_data.get("status", "draft"),
            camp_data.get("total_leads", 0),
            camp_data.get("sent_count", 0),
            camp_data.get("replied_count", 0)
        ))
        conn.commit()
    camp_data["id"] = camp_id
    return camp_data

def update_campaign(campaign_id: str, updates: Dict[str, Any]) -> bool:
    allowed = ["name", "channel", "agent_id", "objective", "brochure_filename", "status", "total_leads", "sent_count", "replied_count"]
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        return False
    
    set_clause = ", ".join([f"{k} = ?" for k in filtered.keys()])
    values = list(filtered.values()) + [campaign_id]
    
    with get_connection() as conn:
        conn.execute(f"UPDATE campaigns SET {set_clause} WHERE id = ?", values)
        conn.commit()
    return True

def record_campaign_log(log_data: Dict[str, Any]) -> str:
    log_id = f"log-{int(time.time() * 1000)}"
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO campaign_logs 
        (id, campaign_id, lead_id, channel, message_sent, status)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (
            log_id,
            log_data["campaign_id"],
            log_data["lead_id"],
            log_data.get("channel", "whatsapp"),
            log_data.get("message_sent", ""),
            log_data.get("status", "delivered")
        ))
        conn.commit()
    return log_id

def get_campaign_logs(campaign_id: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("""
        SELECT cl.*, l.name as lead_name, l.company as lead_company, l.phone as lead_phone, l.email as lead_email
        FROM campaign_logs cl
        WHERE cl.campaign_id = ?
        ORDER BY cl.sent_at DESC
        """, (campaign_id,)).fetchall()
        return [dict(r) for r in rows]

# --- Proposals Operations ---

def create_proposal_record(proposal_data: Dict[str, Any]) -> Dict[str, Any]:
    prop_id = proposal_data.get("id") or f"prop-{int(time.time() * 1000)}"
    with get_connection() as conn:
        conn.execute("""
        INSERT INTO proposals 
        (id, lead_id, title, filename, file_path, public_url, pricing_total, roi_metric, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            prop_id,
            proposal_data["lead_id"],
            proposal_data.get("title", "Executive AI Solution Proposal"),
            proposal_data["filename"],
            proposal_data["file_path"],
            proposal_data["public_url"],
            proposal_data.get("pricing_total", 0.0),
            proposal_data.get("roi_metric", "+35% Efficiency"),
            proposal_data.get("status", "generated")
        ))
        conn.commit()
    proposal_data["id"] = prop_id
    return proposal_data

def get_proposals_by_lead(lead_id: str) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM proposals WHERE lead_id = ? ORDER BY created_at DESC", (lead_id,)).fetchall()
        return [dict(r) for r in rows]

def get_all_proposals() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute("""
        SELECT p.*, l.name as lead_name, l.company as lead_company, l.phone as lead_phone, l.email as lead_email
        FROM proposals p
        LEFT JOIN leads l ON p.lead_id = l.id
        ORDER BY p.created_at DESC
        """).fetchall()
        return [dict(r) for r in rows]

def get_proposal_by_id(proposal_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM proposals WHERE id = ?", (proposal_id,)).fetchone()
        return dict(row) if row else None

def update_proposal_status(proposal_id: str, status: str) -> bool:
    with get_connection() as conn:
        conn.execute("UPDATE proposals SET status = ? WHERE id = ?", (status, proposal_id))
        conn.commit()
    return True

# Initialize on module import
init_db()
