import { createHash, randomBytes } from "node:crypto";
import { config } from "../../config";

export function generateRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function refreshTokenExpiryDate(): Date {
  const ttl = Math.max(1, config.refreshTokenTtlDays);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ttl);
  return expiresAt;
}
