import jwt, { Secret, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { config } from "../../config";
import { AuthError } from "../../shared/errors";

export interface JwtPayload {
  sub: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function signAccessToken(payload: JwtPayload): string {
  const secret: Secret = config.jwtSecret;
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwtSecret as Secret) as JwtPayload;
  } catch {
    throw new AuthError("Invalid token");
  }
}
