import { describe, expect, it } from "vitest";
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiryDate } from "../src/infrastructure/security/refreshTokenService";

describe("refresh token service", () => {
  it("generates unique refresh tokens", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(40);
  });

  it("hashes deterministically", () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("produces future expiry date", () => {
    const expiry = refreshTokenExpiryDate();
    expect(expiry.getTime()).toBeGreaterThan(Date.now());
  });
});
