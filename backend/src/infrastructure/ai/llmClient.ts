import { AgentAnalysis } from "../../domain/entities/AgentAnalysis";
import { AgentType } from "../../shared/enums";

export interface DecisionInput {
  title: string;
  context: string;
  horizon: string;
  riskLevel: string;
}

export class LlmClient {
  async analyze(agentType: AgentType, input: DecisionInput): Promise<Omit<AgentAnalysis, "decisionId">> {
    const syntheticSeverity = this.syntheticSeverity(agentType, input);
    return {
      agentType,
      analysis: `${agentType.toUpperCase()} analysis of ${input.title}: ${input.context.slice(0, 220)}`,
      recommendation: syntheticSeverity > 70 ? "NO_GO" : syntheticSeverity > 55 ? "CONDITIONAL_GO" : "GO",
      conditions: syntheticSeverity > 55 ? ["Valider hypothèses critiques avant exécution", "Mettre un plan de mitigation trimestriel"] : [],
      risks: [
        { label: `${agentType}-risk-1`, severity: syntheticSeverity, rationale: `Primary ${agentType} concern identified.` },
        { label: `${agentType}-risk-2`, severity: Math.min(100, syntheticSeverity + 8), rationale: `Secondary dependency risk.` },
        { label: `${agentType}-risk-3`, severity: Math.max(0, syntheticSeverity - 10), rationale: `Execution variance risk.` }
      ],
      confidence: 72
    };
  }

  private syntheticSeverity(agentType: AgentType, input: DecisionInput): number {
    const base = input.riskLevel === "high" ? 72 : input.riskLevel === "medium" ? 58 : 44;
    const modifier = agentType === "legal" ? 7 : agentType === "risk" ? 9 : agentType === "growth" ? -4 : 0;
    return Math.max(0, Math.min(100, base + modifier));
  }
}
