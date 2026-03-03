import { z } from "zod";
import { decisionCategoryTypes, horizons, riskLevels } from "../../shared/enums";

export const createDecisionSchema = z.object({
  title: z.string().min(3).max(255),
  context: z.string().min(30),
  categoryType: z.enum(decisionCategoryTypes),
  riskLevel: z.enum(riskLevels),
  horizon: z.enum(horizons)
});

export const updateDecisionSchema = createDecisionSchema.partial().extend({
  status: z.enum(["draft", "analyzed", "archived"]).optional()
});

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
export type UpdateDecisionInput = z.infer<typeof updateDecisionSchema>;
