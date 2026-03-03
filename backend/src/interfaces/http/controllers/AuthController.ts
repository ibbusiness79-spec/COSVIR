import { Request, Response } from "express";
import { z } from "zod";
import { UserRepository } from "../../../infrastructure/repositories/UserRepository";
import { RefreshTokenRepository } from "../../../infrastructure/repositories/RefreshTokenRepository";
import { signAccessToken, verifyPassword, hashPassword } from "../../../infrastructure/security/jwtService";
import { AuthError, ValidationError } from "../../../shared/errors";
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiryDate } from "../../../infrastructure/security/refreshTokenService";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export class AuthController {
  constructor(
    private readonly users: UserRepository,
    private readonly refreshTokens: RefreshTokenRepository
  ) {}

  private async issueSession(user: { id: string; email: string; role: string }) {
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = generateRefreshToken();
    await this.refreshTokens.create(user.id, hashRefreshToken(refreshToken), refreshTokenExpiryDate());

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }

  register = async (req: Request, res: Response) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);

    const existing = await this.users.findByEmail(parsed.data.email);
    if (existing) throw new ValidationError("Email already exists");

    const passwordHash = await hashPassword(parsed.data.password);
    const created = await this.users.create(parsed.data.email, passwordHash);
    const session = await this.issueSession(created);

    res.status(201).json(session);
  };

  login = async (req: Request, res: Response) => {
    const parsed = authSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);

    const user = await this.users.findByEmail(parsed.data.email);
    if (!user) throw new AuthError("Invalid credentials");

    const ok = await verifyPassword(user.password_hash, parsed.data.password);
    if (!ok) throw new AuthError("Invalid credentials");

    const session = await this.issueSession(user);
    res.json(session);
  };

  refresh = async (req: Request, res: Response) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);

    const oldHash = hashRefreshToken(parsed.data.refreshToken);
    const stored = await this.refreshTokens.findActiveByHash(oldHash);
    if (!stored) throw new AuthError("Invalid refresh token");

    if (new Date(stored.expires_at).getTime() < Date.now()) {
      await this.refreshTokens.revokeByHash(oldHash);
      throw new AuthError("Refresh token expired");
    }

    const user = await this.users.findById(stored.user_id);
    if (!user) throw new AuthError("User not found");

    await this.refreshTokens.revokeByHash(oldHash);
    const session = await this.issueSession(user);

    res.json(session);
  };

  logout = async (req: Request, res: Response) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.message);

    await this.refreshTokens.revokeByHash(hashRefreshToken(parsed.data.refreshToken));
    res.status(204).send();
  };
}
