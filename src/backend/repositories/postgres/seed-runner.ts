import type { PoolClient } from "pg";

import {
  mockBudgetMembers,
  mockBudgets,
  mockCategories,
  mockFinancialIndicatorPreferences,
  mockGoals,
  mockSubcategories,
  mockTransactions,
  mockUsers,
  mockWidgetConfigs,
} from "../../../data/mock-data";

import { getPgPool } from "./client";

export async function runSeed() {
  const pool = getPgPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`
      TRUNCATE TABLE
        widget_configs,
        financial_indicator_preferences,
        goals,
        transactions,
        subcategories,
        categories,
        budget_members,
        budgets,
        users
      RESTART IDENTITY CASCADE
    `);

    for (const user of mockUsers) {
      await insertUser(client, user);
    }

    for (const budget of mockBudgets) {
      await insertBudget(client, budget);
    }

    for (const member of mockBudgetMembers) {
      await client.query(
        `INSERT INTO budget_members (id, budget_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [member.id, member.budgetId, member.userId, member.role, member.joinedAt],
      );
    }

    for (const category of mockCategories) {
      await client.query(
        `INSERT INTO categories (id, budget_id, name, type, color, icon, is_default, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          category.id,
          category.budgetId,
          category.name,
          category.type,
          category.color,
          category.icon,
          category.isDefault,
          category.createdAt,
          category.updatedAt,
        ],
      );
    }

    for (const subcategory of mockSubcategories) {
      await client.query(
        `INSERT INTO subcategories (id, category_id, name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          subcategory.id,
          subcategory.categoryId,
          subcategory.name,
          subcategory.createdAt,
          subcategory.updatedAt,
        ],
      );
    }

    for (const transaction of mockTransactions) {
      await client.query(
        `INSERT INTO transactions (
          id, budget_id, user_id, type, amount, currency, date, description, category_id,
          subcategory_id, notes, is_recurring, recurring_rule_id, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15
        )`,
        [
          transaction.id,
          transaction.budgetId,
          transaction.userId,
          transaction.type,
          transaction.amount,
          transaction.currency,
          transaction.date,
          transaction.description,
          transaction.categoryId,
          transaction.subcategoryId,
          transaction.notes,
          transaction.isRecurring,
          transaction.recurringRuleId,
          transaction.createdAt,
          transaction.updatedAt,
        ],
      );
    }

    for (const goal of mockGoals) {
      await client.query(
        `INSERT INTO goals (
          id, budget_id, name, description, target_amount, current_amount, currency, target_date, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )`,
        [
          goal.id,
          goal.budgetId,
          goal.name,
          goal.description,
          goal.targetAmount,
          goal.currentAmount,
          goal.currency,
          goal.targetDate,
          goal.status,
          goal.createdAt,
          goal.updatedAt,
        ],
      );
    }

    for (const widget of mockWidgetConfigs) {
      await client.query(
        `INSERT INTO widget_configs (
          id, user_id, budget_id, widget_key, is_enabled, position, config, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9
        )`,
        [
          widget.id,
          widget.userId,
          widget.budgetId,
          widget.widgetKey,
          widget.isEnabled,
          widget.position,
          JSON.stringify(widget.config),
          widget.createdAt,
          widget.updatedAt,
        ],
      );
    }

    for (const preference of mockFinancialIndicatorPreferences) {
      await client.query(
        `INSERT INTO financial_indicator_preferences (
          id, user_id, budget_id, indicator_key, is_enabled, config, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6::jsonb, $7, $8
        )`,
        [
          preference.id,
          preference.userId,
          preference.budgetId,
          preference.indicatorKey,
          preference.isEnabled,
          JSON.stringify(preference.config),
          preference.createdAt,
          preference.updatedAt,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertUser(client: PoolClient, user: (typeof mockUsers)[number]) {
  await client.query(
    `INSERT INTO users (id, name, email, password_hash, default_currency, theme, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash,
      user.defaultCurrency,
      user.theme,
      user.createdAt,
      user.updatedAt,
    ],
  );
}

async function insertBudget(client: PoolClient, budget: (typeof mockBudgets)[number]) {
  await client.query(
    `INSERT INTO budgets (id, name, type, monthly_limit, default_currency, owner_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      budget.id,
      budget.name,
      budget.type,
      budget.monthlyLimit,
      budget.defaultCurrency,
      budget.ownerId,
      budget.createdAt,
      budget.updatedAt,
    ],
  );
}
