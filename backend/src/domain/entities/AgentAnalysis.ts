import { AgentType } from "../../shared/enums";

export interface RiskItem {
  label: string;
  severity: number;
  rationale: string;
}

export interface AgentAnalysis {
  id?: string;
  decisionId: string;
  agentType: AgentType;
  analysis: string;
  recommendation: "GO" | "NO_GO" | "CONDITIONAL_GO";
  conditions: string[];
  risks: RiskItem[];
  confidence: number;
  createdAt?: Date;
}
