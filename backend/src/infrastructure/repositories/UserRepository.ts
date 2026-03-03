import { pool } from "../db/pool";

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  role: string;
}

export class UserRepository {
  async create(email: string, passwordHash: string): Promise<DbUser> {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, password_hash, role`,
      [email, passwordHash]
    );
    return result.rows[0] as DbUser;
  }

  async findByEmail(email: string): Promise<DbUser | null> {
    const result = await pool.query(`SELECT id, email, password_hash, role FROM users WHERE email = $1`, [email]);
    return (result.rows[0] as DbUser | undefined) ?? null;
  }

  async findById(id: string): Promise<DbUser | null> {
    const result = await pool.query(`SELECT id, email, password_hash, role FROM users WHERE id = $1`, [id]);
    return (result.rows[0] as DbUser | undefined) ?? null;
  }
}
