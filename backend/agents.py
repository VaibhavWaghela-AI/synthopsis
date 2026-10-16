"""
Synthopsis - Industry Agent Presets & Demo Scenarios
"""

INITIAL_AGENTS = [
    {
        "id": "agent-realestate-01",
        "name": "AuraEstate Sales Copilot",
        "vertical": "real_estate",
        "channel": ["whatsapp", "web"],
        "preferred_model": "groq",
        "description": "High-intent property lead qualification. Dispatches floorplans, calculates EMI estimates, and reserves site-visit slots.",
        "avatar": "🏢",
        "status": "active",
        "conversations_handled": 3410,
        "conversion_rate": 38.4,
        "avg_response_seconds": 1.2,
        "case_study_ref": "Synthopsis Real Estate Automation Insights 2026",
        "sample_prompts": [
            "What are the 3 BHK options available in GIFT City under ₹1.5 Cr?",
            "Can you send the brochure and floorplan on my WhatsApp?",
            "I want to book an on-site property viewing this Sunday afternoon."
        ]
    },
    {
        "id": "agent-plastopack-02",
        "name": "JM PlastoPack Manufacturing Bot",
        "vertical": "manufacturing",
        "channel": ["whatsapp", "web", "email"],
        "preferred_model": "groq",
        "description": "B2B injection molding and custom packaging specialist with Gujarati & English bilingual support and ERP order synchronization.",
        "avatar": "📦",
        "status": "active",
        "conversations_handled": 5120,
        "conversion_rate": 42.1,
        "avg_response_seconds": 0.8,
        "case_study_ref": "JM PlastoPack Case Study (68% faster response rate)",
        "sample_prompts": [
            "What is the MOQ and rate per kg for 500ml HDPE bottles?",
            "મારી ઓર્ડર સ્થિતિ શું છે? ઓર્ડર નંબર JMP-4402 છે.",
            "Track shipment status for order JMP-8912 dispatched from Ahmedabad."
        ]
    },
    {
        "id": "agent-logistics-03",
        "name": "UAE Logistics Lead Reviver",
        "vertical": "logistics",
        "channel": ["whatsapp", "email"],
        "preferred_model": "gemini",
        "description": "Autonomous cold lead reactivation engine. Re-engages dormant shipping accounts with dynamic spot rate discounts.",
        "avatar": "🚚",
        "status": "active",
        "conversations_handled": 2890,
        "conversion_rate": 52.0,
        "avg_response_seconds": 2.1,
        "case_study_ref": "UAE Logistics Firm Case Study (52% lead reactivation rate)",
        "sample_prompts": [
            "I received your WhatsApp note about discounted 40ft container rates to Mundra.",
            "Can you quote ocean freight for 2x20ft GP containers from Jebel Ali to Nhava Sheva?",
            "We paused shipping last month due to high demurrage. What are current terms?"
        ]
    },
    {
        "id": "agent-pharma-04",
        "name": "PharmaDoc Compliance Validator",
        "vertical": "pharma",
        "channel": ["web", "email"],
        "preferred_model": "gemini",
        "description": "Regulatory inspection copilot for Batch Manufacturing Records (BMR), Certificate of Analysis (CoA), and WHO-GMP compliance.",
        "avatar": "💊",
        "status": "active",
        "conversations_handled": 1427,
        "conversion_rate": 29.5,
        "avg_response_seconds": 3.4,
        "case_study_ref": "Game of Pharma & Vtalix Case Studies (70% document error reduction)",
        "sample_prompts": [
            "Check this CoA summary for Paracetamol IP 500mg against dissolution tolerances.",
            "Draft a deviation explanation letter for temperature excursion during transport (2-8°C).",
            "Verify if this BMR documentation meets WHO-GMP record retention guidelines."
        ]
    }
]

DEMO_SCENARIOS = [
    {
        "id": "scenario-plastopack-order",
        "title": "JM PlastoPack: Order Status & Custom Packaging MOQ",
        "description": "Demonstrates rapid B2B quotation, multilingual comprehension, and ERP order tracking.",
        "channel": "whatsapp",
        "industry": "manufacturing",
        "suggested_model": "groq",
        "agent_id": "agent-plastopack-02",
        "initial_message": "Hello! We urgently need 25,000 HDPE tamper-evident bottles for our agrochemical plant in Sanand. What is your best MOQ price and lead time? Also check status of order JMP-7721.",
        "expected_outcome": "Agent quotes MOQ tiered pricing, confirms 10-day lead time, and pulls ERP status for JMP-7721 with zero lag."
    },
    {
        "id": "scenario-logistics-reactivation",
        "title": "UAE Logistics: Dormant Lead Re-engagement",
        "description": "Demonstrates autonomous cold lead revival with dynamic spot rate incentive.",
        "channel": "whatsapp",
        "industry": "logistics",
        "suggested_model": "groq",
        "agent_id": "agent-logistics-03",
        "initial_message": "Hi, I saw your WhatsApp message about lower freight rates. We haven't shipped through you since November because prices spiked. Do you really have 20ft slots from Dubai to Mundra under $650?",
        "expected_outcome": "Agent acknowledges previous shipment history, locks in the spot rate, and offers 14-day free demurrage."
    },
    {
        "id": "scenario-realestate-luxury",
        "title": "Real Estate: High-Net-Worth Lead Qualification",
        "description": "Demonstrates 24/7 lead filtering, instant brochure dispatch, and site inspection booking.",
        "channel": "web",
        "industry": "real_estate",
        "suggested_model": "groq",
        "agent_id": "agent-realestate-01",
        "initial_message": "Looking for an ultra-luxury 4 BHK duplex or penthouse in Ahmedabad with golf-course or riverfront view. Budget around ₹3.5 Cr. Can you share floor plans?",
        "expected_outcome": "Agent qualifies budget, confirms brochure dispatched to WhatsApp, and offers two specific viewing times."
    },
    {
        "id": "scenario-pharma-compliance",
        "title": "Pharma: BMR Regulatory Compliance Flagging",
        "description": "Demonstrates deep reasoning, regulatory accuracy, and formal email report drafting.",
        "channel": "email",
        "industry": "pharma",
        "suggested_model": "gemini",
        "agent_id": "agent-pharma-04",
        "initial_message": "Subject: Urgent review required for Export Batch Paracetamol 500mg (Batch #PC-902). During granulation, humidity reached 68% for 45 minutes. Please draft the regulatory deviation assessment for WHO-GMP audit readiness.",
        "expected_outcome": "Agent generates a formal, scientifically sound deviation letter citing stability monographs and QA containment protocols."
    }
]
