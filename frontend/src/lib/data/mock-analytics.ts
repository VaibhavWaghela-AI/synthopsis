export interface ResponseTimePoint {
  week: string;
  manualHours: number;
  nexusMinutes: number;
}

export interface ReactivationPoint {
  day: string;
  reactivationRate: number;
}

export interface ChannelVolume {
  name: string;
  value: number;
  color: string;
}

export interface CostSavingsPoint {
  month: string;
  manualCost: number; // in INR thousands (e.g. 250 = ₹2.5 Lakhs)
  automatedCost: number; // in INR thousands (e.g. 35 = ₹35K)
}

export interface AgentPerformanceRow {
  id: string;
  name: string;
  channel: "WhatsApp" | "Email" | "Web Chat";
  conversations: number;
  avgResponseTime: string;
  csatScore: number;
  status: "Active" | "Optimizing";
}

export const RESPONSE_TIME_DATA: ResponseTimePoint[] = [
  { week: "Week 1", manualHours: 4.2, nexusMinutes: 45 },
  { week: "Week 2", manualHours: 4.0, nexusMinutes: 30 },
  { week: "Week 3", manualHours: 3.8, nexusMinutes: 22 },
  { week: "Week 4", manualHours: 3.9, nexusMinutes: 14 },
  { week: "Week 5", manualHours: 4.1, nexusMinutes: 10 },
  { week: "Week 6", manualHours: 4.0, nexusMinutes: 8 }
];

export const REACTIVATION_DATA: ReactivationPoint[] = [
  { day: "Day 1", reactivationRate: 4 },
  { day: "Day 5", reactivationRate: 12 },
  { day: "Day 10", reactivationRate: 23 },
  { day: "Day 15", reactivationRate: 34 },
  { day: "Day 20", reactivationRate: 41 },
  { day: "Day 25", reactivationRate: 48 },
  { day: "Day 30", reactivationRate: 52 }
];

export const CHANNEL_VOLUME_DATA: ChannelVolume[] = [
  { name: "WhatsApp Business", value: 55, color: "#22c55e" },
  { name: "Website AI Widget", value: 30, color: "#3b82f6" },
  { name: "Enterprise Email", value: 15, color: "#a855f7" }
];

export const COST_SAVINGS_DATA: CostSavingsPoint[] = [
  { month: "Jan", manualCost: 250, automatedCost: 35 },
  { month: "Feb", manualCost: 255, automatedCost: 35 },
  { month: "Mar", manualCost: 260, automatedCost: 36 },
  { month: "Apr", manualCost: 270, automatedCost: 38 },
  { month: "May", manualCost: 280, automatedCost: 39 },
  { month: "Jun", manualCost: 295, automatedCost: 40 }
];

export const AGENT_PERFORMANCE_TABLE: AgentPerformanceRow[] = [
  {
    id: "1",
    name: "Real Estate Sales Agent",
    channel: "WhatsApp",
    conversations: 5412,
    avgResponseTime: "0.8s",
    csatScore: 4.9,
    status: "Active"
  },
  {
    id: "2",
    name: "JM PlastoPack Assistant",
    channel: "Web Chat",
    conversations: 3820,
    avgResponseTime: "1.2s",
    csatScore: 4.8,
    status: "Active"
  },
  {
    id: "3",
    name: "Pharma Compliance Reviewer",
    channel: "Email",
    conversations: 1240,
    avgResponseTime: "2.4s",
    csatScore: 4.95,
    status: "Active"
  },
  {
    id: "4",
    name: "UAE Logistics Reactivator",
    channel: "WhatsApp",
    conversations: 2375,
    avgResponseTime: "0.9s",
    csatScore: 4.7,
    status: "Active"
  }
];

export const OVERVIEW_METRICS = {
  totalConversations: "12,847",
  activeAgents: "7",
  avgResponseTime: "< 8 min",
  conversionRate: "35%",
  monthlySavings: "₹2.15 Lakhs/mo",
  uptime: "99.98%"
};
