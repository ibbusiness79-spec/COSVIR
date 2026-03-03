import { pool } from "../db/pool";
import { Decision } from "../../domain/entities/Decision";

export class DecisionRepository {
  async create(payload: Omit<Decision, "id" | "createdAt" | "updatedAt" | "status">): Promise<Decision> {
    const result = await pool.query(
      `INSERT INTO decisions (user_id, title, context, category_type, risk_level, horizon, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING id, user_id, title, context, category_type, risk_level, horizon, status, created_at, updated_at`,
      [payload.userId, payload.title, payload.context, payload.categoryType, payload.riskLevel, payload.horizon]
    );
    return this.map(result.rows[0]);
  }

  async listByUser(userId: string): Promise<Decision[]> {
    const result = await pool.query(
      `SELECT id, user_id, title, context, category_type, risk_level, horizon, status, created_at, updated_at
       FROM decisions WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows.map((row) => this.map(row));
  }

  async findById(id: string, userId: string): Promise<Decision | null> {
    const result = await pool.query(
      `SELECT id, user_id, title, context, category_type, risk_level, horizon, status, created_at, updated_at
       FROM decisions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    const row = result.rows[0];
    return row ? this.map(row) : null;
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<Pick<Decision, "title" | "context" | "categoryType" | "riskLevel" | "horizon" | "status">>
  ): Promise<Decision | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...payload
    };

    const result = await pool.query(
      `UPDATE decisions
       SET title = $1, context = $2, category_type = $3, risk_level = $4, horizon = $5, status = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING id, user_id, title, context, category_type, risk_level, horizon, status, created_at, updated_at`,
      [updated.title, updated.context, updated.categoryType, updated.riskLevel, updated.horizon, updated.status, id, userId]
    );
    return result.rows[0] ? this.map(result.rows[0]) : null;
  }

  async saveHistory(params: {
    decisionId: string;
    eventType: string;
    beforeState: unknown;
    afterState: unknown;
    actorUserId: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO decision_history (decision_id, event_type, before_state, after_state, actor_user_id)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)`,
      [params.decisionId, params.eventType, JSON.stringify(params.beforeState), JSON.stringify(params.afterState), params.actorUserId]
    );
  }

  private map(row: any): Decision {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      context: row.context,
      categoryType: row.category_type,
      riskLevel: row.risk_level,
      horizon: row.horizon,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}
