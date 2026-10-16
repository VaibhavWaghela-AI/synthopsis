import asyncio
from typing import AsyncGenerator, Dict, Any, List
from groq import AsyncGroq
from google import genai
from config import GEMINI_API_KEY, GROQ_API_KEY, is_groq_configured, is_gemini_configured
from prompts import build_system_prompt

# Clients
_groq_client: AsyncGroq | None = None
_gemini_client: genai.Client | None = None

def get_groq_client() -> AsyncGroq | None:
    global _groq_client
    if not is_groq_configured():
        return None
    if _groq_client is None:
        _groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    return _groq_client

def get_gemini_client() -> genai.Client | None:
    global _gemini_client
    if not is_gemini_configured():
        return None
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    return _gemini_client

async def simulate_stream(last_message: str, channel: str, vertical: str) -> AsyncGenerator[str, None]:
    """Provides high-fidelity simulated response if keys are not set or quota reached."""
    query = last_message.lower()

    if vertical == "manufacturing":
        if channel == "whatsapp":
            text = (
                f"Namaste! 📦 *JM PlastoPack Operations Update*\n\n"
                f"Regarding your packaging inquiry:\n"
                f"• Standard MOQ: *5,000 units* (HDPE / Food-Grade PP)\n"
                f"• Production Lead Time: *7-10 working days*\n"
                f"• Dispatch Hub: *Ahmedabad GIDC*\n\n"
                f"Shall I generate your official quotation PDF now? ✅"
            )
        else:
            text = (
                f"Dear Valued Partner,\n\n"
                f"Thank you for contacting Synthopsis Packaging Automations (JM PlastoPack Division).\n\n"
                f"1. Specification Analysis: Verified for high-tensile injection molding.\n"
                f"2. Quantity MOQ: 5,000 to 50,000 units tier available with volume discount.\n"
                f"3. Production Lead Time: Dispatch scheduled within 8 working days from Ahmedabad plant.\n\n"
                f"Registered under Ticket #JMP-8841.\n\n"
                f"Best regards,\nAutomated Manufacturing Ops\nSynthopsis Autonomous Systems"
            )
    elif vertical == "logistics":
        if channel == "whatsapp":
            text = (
                f"Hello! 🚚 *Synthopsis Logistics Lead Reactivation*\n\n"
                f"We noticed you checked container freight rates from Jebel Ali to Mundra recently.\n\n"
                f"Great news: Spot ocean rates dropped *14% this week*! 📉\n"
                f"• 20ft Standard: Special rate locked for 48h\n"
                f"• Free Port Demurrage: Extended to *14 days*\n\n"
                f"Reply with *LOCK RATE* to secure your slot instantly! ⚓"
            )
        else:
            text = (
                f"Dear Shipper,\n\n"
                f"Following up on your cross-border cargo inquiry:\n\n"
                f"Our AI Freight Engine has calculated updated spot rates for your lane:\n"
                f"• Rate Status: 14% discount applied vs previous quote\n"
                f"• Customs Pre-clearance: Validated for Nhava Sheva / Mundra / Jebel Ali\n"
                f"• Tracking: Real-time WhatsApp tracking included\n\n"
                f"Please let us know your preferred Cargo Ready Date (CRD).\n\n"
                f"Best regards,\nFreight Optimization Division\nSynthopsis Autonomous Systems"
            )
    elif vertical == "real_estate":
        if any(k in query for k in ["office", "commercial", "sq.ft", "sqft", "team"]):
            text = (
                f"Namaste! 🏢 *AuraEstate Commercial & Luxury Realty*\n\n"
                f"We have verified commercial office inventory ready on *SG Highway, Ahmedabad*:\n"
                f"• *Space*: 4,500 sq.ft Grade-A floor plate (configured for 60-person software team)\n"
                f"• *Budget Tier*: ₹48.5 Lakhs turnkey commercial plate | 100% DG backup + 3 basement parking slots\n"
                f"• *Inventory & Floor Plan*: Attached in your official proposal document below ✅\n\n"
                f"Would you like an executive walkthrough *Tomorrow at 11:30 AM* or *Saturday at 4:00 PM*? 🚗"
            )
        else:
            text = (
                f"Namaste! 🏢 *AuraEstate Commercial & Luxury Realty*\n\n"
                f"Thank you for inquiring about our luxury developments in GIFT City / Ahmedabad!\n\n"
                f"• *3 & 4 BHK Sky Villas*: Starting at ₹1.85 Cr\n"
                f"• *Possession*: Q4 2026 | RERA Approved ✅\n\n"
                f"I have sent the digital brochure. Would you prefer a site visit *Tomorrow at 11:30 AM* or *Saturday at 4:00 PM*? 🚗"
            )
    elif vertical == "gaming_pc":
        text = (
            f"Hey gamer! ⚡ *ApexRig Custom PCs*\n\n"
            f"Regarding your gaming hardware inquiry:\n"
            f"• *Apex Beast Pro (₹2,15,000)*: Ryzen 7 7800X3D + RTX 4080 Super 16GB + 32GB DDR5 6000MHz\n"
            f"• *Apex Champion (₹1,35,000)*: Ryzen 5 7600X + RTX 4070 Super 12GB + 1TB Gen4 SSD\n"
            f"• *Warranty*: 3-Year Doorstep Pickup & Drop + 24h FurMark Stress Test Certificate ✅\n\n"
            f"What is your target budget and resolution (1080p, 1440p, or 4K)? 🎮"
        )
    else:
        text = (
            f"Hello! I am Synthopsis, your autonomous enterprise copilot.\n\n"
            f"I received your query: \"{last_message}\"\n\n"
            f"I can assist your business with:\n"
            f"1. Autonomous multi-channel support (WhatsApp, Web, Email)\n"
            f"2. ERP/CRM workflow automation\n"
            f"3. Proving case study ROI (68% faster response, 52% lead revival)\n\n"
            f"How can I assist you today?"
        )

    words = text.split(" ")
    for word in words:
        yield word + " "
        await asyncio.sleep(0.04)

