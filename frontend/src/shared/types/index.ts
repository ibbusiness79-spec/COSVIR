export interface Decision {
  id: string;
  title: string;
  context: string;
  categoryType: string;
  riskLevel: string;
  horizon: string;
  status: string;
  createdAt: string;
}

export interface AgentAnalysis {
  agentType: string;
  analysis: string;
  recommendation: "GO" | "NO_GO" | "CONDITIONAL_GO";
  conditions: string[];
  risks: Array<{ label: string; severity: number; rationale: string }>;
  confidence: number;
}
