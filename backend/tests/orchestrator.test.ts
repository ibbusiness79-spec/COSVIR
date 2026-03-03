import { describe, expect, it } from "vitest";
import { LlmClient } from "../src/infrastructure/ai/llmClient";
import { MultiAgentOrchestrator } from "../src/infrastructure/ai/multiAgentOrchestrator";

describe("MultiAgentOrchestrator", () => {
  it("runs 5 independent agents", async () => {
    const orchestrator = new MultiAgentOrchestrator(new LlmClient());
    const analyses = await orchestrator.run("decision-1", {
      title: "Test",
      context: "A".repeat(120),
      horizon: "12m",
      riskLevel: "medium"
    });

    expect(analyses).toHaveLength(5);
    expect(new Set(analyses.map((x) => x.agentType)).size).toBe(5);
  });
});
