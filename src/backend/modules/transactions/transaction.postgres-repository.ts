import type { CreateTransactionInput, EntityId, Transaction, UpdateTransactionInput } from "../../../types";

import { PostgresRepositoryBase } from "../../repositories/postgres/base";

export class TransactionPostgresRepository extends PostgresRepositoryBase {
  async findAll(filters: { budgetId?: EntityId; userId?: EntityId }) {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.budgetId) {
      params.push(filters.budgetId);
      conditions.push(`budget_id = $${params.length}`);
    }

    if (filters.userId) {
      params.push(filters.userId);
      conditions.push(`user_id = $${params.length}`);
    }

    const result = await this.query<TransactionRow>(
      `
        SELECT
          id,
          budget_id AS "budgetId",
          user_id AS "userId",
          type,
          amount,
          currency,
          TO_CHAR(date, 'YYYY-MM-DD') AS date,
          description,
          category_id AS "categoryId",
          subcategory_id AS "subcategoryId",
          notes,
          is_recurring AS "isRecurring",
          recurring_rule_id AS "recurringRuleId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM transactions
        ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
        ORDER BY date DESC, created_at DESC
      `,
      params,
    );

    return result.rows.map(mapTransactionRow);
  }

  async findById(id: EntityId) {
    const result = await this.query<TransactionRow>(
      `
        SELECT
          id,
          budget_id AS "budgetId",
          user_id AS "userId",
          type,
          amount,
          currency,
          TO_CHAR(date, 'YYYY-MM-DD') AS date,
          description,
          category_id AS "categoryId",
          subcategory_id AS "subcategoryId",
          notes,
          is_recurring AS "isRecurring",
          recurring_rule_id AS "recurringRuleId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM transactions
        WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ? mapTransactionRow(result.rows[0]) : null;
  }

  async create(input: CreateTransactionInput) {
    const result = await this.query<TransactionRow>(
      `
        INSERT INTO transactions (
          id, budget_id, user_id, type, amount, currency, date, description, category_id,
          subcategory_id, notes, is_recurring, recurring_rule_id, created_at, updated_at
        )
        VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::date, $7, $8,
          $9, $10, $11, $12, NOW(), NOW()
        )
        RETURNING
          id,
          budget_id AS "budgetId",
          user_id AS "userId",
          type,
          amount,
          currency,
          TO_CHAR(date, 'YYYY-MM-DD') AS date,
          description,
          category_id AS "categoryId",
          subcategory_id AS "subcategoryId",
          notes,
          is_recurring AS "isRecurring",
          recurring_rule_id AS "recurringRuleId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        input.budgetId,
        input.userId,
        input.type,
        input.amount,
        input.currency,
        input.date,
        input.description,
        input.categoryId,
        input.subcategoryId,
        input.notes,
        input.isRecurring,
        input.recurringRuleId,
      ],
    );

    return mapTransactionRow(result.rows[0]);
  }

  async update(id: EntityId, input: UpdateTransactionInput) {
    const current = await this.findById(id);

    if (!current) {
      throw new Error("Transaction introuvable");
    }

    const next = { ...current, ...input };
    const result = await this.query<TransactionRow>(
      `
        UPDATE transactions
        SET
          budget_id = $2,
          user_id = $3,
          type = $4,
          amount = $5,
          currency = $6,
          date = $7::date,
          description = $8,
          category_id = $9,
          subcategory_id = $10,
          notes = $11,
          is_recurring = $12,
          recurring_rule_id = $13,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          budget_id AS "budgetId",
          user_id AS "userId",
          type,
          amount,
          currency,
          TO_CHAR(date, 'YYYY-MM-DD') AS date,
          description,
          category_id AS "categoryId",
          subcategory_id AS "subcategoryId",
          notes,
          is_recurring AS "isRecurring",
          recurring_rule_id AS "recurringRuleId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [
        id,
        next.budgetId,
        next.userId,
        next.type,
        next.amount,
        next.currency,
        next.date,
        next.description,
        next.categoryId,
        next.subcategoryId,
        next.notes,
        next.isRecurring,
        next.recurringRuleId,
      ],
    );

    return mapTransactionRow(result.rows[0]);
  }

  async delete(id: EntityId) {
    await this.query(`DELETE FROM transactions WHERE id = $1`, [id]);
  }
}

type TransactionRow = {
  id: string;
  budgetId: string;
  userId: string;
  type: "income" | "expense";
  amount: number | string;
  currency: string;
  date: string;
  description: string;
  categoryId: string;
  subcategoryId: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    ...row,
    amount: Number(row.amount),
  };
}