async def stream_chat_response(
    messages: List[Dict[str, str]],
    channel: str = "web",
    model: str = "auto",
    vertical: str = "general",
    custom_instruction: str = "",
    temperature: float = 0.7
) -> AsyncGenerator[str, None]:
    """Orchestrates multi-model streaming between Groq, Gemini, and fallback simulation."""
    system_prompt = build_system_prompt(vertical, channel, custom_instruction)
    last_msg = messages[-1]["content"] if messages else "Hello"

    # Production RAG Grounding: Query indexed enterprise knowledge documents
    try:
        from rag_engine import get_rag_context_for_query
        rag_context = get_rag_context_for_query(last_msg, max_chunks=3)
        if rag_context:
            system_prompt += f"\n\n{rag_context}"
    except Exception as e:
        print(f"[RAG Engine] Retrieval skipped or error: {e}")

    # Selection
    provider = "groq"
    if model == "gemini":
        provider = "gemini"
    elif model == "groq":
        provider = "groq"
    else:
        provider = "gemini" if (channel == "email" or vertical == "pharma") else "groq"

    # Attempt 1: Groq High-Speed Inference
    if provider == "groq":
        groq_client = get_groq_client()
        if groq_client:
            formatted_msgs = [{"role": "system", "content": system_prompt}]
            for m in messages:
                formatted_msgs.append({
                    "role": "assistant" if m["role"] == "assistant" else "user",
                    "content": m["content"]
                })

            # Try available models in order of capability & availability on key
            candidate_models = [
                "openai/gpt-oss-120b",
                "qwen/qwen3.8-27b",
                "llama-3.3-70b-versatile",
                "llama3-70b-8192"
            ]

            for cand_model in candidate_models:
                try:
                    stream = await groq_client.chat.completions.create(
                        messages=formatted_msgs,
                        model=cand_model,
                        temperature=temperature,
                        stream=True
                    )
                    async for chunk in stream:
                        delta = chunk.choices[0].delta.content or ""
                        if delta:
                            yield delta
                    return
                except Exception as e:
                    print(f"[AI Router] Groq model '{cand_model}' failed: {e}. Trying next...")
                    continue

    # Attempt 2: Gemini 2.0 Flash
    gemini_client = get_gemini_client()
    if gemini_client:
        try:
            formatted_contents = []
            for m in messages:
                role = "model" if m["role"] == "assistant" else "user"
                formatted_contents.append({"role": role, "parts": [{"text": m["content"]}]})

            response = gemini_client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=formatted_contents,
                config={
                    "system_instruction": system_prompt,
                    "temperature": temperature
                }
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
            return
        except Exception as e:
            print(f"[AI Router] Gemini stream error: {e}. Falling back to simulation...")

    # Attempt 3: Simulation Fallback (Guarantees zero demo crashes)
    print("[AI Router] Running in Synthopsis Autonomous Simulation Mode.")
    async for chunk in simulate_stream(last_msg, channel, vertical):
        yield chunk
