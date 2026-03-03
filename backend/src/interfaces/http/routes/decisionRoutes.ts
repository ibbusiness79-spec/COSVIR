import { Router } from "express";
import { DecisionController } from "../controllers/DecisionController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/asyncHandler";

export function decisionRoutes(controller: DecisionController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.post("/", asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.getOne));
  router.put("/:id", asyncHandler(controller.update));
  router.post("/:id/analyze", asyncHandler(controller.analyze));
  router.get("/:id/debate", asyncHandler(controller.debate));
  router.get("/:id/executive-summary", asyncHandler(controller.executiveSummary));
  router.post("/:id/export/pdf", asyncHandler(controller.exportPdf));

  return router;
}
