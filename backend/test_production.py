# -*- coding: utf-8 -*-
"""
Synthopsis Backend Production Integration Test Suite
====================================================
Tests all core production endpoints:
- System Health & Database connectivity
- Multi-Agent persistence CRUD
- Autonomous Workflow execution & Audit history
- Omnichannel Inbox (Conversations & Message sync)
- Grounded RAG Knowledge Base (Upload, Indexing, Search, Context retrieval, Deletion)
- Real WhatsApp Webhook processing & auto-conversation linking
- ROI & Benchmark Analytics
"""

import sys
import io
from fastapi.testclient import TestClient
from main import app
import database
import rag_engine

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("SYNTHOPSIS PRODUCTION API TEST SUITE")
    print("==================================================")

    # 1. Health & Database Check
    print("\n[Test 1] Health & System Status...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    health_data = res.json()
    print(f"  Status: {health_data['status']}")
    print(f"  Database Status: {health_data['database']['status']}")
    print(f"  Metrics: {health_data['database']['metrics']}")
    assert health_data["database"]["status"] == "healthy"
    assert health_data["database"]["metrics"]["agents"] > 0
    print("  --> PASS: Health & DB operational")

    # 2. Agent Persistence
    print("\n[Test 2] Agents Persistence CRUD...")
    res = client.get("/api/agents")
    assert res.status_code == 200
    agents = res.json()["data"]
    print(f"  Initial agents count: {len(agents)}")
    assert len(agents) >= 3

    # Create new agent
    new_agent_payload = {
        "name": "Dahej Chemical Safety Copilot",
        "vertical": "manufacturing",
        "channel": "whatsapp",
        "preferred_model": "llama-3.3-70b-versatile",
        "description": "Monitors MSDS compliance and tank pressure thresholds.",
        "avatar": "⚗️"
    }
    create_res = client.post("/api/agents", json=new_agent_payload)
    assert create_res.status_code == 200
    created_agent = create_res.json()["data"]
    print(f"  Created agent ID: {created_agent['id']}")

    # Verify persistence
    res_after = client.get("/api/agents")
    agents_after = res_after.json()["data"]
    assert len(agents_after) == len(agents) + 1
    assert any(a["id"] == created_agent["id"] for a in agents_after)
    print("  --> PASS: Agent persisted to SQLite")

    # 3. Omnichannel Inbox & Messages
    print("\n[Test 3] Omnichannel Inbox Conversations & Messages...")
    convs_res = client.get("/api/inbox/conversations")
    assert convs_res.status_code == 200
    convs = convs_res.json()["data"]
    print(f"  Conversations found: {len(convs)}")
    assert len(convs) > 0

    first_conv_id = convs[0]["id"]
    msgs_res = client.get(f"/api/inbox/conversations/{first_conv_id}/messages")
    assert msgs_res.status_code == 200
    msgs = msgs_res.json()["data"]
    print(f"  Messages in {first_conv_id}: {len(msgs)}")

    # Add a message to this conversation
    add_msg_res = client.post(
        f"/api/inbox/conversations/{first_conv_id}/messages",
        json={"sender_role": "user", "content": "Can you expedite delivery by 3 days?", "channel": "whatsapp"}
    )
    assert add_msg_res.status_code == 200
    print("  Added message successfully")

    # Verify message count increased
    msgs_res2 = client.get(f"/api/inbox/conversations/{first_conv_id}/messages")
    assert len(msgs_res2.json()["data"]) == len(msgs) + 1
    print("  --> PASS: Persistent conversation & messages validated")

    # 4. Autonomous Workflow Pipeline & Audit Log
    print("\n[Test 4] Autonomous Workflow Pipeline & Audit Trail...")
    wf_payload = {
        "channel": "whatsapp",
        "sender": "+91 98254 11029",
        "message": "Urgent: Need 50,000 units of 1L HDPE chemical drums with UN certification. Deliver to Dahej SEZ within 10 days.",
        "customer_name": "Ramesh Patel",
        "company_name": "Sun Pharma Chemicals Dahej",
        "scenario_id": "vip_chemical_rfq"
    }
    wf_res = client.post("/api/workflow/execute", json=wf_payload)
    assert wf_res.status_code == 200
    wf_data = wf_res.json()
    run_id = wf_data.get("run_id")
    print(f"  Workflow executed successfully. Run ID: {run_id}")
    print(f"  Duration: {wf_data['data']['total_duration_ms']}ms, Active branch: {wf_data['data']['active_branch']}")
    assert run_id is not None

    # Check workflow history
    hist_res = client.get("/api/workflow/history")
    assert hist_res.status_code == 200
    history = hist_res.json()["data"]
    print(f"  Workflow audit records in DB: {len(history)}")
    assert any(h["id"] == run_id for h in history)
    print("  --> PASS: Workflow executed and audited in persistent DB")

    # 5. Grounded RAG Knowledge Base Ingestion & Search
    print("\n[Test 5] Grounded RAG Ingestion, Chunking & Semantic Search...")
    sample_doc_content = (
        "JM PlastoPack Specifications & Terms 2026\n"
        "--- Page 1 ---\n"
        "High-density polyethylene (HDPE) containers are manufactured with virgin polymer resin. "
        "All 1L and 5L drums feature UN 1H1/Y1.8/200 certification for hazardous chemical transport. "
        "Standard wall thickness is 1.8mm with burst pressure rating exceeding 250 kPa.\n"
        "--- Page 2 ---\n"
        "Pricing and Minimum Order Quantities (MOQ):\n"
        "Tier 1 (5,000 to 25,000 units): Rs 28.50 per unit.\n"
        "Tier 2 (25,001 to 100,000 units): Rs 26.50 per unit with free induction sealing wads.\n"
        "Payment Terms: 30-day net credit available upon GSTIN verification and bank guarantee.\n"
    )

    upload_file = io.BytesIO(sample_doc_content.encode("utf-8"))
    upload_res = client.post(
        "/api/documents/upload",
        files={"file": ("jm_plastopack_spec.txt", upload_file, "text/plain")}
    )
    assert upload_res.status_code == 200
    doc_info = upload_res.json()
    doc_id = doc_info["doc_id"]
    print(f"  Uploaded document ID: {doc_id}")
    print(f"  Chunks indexed: {doc_info['chunks_indexed']}")
    assert doc_info["chunks_indexed"] > 0

    # Search knowledge base
    search_res = client.post(
        "/api/documents/search",
        json={"query": "UN certification HDPE burst pressure", "top_k": 2}
    )
    assert search_res.status_code == 200
    search_results = search_res.json()["data"]
    print(f"  Search matches: {len(search_results)}")
    assert len(search_results) > 0
    top_score = search_results[0]["score"]
    print(f"  Top Match Score: {top_score}")
    print(f"  Snippet: {search_results[0]['chunk_text'][:80]}...")
    assert "UN" in search_results[0]["chunk_text"] or "HDPE" in search_results[0]["chunk_text"]

    # Verify RAG context string injection
    rag_context = rag_engine.get_rag_context_for_query("HDPE chemical drums tier 2 pricing")
    assert "VERIFIED ENTERPRISE KNOWLEDGE BASE" in rag_context
    assert "26.50" in rag_context
    print("  RAG context prompt injection successfully verified!")

    # Verify document listing
    docs_res = client.get("/api/documents")
    assert docs_res.status_code == 200
    all_docs = docs_res.json()["data"]
    print(f"  Total knowledge documents indexed: {len(all_docs)}")

    # Clean up test document
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 200
    print("  Cleaned up test document from RAG index")
    print("  --> PASS: RAG Ingestion & Hybrid Search verified")

    # 6. WhatsApp Webhook & Auto-conversation linking
    print("\n[Test 6] WhatsApp Inbound Webhook...")
    wa_payload = {
        "from": "+919825999999",
        "sender": "+91 98259 99999",
        "body": "Hi, what is the rate for 10,000 units of HDPE containers?",
        "chatId": "+919825999999"
    }
    wa_res = client.post("/whatsapp-incoming", json=wa_payload)
    assert wa_res.status_code == 200
    wa_data = wa_res.json()
    print(f"  WhatsApp reply status: {wa_data['status']}")
    print(f"  Generated reply length: {len(wa_data['reply'])} chars")
    assert len(wa_data["reply"]) > 0
    assert wa_data["conversation_id"] is not None
    print("  --> PASS: WhatsApp webhook processed and persisted")

    # 7. Analytics & ROI Calculation
    print("\n[Test 7] Analytics & ROI Engine...")
    roi_res = client.post("/api/analytics/roi", json={"monthly_inquiries": 12000, "avg_human_cost_inr": 28000})
    assert roi_res.status_code == 200
    roi_data = roi_res.json()["data"]
    print(f"  Monthly Savings: Rs {roi_data['projected_savings_inr']:,.2f}")
    print(f"  ROI Multiple: {roi_data['roi_multiplier']}x")
    print("  --> PASS: Analytics & ROI verified")

    print("\n==================================================")
    print("ALL 7 PRODUCTION SUITE TESTS PASSED PERFECTLY! [OK]")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
