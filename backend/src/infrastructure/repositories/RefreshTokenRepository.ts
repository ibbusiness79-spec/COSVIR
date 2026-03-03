import { pool } from "../db/pool";

interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
}

export class RefreshTokenRepository {
  async create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  async findActiveByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    const result = await pool.query(
      `SELECT id, user_id, token_hash, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL
       LIMIT 1`,
      [tokenHash]
    );
    return (result.rows[0] as RefreshTokenRow | undefined) ?? null;
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await pool.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL`, [tokenHash]);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await pool.query(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
  }

  async cleanupExpired(): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked_at IS NOT NULL`);
  }
}
