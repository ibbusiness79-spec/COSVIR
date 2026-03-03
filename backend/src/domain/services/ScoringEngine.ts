import { AgentAnalysis } from "../entities/AgentAnalysis";
import { StrategicScore } from "../entities/StrategicScore";

const weights = {
  finance: 0.25,
  marketing: 0.15,
  risk: 0.3,
  legal: 0.2,
  growth: 0.1
};

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function baseScore(analysis: AgentAnalysis): number {
  const avgRisk = analysis.risks.length
    ? analysis.risks.reduce((sum, item) => sum + item.severity, 0) / analysis.risks.length
    : 50;
  const recommendationPenalty = analysis.recommendation === "NO_GO" ? 15 : analysis.recommendation === "CONDITIONAL_GO" ? 8 : 0;
  return clamp(avgRisk + recommendationPenalty);
}

export function computeStrategicScore(decisionId: string, analyses: AgentAnalysis[]): StrategicScore {
  const byAgent = Object.fromEntries(analyses.map((a) => [a.agentType, baseScore(a)])) as Record<string, number>;
  const confidenceAvg = analyses.reduce((sum, item) => sum + item.confidence, 0) / Math.max(analyses.length, 1);

  let global =
    (byAgent.finance ?? 50) * weights.finance +
    (byAgent.marketing ?? 50) * weights.marketing +
    (byAgent.risk ?? 50) * weights.risk +
    (byAgent.legal ?? 50) * weights.legal +
    (byAgent.growth ?? 50) * weights.growth;

  if (confidenceAvg < 60) global += 5;

  return {
    decisionId,
    globalRiskScore: clamp(global),
    financialScore: clamp(byAgent.finance ?? 50),
    marketingScore: clamp(byAgent.marketing ?? 50),
    legalScore: clamp(byAgent.legal ?? 50),
    growthScore: clamp(byAgent.growth ?? 50),
    operationalRiskScore: clamp(byAgent.risk ?? 50),
    weightingSnapshot: weights
  };
}

export function scenariosFromGlobal(globalRiskScore: number): Array<{ scenarioType: string; riskDelta: number; assumptions: string; expectedOutcome: string }> {
  return [
    {
      scenarioType: "optimistic",
      riskDelta: Math.max(0, globalRiskScore - 15),
      assumptions: "Execution rapide, adoption marché supérieure aux attentes, conformité anticipée.",
      expectedOutcome: "Croissance soutenue avec exposition risque contenue."
    },
    {
      scenarioType: "realistic",
      riskDelta: globalRiskScore,
      assumptions: "Exécution nominale, frictions modérées, signaux marché stables.",
      expectedOutcome: "Résultat conforme au plan avec points de vigilance gérables."
    },
    {
      scenarioType: "pessimistic",
      riskDelta: Math.min(100, globalRiskScore + 15),
      assumptions: "Retards d'exécution, pression concurrentielle, aléas réglementaires.",
      expectedOutcome: "Dégradation marge et traction; pivot requis."
    }
  ];
}
