import { Request, Response } from "express";
import { createDecisionSchema, updateDecisionSchema } from "../../../application/dto/decisionDto";
import { AnalyzeDecisionUseCase } from "../../../application/usecases/AnalyzeDecisionUseCase";
import { AnalysisRepository } from "../../../infrastructure/repositories/AnalysisRepository";
import { DecisionRepository } from "../../../infrastructure/repositories/DecisionRepository";
import { PdfService } from "../../../infrastructure/pdf/PdfService";
import { NotFoundError, ValidationError } from "../../../shared/errors";

export class DecisionController {
  constructor(
    private readonly decisions: DecisionRepository,
    private readonly analyses: AnalysisRepository,
    private readonly analyzeDecision: AnalyzeDecisionUseCase,
    private readonly pdfService: PdfService
  ) {}

  create = async (req: Request, res: Response) => {
    const parsed = createDecisionSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);
    const userId = req.user!.id;

    const decision = await this.decisions.create({
      userId,
      title: parsed.data.title,
      context: parsed.data.context,
      categoryType: parsed.data.categoryType,
      riskLevel: parsed.data.riskLevel,
      horizon: parsed.data.horizon
    });

    await this.decisions.saveHistory({
      decisionId: decision.id,
      eventType: "DECISION_CREATED",
      beforeState: null,
      afterState: decision,
      actorUserId: userId
    });

    res.status(201).json(decision);
  };

  list = async (req: Request, res: Response) => {
    const items = await this.decisions.listByUser(req.user!.id);
    res.json(items);
  };

  getOne = async (req: Request, res: Response) => {
    const decision = await this.decisions.findById(req.params.id, req.user!.id);
    if (!decision) throw new NotFoundError("Decision not found");
    res.json(decision);
  };

  update = async (req: Request, res: Response) => {
    const parsed = updateDecisionSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);

    const before = await this.decisions.findById(req.params.id, req.user!.id);
    if (!before) throw new NotFoundError("Decision not found");

    const updated = await this.decisions.update(req.params.id, req.user!.id, parsed.data);
    if (!updated) throw new NotFoundError("Decision not found");

    await this.decisions.saveHistory({
      decisionId: updated.id,
      eventType: "DECISION_UPDATED",
      beforeState: before,
      afterState: updated,
      actorUserId: req.user!.id
    });

    res.json(updated);
  };

  analyze = async (req: Request, res: Response) => {
    const result = await this.analyzeDecision.execute(req.params.id, req.user!.id);
    res.json(result);
  };

  debate = async (req: Request, res: Response) => {
    const decision = await this.decisions.findById(req.params.id, req.user!.id);
    if (!decision) throw new NotFoundError("Decision not found");
    const analyses = await this.analyses.listByDecision(decision.id);
    const score = await this.analyses.getScore(decision.id);
    const criticalZones = await this.analyses.listCriticalZones(decision.id);
    res.json({ decision, analyses, score, criticalZones });
  };

  executiveSummary = async (req: Request, res: Response) => {
    const decision = await this.decisions.findById(req.params.id, req.user!.id);
    if (!decision) throw new NotFoundError("Decision not found");
    const analyses = await this.analyses.listByDecision(decision.id);
    const score = await this.analyses.getScore(decision.id);
    const criticalZones = await this.analyses.listCriticalZones(decision.id);
    const scenarios = await this.analyses.listScenarios(decision.id);

    if (!score) throw new NotFoundError("No analysis score found");

    res.json({
      decision,
      score,
      criticalZones,
      scenarios,
      recommendation: analyses.some((a) => a.recommendation === "NO_GO") ? "NO_GO" : "CONDITIONAL_GO",
      executiveSummary: "Synthese basee sur contradiction inter-agents, criticite et niveaux de confiance."
    });
  };

  exportPdf = async (req: Request, res: Response) => {
    const decision = await this.decisions.findById(req.params.id, req.user!.id);
    if (!decision) throw new NotFoundError("Decision not found");

    const score = await this.analyses.getScore(decision.id);
    const criticalZones = await this.analyses.listCriticalZones(decision.id);
    if (!score) throw new NotFoundError("No analysis score found");

    const pdf = await this.pdfService.renderExecutiveSummary({
      title: decision.title,
      summary: decision.context,
      recommendation: score.globalRiskScore > 65 ? "NO_GO" : "CONDITIONAL_GO",
      globalRiskScore: score.globalRiskScore,
      criticalZones: criticalZones.map((z) => ({ zoneType: z.zoneType, severity: z.severity }))
    });

    await this.analyses.saveExport(decision.id, "pdf", `decision-${decision.id}.pdf`);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=decision-${decision.id}.pdf`);
    res.send(pdf);
  };
}
