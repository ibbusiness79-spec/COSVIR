import { AgentAnalysis } from "../../domain/entities/AgentAnalysis";
import { AgentType } from "../../shared/enums";
import { LlmClient } from "./llmClient";

const agents: AgentType[] = ["finance", "marketing", "risk", "legal", "growth"];

export class MultiAgentOrchestrator {
  constructor(private readonly llmClient: LlmClient) {}

  async run(decisionId: string, input: { title: string; context: string; horizon: string; riskLevel: string }): Promise<AgentAnalysis[]> {
    const results = await Promise.all(
      agents.map(async (agentType) => {
        const response = await this.llmClient.analyze(agentType, input);
        return { ...response, decisionId } satisfies AgentAnalysis;
      })
    );
    return results;
  }

  synthesize(analyses: AgentAnalysis[]): { executiveSummary: string; finalRecommendation: string; rationale: string; criticalZones: string[] } {
    const noGoCount = analyses.filter((a) => a.recommendation === "NO_GO").length;
    const conditionalCount = analyses.filter((a) => a.recommendation === "CONDITIONAL_GO").length;
    const recommendation = noGoCount > 1 ? "NO_GO" : conditionalCount > 1 ? "CONDITIONAL_GO" : "GO";
    const criticalZones = analyses
      .flatMap((a) => a.risks.map((r) => ({ zone: `${a.agentType}:${r.label}`, severity: r.severity })))
      .filter((x) => x.severity >= 70)
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 5)
      .map((x) => x.zone);

    return {
      executiveSummary: "Avis divergents consolidés avec pondération par sévérité et confiance.",
      finalRecommendation: recommendation,
      rationale: "La recommandation reflète les contradictions explicites et les zones à criticité élevée.",
      criticalZones
    };
  }
}
