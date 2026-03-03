export interface StrategicScore {
  decisionId: string;
  globalRiskScore: number;
  financialScore: number;
  marketingScore: number;
  legalScore: number;
  growthScore: number;
  operationalRiskScore: number;
  weightingSnapshot: Record<string, number>;
}
