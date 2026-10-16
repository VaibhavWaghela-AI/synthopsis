import { KPIMetrics } from "../types/api";

export const UPTEKY_BENCHMARKS: KPIMetrics = {
  totalConversations: 12847,
  activeAgents: 4,
  avgResponseMinutes: 0.8, // down from 240 mins (4 hours)
  leadConversionRate: 35.8,
  recoveredLeadsPercentage: 52.0, // UAE Logistics Case
  docErrorReductionPercentage: 70.0, // Game of Pharma Case
  totalCostSavedInr: 2150000, // ₹21.5 Lakhs saved across client pilots
  channelDistribution: {
    whatsapp: 58,
    web: 27,
    email: 15
  },
  monthlyPerformance: [
    { month: "Jan", conversations: 1200, qualifiedLeads: 380, costSaved: 180000 },
    { month: "Feb", conversations: 1950, qualifiedLeads: 620, costSaved: 290000 },
    { month: "Mar", conversations: 2800, qualifiedLeads: 950, costSaved: 420000 },
    { month: "Apr", conversations: 3600, qualifiedLeads: 1240, costSaved: 560000 },
    { month: "May", conversations: 4400, qualifiedLeads: 1580, costSaved: 700000 }
  ]
};

export function calculateCustomROI(monthlyInquiries: number, avgHumanSupportCostPerMonth: number) {
  // Upteky NexusAI handles 78% of tier-1 repetitive inquiries autonomously
  const automatedInquiries = Math.round(monthlyInquiries * 0.78);
  const hoursSaved = Math.round((automatedInquiries * 12) / 60); // 12 mins per manual ticket
  const projectedSavings = Math.round(avgHumanSupportCostPerMonth * 0.65);

  return {
    monthlyInquiries,
    automatedInquiries,
    hoursSaved,
    projectedSavings,
    nexusCost: 4999, // Starter SaaS tier
    netMonthlyProfit: projectedSavings - 4999,
    roiMultiplier: Number((projectedSavings / 4999).toFixed(1))
  };
}
