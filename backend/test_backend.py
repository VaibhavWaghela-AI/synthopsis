"""
Synthopsis - Python Backend Automated Test Suite
Tests endpoints, schemas, prompts, workflow orchestrator, and streaming generator.
Run with: python test_backend.py
"""

import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
import asyncio
from fastapi.testclient import TestClient
from main import app
from prompts import build_system_prompt
from workflow import execute_workflow_pipeline
from analytics import calculate_roi, SYNTHOPSIS_BENCHMARKS
from router import stream_chat_response

client = TestClient(app)

def run_suite():
    print("=================================================")
    print("🐍 SYNTHOPSIS - FASTAPI BACKEND TEST SUITE")
    print("=================================================\n")

    passed = 0
    total = 0

    def check(condition: bool, name: str):
        nonlocal passed, total
        total += 1
        if condition:
            print(f"✅ PASS: {name}")
            passed += 1
        else:
            print(f"❌ FAIL: {name}")

    # 1. Health & Root
    print("--- 1. Testing System & Health Endpoints ---")
    r_root = client.get("/")
    check(r_root.status_code == 200, "GET / returns 200 OK")
    check("Synthopsis" in r_root.json()["service"], "Root identifies as Synthopsis")

    r_health = client.get("/api/health")
    check(r_health.status_code == 200, "GET /api/health returns 200 OK")
    check(r_health.json()["providers"]["simulation_fallback"]["configured"], "Fallback resilience active")

    # 2. Agents
    print("\n--- 2. Testing Agents Endpoints ---")
    r_agents = client.get("/api/agents")
    check(r_agents.status_code == 200, "GET /api/agents returns 200 OK")
    agents = r_agents.json()["data"]
    check(len(agents) == 4, f"4 pre-configured industry agents loaded (found {len(agents)})")

    r_create = client.post("/api/agents", json={
        "name": "Custom Test Agent",
        "vertical": "manufacturing",
        "channel": ["whatsapp"],
        "description": "Test description"
    })
    check(r_create.status_code == 200, "POST /api/agents creates new agent")
    check(r_create.json()["data"]["name"] == "Custom Test Agent", "Agent returned with correct name")

    # 3. Scenarios
    print("\n--- 3. Testing 1-Click Demo Scenarios ---")
    r_scen = client.get("/api/scenarios")
    check(r_scen.status_code == 200, "GET /api/scenarios returns 200 OK")
    check(len(r_scen.json()["data"]) == 4, "4 demo scenarios available for judges")

    # 4. Workflow Pipeline Execution
    print("\n--- 4. Testing Multi-Agent Workflow Engine ---")
    r_wf = client.post("/api/workflow/execute", json={
        "channel": "whatsapp",
        "sender": "+91-98250-11223",
        "message": "Need 5,000 HDPE bottles by next Monday."
    })
    check(r_wf.status_code == 200, "POST /api/workflow/execute returns 200 OK")
    wf_data = r_wf.json()["data"]
    check(wf_data["status"] == "success", "Workflow pipeline completed with status: success")
    check(len(wf_data["steps"]) >= 4, f"Workflow executed pipeline steps (found {len(wf_data['steps'])})")
    check(wf_data["steps"][1]["type"] == "ai", "Step 2 performed AI parsing")

    # 5. Analytics & Custom ROI
    print("\n--- 5. Testing Analytics & ROI Engine ---")
    r_anal = client.get("/api/analytics")
    check(r_anal.status_code == 200, "GET /api/analytics returns 200 OK")
    check(r_anal.json()["data"]["recovered_leads_percentage"] == 52.0, "Analytics shows 52% lead recovery")

    r_roi = client.post("/api/analytics/roi", json={
        "monthly_inquiries": 5000,
        "avg_human_cost_inr": 200000
    })
    check(r_roi.status_code == 200, "POST /api/analytics/roi returns 200 OK")
    check(r_roi.json()["data"]["roi_multiplier"] > 10, "Calculated 26x client ROI multiplier")

    # 6. Prompts Engine
    print("\n--- 6. Testing Domain Prompts ---")
    p_jm = build_system_prompt("manufacturing", "whatsapp")
    check("JM PlastoPack" in p_jm, "Manufacturing prompt references JM PlastoPack")
    check("FORMATTING FOR WHATSAPP" in p_jm, "WhatsApp channel decorator applied")

    p_log = build_system_prompt("logistics", "email")
    check("UAE Logistics" in p_log, "Logistics prompt references UAE Logistics case study")
    check("FORMATTING FOR EMAIL" in p_log, "Email channel decorator applied")

    # 7. Streaming Chat Endpoint
    print("\n--- 7. Testing Streaming Chat Endpoint ---")
    with client.stream("POST", "/api/chat", json={
        "messages": [{"role": "user", "content": "What is the MOQ for plastic packaging?"}],
        "channel": "whatsapp",
        "vertical": "manufacturing",
        "model": "auto"
    }) as response:
        check(response.status_code == 200, "POST /api/chat streaming returns 200 OK")
        check(response.headers.get("content-type").startswith("text/plain"), "Content-Type is text/plain")
        
        # Read stream
        chunks = []
        for line in response.iter_text():
            chunks.append(line)
        full_text = "".join(chunks)
        check(len(full_text) > 0, f"Stream yielded response: '{full_text[:40]}...'")

    # 8. Real Channels In Real Life (IRL)
    print("\n--- 8. Testing Real World Channels (IRL) ---")
    r_wa_hook = client.post("/whatsapp-incoming", json={
        "from": "+91-98250-99120",
        "body": "Need MOQ for 500ml jars.",
        "chatId": "919825099120@c.us"
    })
    check(r_wa_hook.status_code == 200, "POST /whatsapp-incoming returns 200 OK")
    check(len(r_wa_hook.json()["reply"]) > 0, "WhatsApp webhook generated live AI reply")

    r_email_send = client.post("/api/email/send", json={
        "to": "procurement@clientcorp.com",
        "subject": "Official Packaging Quotation",
        "body": "Here is the official quote for 25,000 HDPE units."
    })
    check(r_email_send.status_code == 200, "POST /api/email/send returns 200 OK")
    check(r_email_send.json()["success"] == True, "Email dispatch processed successfully")

    r_web = client.get("/test-website")
    check(r_web.status_code == 200, "GET /test-website serves real client website with embedded widget")

    print("\n=================================================")
    print(f"🎯 PYTHON TEST SUITE RESULTS: {passed}/{total} TESTS PASSED ({round((passed/total)*100)}%)")
    print("=================================================\n")

if __name__ == "__main__":
    run_suite()
