import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config";
import { AnalyzeDecisionUseCase } from "./application/usecases/AnalyzeDecisionUseCase";
import { LlmClient } from "./infrastructure/ai/llmClient";
import { MultiAgentOrchestrator } from "./infrastructure/ai/multiAgentOrchestrator";
import { AnalysisRepository } from "./infrastructure/repositories/AnalysisRepository";
import { DecisionRepository } from "./infrastructure/repositories/DecisionRepository";
import { RefreshTokenRepository } from "./infrastructure/repositories/RefreshTokenRepository";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { PdfService } from "./infrastructure/pdf/PdfService";
import { AuthController } from "./interfaces/http/controllers/AuthController";
import { DecisionController } from "./interfaces/http/controllers/DecisionController";
import { errorHandler } from "./interfaces/http/middleware/errorHandler";
import { apiRateLimit, authRateLimit } from "./interfaces/http/middleware/rateLimit";
import { authRoutes } from "./interfaces/http/routes/authRoutes";
import { decisionRoutes } from "./interfaces/http/routes/decisionRoutes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));
  app.use(apiRateLimit);

  const users = new UserRepository();
  const refreshTokens = new RefreshTokenRepository();
  const decisions = new DecisionRepository();
  const analyses = new AnalysisRepository();
  const llm = new LlmClient();
  const orchestrator = new MultiAgentOrchestrator(llm);
  const analyzeDecision = new AnalyzeDecisionUseCase(decisions, analyses, orchestrator);
  const pdfService = new PdfService();

  const authController = new AuthController(users, refreshTokens);
  const decisionController = new DecisionController(decisions, analyses, analyzeDecision, pdfService);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", authRateLimit, authRoutes(authController));
  app.use("/decisions", decisionRoutes(decisionController));

  app.use(errorHandler);
  return app;
}
