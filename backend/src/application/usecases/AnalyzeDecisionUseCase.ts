import { computeStrategicScore, scenariosFromGlobal } from "../../domain/services/ScoringEngine";
import { MultiAgentOrchestrator } from "../../infrastructure/ai/multiAgentOrchestrator";
import { AnalysisRepository } from "../../infrastructure/repositories/AnalysisRepository";
import { DecisionRepository } from "../../infrastructure/repositories/DecisionRepository";
import { NotFoundError } from "../../shared/errors";

export class AnalyzeDecisionUseCase {
  constructor(
    private readonly decisions: DecisionRepository,
    private readonly analyses: AnalysisRepository,
    private readonly orchestrator: MultiAgentOrchestrator
  ) {}

  async execute(decisionId: string, userId: string) {
    const decision = await this.decisions.findById(decisionId, userId);
    if (!decision) throw new NotFoundError("Decision not found");

    const outputs = await this.orchestrator.run(decision.id, {
      title: decision.title,
      context: decision.context,
      horizon: decision.horizon,
      riskLevel: decision.riskLevel
    });

    await this.analyses.replaceByDecision(decision.id, outputs);

    const score = computeStrategicScore(decision.id, outputs);
    await this.analyses.saveScore(score);

    const zones = outputs
      .flatMap((x) => x.risks.map((r) => ({ zoneType: `${x.agentType}:${r.label}`, severity: r.severity, rationale: r.rationale })))
      .filter((x) => x.severity >= 70)
      .sort((a, b) => b.severity - a.severity);

    await this.analyses.replaceCriticalZones(decision.id, zones);
    await this.analyses.replaceScenarios(decision.id, scenariosFromGlobal(score.globalRiskScore));

    const synthesis = this.orchestrator.synthesize(outputs);
    await this.decisions.update(decision.id, userId, { status: "analyzed" });

    return {
      decisionId: decision.id,
      analyses: outputs,
      score,
      synthesis
    };
  }
}
