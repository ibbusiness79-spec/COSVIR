import { DecisionCategoryType, DecisionStatus, Horizon, RiskLevel } from "../../shared/enums";

export interface Decision {
  id: string;
  userId: string;
  title: string;
  context: string;
  categoryType: DecisionCategoryType;
  riskLevel: RiskLevel;
  horizon: Horizon;
  status: DecisionStatus;
  createdAt: Date;
  updatedAt: Date;
}
