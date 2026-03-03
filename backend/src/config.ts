import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 14),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:8080",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  exportDir: process.env.EXPORT_DIR ?? "./exports"
};

export function assertConfig(): void {
  if (!config.databaseUrl) throw new Error("DATABASE_URL is required");
  if (!config.jwtSecret) throw new Error("JWT_SECRET is required");
}
