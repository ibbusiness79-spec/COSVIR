import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors";
import { logger } from "../../../shared/logger";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code, message: err.message });
  }

  logger.error("Unhandled error", { error: err instanceof Error ? err.message : String(err) });
  return res.status(500).json({ error: "INTERNAL_ERROR", message: "Unexpected error" });
}
