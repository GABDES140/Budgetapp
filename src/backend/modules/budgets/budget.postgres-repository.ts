import type { Budget, CreateBudgetInput, EntityId, UpdateBudgetInput } from "../../../types";

import { PostgresRepositoryBase } from "../../repositories/postgres/base";

export class BudgetPostgresRepository extends PostgresRepositoryBase {
  async findAll(filters: { ownerId?: EntityId }) {
    const params: unknown[] = [];
    const whereClause = filters.ownerId ? `WHERE owner_id = $1` : "";

    if (filters.ownerId) {
      params.push(filters.ownerId);
    }

    const result = await this.query<BudgetRow>(
      `
        SELECT
          id,
          name,
          type,
          monthly_limit AS "monthlyLimit",
          default_currency AS "defaultCurrency",
          owner_id AS "ownerId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM budgets
        ${whereClause}
        ORDER BY created_at DESC
      `,
      params,
    );

    return result.rows.map(mapBudgetRow);
  }

  async findById(id: EntityId) {
    const result = await this.query<BudgetRow>(
      `
        SELECT
          id,
          name,
          type,
          monthly_limit AS "monthlyLimit",
          default_currency AS "defaultCurrency",
          owner_id AS "ownerId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM budgets
        WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ? mapBudgetRow(result.rows[0]) : null;
  }

  async create(input: CreateBudgetInput) {
    const result = await this.query<BudgetRow>(
      `
        INSERT INTO budgets (
          id, name, type, monthly_limit, default_currency, owner_id, created_at, updated_at
        )
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING
          id,
          name,
          type,
          monthly_limit AS "monthlyLimit",
          default_currency AS "defaultCurrency",
          owner_id AS "ownerId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [input.name, input.type, input.monthlyLimit, input.defaultCurrency, input.ownerId],
    );

    return mapBudgetRow(result.rows[0]);
  }

  async update(id: EntityId, input: UpdateBudgetInput) {
    const current = await this.findById(id);

    if (!current) {
      throw new Error("Budget introuvable");
    }

    const next = { ...current, ...input };
    const result = await this.query<BudgetRow>(
      `
        UPDATE budgets
        SET
          name = $2,
          type = $3,
          monthly_limit = $4,
          default_currency = $5,
          owner_id = $6,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          type,
          monthly_limit AS "monthlyLimit",
          default_currency AS "defaultCurrency",
          owner_id AS "ownerId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [id, next.name, next.type, next.monthlyLimit, next.defaultCurrency, next.ownerId],
    );

    return mapBudgetRow(result.rows[0]);
  }

  async delete(id: EntityId) {
    await this.query(`DELETE FROM budgets WHERE id = $1`, [id]);
  }
}

type BudgetRow = Omit<Budget, "monthlyLimit"> & {
  monthlyLimit: number | string;
};

function mapBudgetRow(row: BudgetRow): Budget {
  return {
    ...row,
    monthlyLimit: Number(row.monthlyLimit),
  };
}
