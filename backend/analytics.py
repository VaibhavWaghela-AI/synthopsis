from typing import Dict, Any

SYNTHOPSIS_BENCHMARKS = {
    "total_conversations": 12847,
    "active_agents": 4,
    "avg_response_minutes": 0.8,
    "baseline_response_minutes": 240.0,
    "response_time_reduction_pct": 96.6,
    "recovered_leads_percentage": 52.0,  # UAE Logistics case
    "doc_error_reduction_pct": 70.0,     # Game of Pharma case
    "total_cost_saved_inr": 2150000,
    "channel_distribution": {
        "whatsapp": 58,
        "web": 27,
        "email": 15
    },
    "monthly_performance": [
        {"month": "Jan", "conversations": 1200, "qualified_leads": 380, "cost_saved": 180000},
        {"month": "Feb", "conversations": 1950, "qualified_leads": 620, "cost_saved": 290000},
        {"month": "Mar", "conversations": 2800, "qualified_leads": 950, "cost_saved": 420000},
        {"month": "Apr", "conversations": 3600, "qualified_leads": 1240, "cost_saved": 560000},
        {"month": "May", "conversations": 4400, "qualified_leads": 1580, "cost_saved": 700000}
    ]
}

UPTEKY_BENCHMARKS = SYNTHOPSIS_BENCHMARKS

def calculate_roi(monthly_inquiries: int, avg_human_cost_inr: int) -> Dict[str, Any]:
    automated_inquiries = int(monthly_inquiries * 0.78)
    hours_saved = int((automated_inquiries * 12) / 60)
    projected_savings = int(avg_human_cost_inr * 0.65)
    nexus_cost = 4999  # Starter SaaS subscription

    return {
        "monthly_inquiries": monthly_inquiries,
        "automated_inquiries": automated_inquiries,
        "hours_saved": hours_saved,
        "projected_savings_inr": projected_savings,
        "nexus_cost_inr": nexus_cost,
        "net_monthly_profit_inr": projected_savings - nexus_cost,
        "roi_multiplier": round(projected_savings / nexus_cost, 1)
    }
