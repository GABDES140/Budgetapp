import type { CreateGoalInput, EntityId, Goal, UpdateGoalInput } from "../../../types";

import { PostgresRepositoryBase } from "../../repositories/postgres/base";

export class GoalPostgresRepository extends PostgresRepositoryBase {
  async findAll(filters: { budgetId?: EntityId }) {
    const params: unknown[] = [];
    const whereClause = filters.budgetId ? `WHERE budget_id = $1` : "";

    if (filters.budgetId) {
      params.push(filters.budgetId);
    }

    const result = await this.query<GoalRow>(
      `
        SELECT
          id,
          budget_id AS "budgetId",
          name,
          description,
          target_amount AS "targetAmount",
          current_amount AS "currentAmount",
          currency,
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM goals
        ${whereClause}
        ORDER BY created_at DESC
      `,
      params,
    );

    return result.rows.map(mapGoalRow);
  }

  async findById(id: EntityId) {
    const result = await this.query<GoalRow>(
      `
        SELECT
          id,
          budget_id AS "budgetId",
          name,
          description,
          target_amount AS "targetAmount",
          current_amount AS "currentAmount",
          currency,
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM goals
        WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ? mapGoalRow(result.rows[0]) : null;
  }

  async create(input: CreateGoalInput) {
    const result = await this.query<GoalRow>(
      `
        INSERT INTO goals (
          id, budget_id, name, description, target_amount, current_amount, currency, target_date, status, created_at, updated_at
        )
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7::date, $8, NOW(), NOW())
        RETURNING
          id,
          budget_id AS "budgetId",
          name,
          description,
          target_amount AS "targetAmount",
          current_amount AS "currentAmount",
          currency,
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        input.budgetId,
        input.name,
        input.description,
        input.targetAmount,
        input.currentAmount,
        input.currency,
        input.targetDate,
        input.status,
      ],
    );

    return mapGoalRow(result.rows[0]);
  }

  async update(id: EntityId, input: UpdateGoalInput) {
    const current = await this.findById(id);

    if (!current) {
      throw new Error("Objectif introuvable");
    }

    const next = { ...current, ...input };
    const result = await this.query<GoalRow>(
      `
        UPDATE goals
        SET
          budget_id = $2,
          name = $3,
          description = $4,
          target_amount = $5,
          current_amount = $6,
          currency = $7,
          target_date = $8::date,
          status = $9,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          budget_id AS "budgetId",
          name,
          description,
          target_amount AS "targetAmount",
          current_amount AS "currentAmount",
          currency,
          TO_CHAR(target_date, 'YYYY-MM-DD') AS "targetDate",
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        id,
        next.budgetId,
        next.name,
        next.description,
        next.targetAmount,
        next.currentAmount,
        next.currency,
        next.targetDate,
        next.status,
      ],
    );

    return mapGoalRow(result.rows[0]);
  }

  async delete(id: EntityId) {
    await this.query(`DELETE FROM goals WHERE id = $1`, [id]);
  }
}

type GoalRow = Omit<Goal, "targetAmount" | "currentAmount"> & {
  targetAmount: number | string;
  currentAmount: number | string;
};

function mapGoalRow(row: GoalRow): Goal {
  return {
    ...row,
    targetAmount: Number(row.targetAmount),
    currentAmount: Number(row.currentAmount),
    targetDate: row.targetDate === null ? null : row.targetDate,
  };
}
