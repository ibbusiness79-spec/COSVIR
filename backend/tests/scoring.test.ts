import { describe, expect, it } from "vitest";
import { computeStrategicScore } from "../src/domain/services/ScoringEngine";

describe("computeStrategicScore", () => {
  it("should keep score in bounds 0-100", () => {
    const score = computeStrategicScore("d1", [
      { decisionId: "d1", agentType: "finance", analysis: "a", recommendation: "NO_GO", conditions: [], risks: [{ label: "x", severity: 100, rationale: "r" }], confidence: 90 },
      { decisionId: "d1", agentType: "marketing", analysis: "a", recommendation: "NO_GO", conditions: [], risks: [{ label: "x", severity: 100, rationale: "r" }], confidence: 90 },
      { decisionId: "d1", agentType: "risk", analysis: "a", recommendation: "NO_GO", conditions: [], risks: [{ label: "x", severity: 100, rationale: "r" }], confidence: 90 },
      { decisionId: "d1", agentType: "legal", analysis: "a", recommendation: "NO_GO", conditions: [], risks: [{ label: "x", severity: 100, rationale: "r" }], confidence: 90 },
      { decisionId: "d1", agentType: "growth", analysis: "a", recommendation: "NO_GO", conditions: [], risks: [{ label: "x", severity: 100, rationale: "r" }], confidence: 90 }
    ]);

    expect(score.globalRiskScore).toBeLessThanOrEqual(100);
    expect(score.globalRiskScore).toBeGreaterThanOrEqual(0);
  });

  it("should be deterministic for same input", () => {
    const analyses = [
      { decisionId: "d2", agentType: "finance", analysis: "a", recommendation: "CONDITIONAL_GO", conditions: [], risks: [{ label: "x", severity: 50, rationale: "r" }], confidence: 80 },
      { decisionId: "d2", agentType: "marketing", analysis: "a", recommendation: "GO", conditions: [], risks: [{ label: "x", severity: 45, rationale: "r" }], confidence: 80 },
      { decisionId: "d2", agentType: "risk", analysis: "a", recommendation: "CONDITIONAL_GO", conditions: [], risks: [{ label: "x", severity: 65, rationale: "r" }], confidence: 80 },
      { decisionId: "d2", agentType: "legal", analysis: "a", recommendation: "GO", conditions: [], risks: [{ label: "x", severity: 35, rationale: "r" }], confidence: 80 },
      { decisionId: "d2", agentType: "growth", analysis: "a", recommendation: "GO", conditions: [], risks: [{ label: "x", severity: 30, rationale: "r" }], confidence: 80 }
    ] as any;

    const a = computeStrategicScore("d2", analyses);
    const b = computeStrategicScore("d2", analyses);
    expect(a.globalRiskScore).toBe(b.globalRiskScore);
  });
});
