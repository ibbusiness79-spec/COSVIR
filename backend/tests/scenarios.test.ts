import { describe, expect, it } from "vitest";
import { scenariosFromGlobal } from "../src/domain/services/ScoringEngine";

describe("scenariosFromGlobal", () => {
  it("returns optimistic realistic pessimistic", () => {
    const scenarios = scenariosFromGlobal(60);
    expect(scenarios.map((s) => s.scenarioType)).toEqual(["optimistic", "realistic", "pessimistic"]);
  });

  it("keeps risk bounds", () => {
    const low = scenariosFromGlobal(3);
    const high = scenariosFromGlobal(98);
    expect(low[0].riskDelta).toBe(0);
    expect(high[2].riskDelta).toBe(100);
  });
});
