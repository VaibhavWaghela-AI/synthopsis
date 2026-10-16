"""
Synthopsis - Interactive Terminal Chat Tester
Test all agents and streaming in your terminal directly!
Run: python cli_chat.py
"""

import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

import asyncio
from router import stream_chat_response
from workflow import execute_workflow_pipeline

async def interactive_cli():
    print("\n" + "="*55)
    print("🚀 SYNTHOPSIS - INTERACTIVE CLI TESTER")
    print("="*55)
    print("Select an Agent:")
    print("  1. 📦 JM PlastoPack (Manufacturing & Bilingual Gujarati/EN)")
    print("  2. 🚚 UAE Logistics (Cold Lead Reactivation)")
    print("  3. 🏢 AuraEstate (Real Estate Lead Qualification)")
    print("  4. 💊 PharmaDoc (Compliance & BMR Validator)")
    print("  5. ⚡ Run Multi-Agent Workflow Simulation")
    print("="*55)

    choice = input("Enter choice (1-5) [default 1]: ").strip() or "1"

    if choice == "5":
        print("\nExecuting 4-Step Multi-Agent Workflow Pipeline...")
        res = execute_workflow_pipeline(channel="whatsapp", sender="+91-98250-99120", message="25k units quote")
        print(f"Status: {res['status']} | Total Time: {res['total_duration_ms']} ms")
        for s in res['steps']:
            print(f"  [{s['step']}] {s['node_label']}: {s['log']} ({s['execution_ms']}ms)")
        print(f"\nFinal Result: {res['final_output']['action_taken']}\n")
        return

    mapping = {
        "1": ("manufacturing", "whatsapp", "JM PlastoPack Bot"),
        "2": ("logistics", "whatsapp", "UAE Logistics Reviver"),
        "3": ("real_estate", "web", "AuraEstate Copilot"),
        "4": ("pharma", "email", "PharmaDoc Validator")
    }

    vertical, channel, name = mapping.get(choice, mapping["1"])

    print(f"\nConnected to: {name} (Channel: {channel.upper()})")
    print("Type your message below (or type 'exit' to quit):\n")

    history = []

    while True:
        try:
            user_input = input("You > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("Goodbye!")
                break

            history.append({"role": "user", "content": user_input})
            print(f"\n{name} > ", end="", flush=True)

            ai_reply = ""
            async for chunk in stream_chat_response(
                messages=history,
                channel=channel,
                vertical=vertical,
                model="auto"
            ):
                print(chunk, end="", flush=True)
                ai_reply += chunk

            print("\n")
            history.append({"role": "assistant", "content": ai_reply})

        except (KeyboardInterrupt, EOFError):
            print("\nExiting...")
            break

if __name__ == "__main__":
    asyncio.run(interactive_cli())
