export const decisionCategoryTypes = ["expansion", "pricing", "product", "hiring", "partnership"] as const;
export const riskLevels = ["low", "medium", "high"] as const;
export const horizons = ["3m", "6m", "12m", "24m", "36m"] as const;
export const decisionStatuses = ["draft", "analyzed", "archived"] as const;

export type DecisionCategoryType = (typeof decisionCategoryTypes)[number];
export type RiskLevel = (typeof riskLevels)[number];
export type Horizon = (typeof horizons)[number];
export type DecisionStatus = (typeof decisionStatuses)[number];

export type AgentType = "finance" | "marketing" | "risk" | "legal" | "growth";
