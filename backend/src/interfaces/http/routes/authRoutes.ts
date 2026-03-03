import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { asyncHandler } from "../middleware/asyncHandler";

export function authRoutes(controller: AuthController): Router {
  const router = Router();
  router.post("/register", asyncHandler(controller.register));
  router.post("/login", asyncHandler(controller.login));
  router.post("/refresh", asyncHandler(controller.refresh));
  router.post("/logout", asyncHandler(controller.logout));
  return router;
}
