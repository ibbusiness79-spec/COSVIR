import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../../../infrastructure/security/jwtService";
import { AuthError } from "../../../shared/errors";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; email: string };
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) throw new AuthError("Missing bearer token");
  const token = header.slice("Bearer ".length);
  const payload = verifyToken(token);
  req.user = { id: payload.sub, email: payload.email };
  next();
}
