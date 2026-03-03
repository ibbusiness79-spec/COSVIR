import { AgentAnalysis } from "../../domain/entities/AgentAnalysis";
import { StrategicScore } from "../../domain/entities/StrategicScore";
import { pool } from "../db/pool";

export class AnalysisRepository {
  async replaceByDecision(decisionId: string, analyses: AgentAnalysis[]): Promise<void> {
    await pool.query(`DELETE FROM agent_analyses WHERE decision_id = $1`, [decisionId]);
    for (const item of analyses) {
      await pool.query(
        `INSERT INTO agent_analyses (decision_id, agent_type, analysis, recommendation, conditions, risks, confidence)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)`,
        [
          decisionId,
          item.agentType,
          item.analysis,
          item.recommendation,
          JSON.stringify(item.conditions),
          JSON.stringify(item.risks),
          item.confidence
        ]
      );
    }
  }

  async listByDecision(decisionId: string): Promise<AgentAnalysis[]> {
    const result = await pool.query(
      `SELECT decision_id, agent_type, analysis, recommendation, conditions, risks, confidence, created_at
       FROM agent_analyses WHERE decision_id = $1 ORDER BY created_at ASC`,
      [decisionId]
    );
    return result.rows.map((row) => ({
      decisionId: row.decision_id,
      agentType: row.agent_type,
      analysis: row.analysis,
      recommendation: row.recommendation,
      conditions: row.conditions,
      risks: row.risks,
      confidence: row.confidence,
      createdAt: new Date(row.created_at)
    }));
  }

  async saveScore(score: StrategicScore): Promise<void> {
    await pool.query(
      `INSERT INTO strategic_scores
      (decision_id, global_risk_score, financial_score, marketing_score, legal_score, growth_score, operational_risk_score, weighting_snapshot)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
      ON CONFLICT (decision_id)
      DO UPDATE SET global_risk_score=$2, financial_score=$3, marketing_score=$4, legal_score=$5, growth_score=$6, operational_risk_score=$7, weighting_snapshot=$8::jsonb`,
      [
        score.decisionId,
        score.globalRiskScore,
        score.financialScore,
        score.marketingScore,
        score.legalScore,
        score.growthScore,
        score.operationalRiskScore,
        JSON.stringify(score.weightingSnapshot)
      ]
    );
  }

  async getScore(decisionId: string): Promise<StrategicScore | null> {
    const result = await pool.query(`SELECT * FROM strategic_scores WHERE decision_id = $1`, [decisionId]);
    const row = result.rows[0];
    if (!row) return null;
    return {
      decisionId: row.decision_id,
      globalRiskScore: row.global_risk_score,
      financialScore: row.financial_score,
      marketingScore: row.marketing_score,
      legalScore: row.legal_score,
      growthScore: row.growth_score,
      operationalRiskScore: row.operational_risk_score,
      weightingSnapshot: row.weighting_snapshot
    };
  }

  async replaceCriticalZones(decisionId: string, zones: Array<{ zoneType: string; severity: number; rationale: string }>): Promise<void> {
    await pool.query(`DELETE FROM critical_zones WHERE decision_id = $1`, [decisionId]);
    for (const zone of zones) {
      await pool.query(
        `INSERT INTO critical_zones (decision_id, zone_type, severity, rationale) VALUES ($1,$2,$3,$4)`,
        [decisionId, zone.zoneType, zone.severity, zone.rationale]
      );
    }
  }

  async listCriticalZones(decisionId: string): Promise<Array<{ zoneType: string; severity: number; rationale: string }>> {
    const result = await pool.query(
      `SELECT zone_type, severity, rationale FROM critical_zones WHERE decision_id = $1 ORDER BY severity DESC`,
      [decisionId]
    );
    return result.rows.map((row) => ({ zoneType: row.zone_type, severity: row.severity, rationale: row.rationale }));
  }

  async replaceScenarios(
    decisionId: string,
    scenarios: Array<{ scenarioType: string; assumptions: string; expectedOutcome: string; riskDelta: number }>
  ): Promise<void> {
    await pool.query(`DELETE FROM scenarios WHERE decision_id = $1`, [decisionId]);
    for (const sc of scenarios) {
      await pool.query(
        `INSERT INTO scenarios (decision_id, scenario_type, assumptions, expected_outcome, risk_delta) VALUES ($1,$2,$3,$4,$5)`,
        [decisionId, sc.scenarioType, sc.assumptions, sc.expectedOutcome, sc.riskDelta]
      );
    }
  }

  async listScenarios(decisionId: string): Promise<Array<{ scenarioType: string; assumptions: string; expectedOutcome: string; riskDelta: number }>> {
    const result = await pool.query(
      `SELECT scenario_type, assumptions, expected_outcome, risk_delta FROM scenarios WHERE decision_id = $1 ORDER BY created_at ASC`,
      [decisionId]
    );
    return result.rows.map((row) => ({
      scenarioType: row.scenario_type,
      assumptions: row.assumptions,
      expectedOutcome: row.expected_outcome,
      riskDelta: row.risk_delta
    }));
  }

  async saveExport(decisionId: string, format: string, fileUrl: string): Promise<void> {
    await pool.query(`INSERT INTO exports (decision_id, format, file_url) VALUES ($1,$2,$3)`, [decisionId, format, fileUrl]);
  }
}
