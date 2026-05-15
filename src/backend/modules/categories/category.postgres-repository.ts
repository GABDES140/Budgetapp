import type { Category, CreateCategoryInput, EntityId, UpdateCategoryInput } from "../../../types";

import { PostgresRepositoryBase } from "../../repositories/postgres/base";

export class CategoryPostgresRepository extends PostgresRepositoryBase {
  async findAll(filters: { budgetId?: EntityId }) {
    const params: unknown[] = [];
    const whereClause = filters.budgetId ? `WHERE budget_id IS NULL OR budget_id = $1` : "";

    if (filters.budgetId) {
      params.push(filters.budgetId);
    }

    const result = await this.query<CategoryRow>(
      `
        SELECT
          id,
          budget_id AS "budgetId",
          name,
          type,
          color,
          icon,
          is_default AS "isDefault",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM categories
        ${whereClause}
        ORDER BY name ASC
      `,
      params,
    );

    return result.rows;
  }

  async findById(id: EntityId) {
    const result = await this.query<CategoryRow>(
      `
        SELECT
          id,
          budget_id AS "budgetId",
          name,
          type,
          color,
          icon,
          is_default AS "isDefault",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM categories
        WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async create(input: CreateCategoryInput) {
    const result = await this.query<CategoryRow>(
      `
        INSERT INTO categories (
          id, budget_id, name, type, color, icon, is_default, created_at, updated_at
        )
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING
          id,
          budget_id AS "budgetId",
          name,
          type,
          color,
          icon,
          is_default AS "isDefault",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [input.budgetId, input.name, input.type, input.color, input.icon, input.isDefault],
    );

    return result.rows[0];
  }

  async update(id: EntityId, input: UpdateCategoryInput) {
    const current = await this.findById(id);

    if (!current) {
      throw new Error("Categorie introuvable");
    }

    const next = { ...current, ...input };
    const result = await this.query<CategoryRow>(
      `
        UPDATE categories
        SET
          budget_id = $2,
          name = $3,
          type = $4,
          color = $5,
          icon = $6,
          is_default = $7,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          budget_id AS "budgetId",
          name,
          type,
          color,
          icon,
          is_default AS "isDefault",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [id, next.budgetId, next.name, next.type, next.color, next.icon, next.isDefault],
    );

    return result.rows[0];
  }

  async delete(id: EntityId) {
    await this.query(`DELETE FROM categories WHERE id = $1`, [id]);
  }
}

type CategoryRow = Category;
