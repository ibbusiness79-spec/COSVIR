import { Router } from "express";
import { DecisionController } from "../controllers/DecisionController";
import { authMiddleware } from "../middleware/authMiddleware";

export function decisionRoutes(controller: DecisionController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getOne);
  router.put("/:id", controller.update);
  router.post("/:id/analyze", controller.analyze);
  router.get("/:id/debate", controller.debate);
  router.get("/:id/executive-summary", controller.executiveSummary);
  router.post("/:id/export/pdf", controller.exportPdf);

  return router;
}
