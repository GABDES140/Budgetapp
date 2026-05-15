import type { EntityId, User } from "../../../types";

import { PostgresRepositoryBase } from "../../repositories/postgres/base";

export class UserPostgresRepository extends PostgresRepositoryBase {
  async findAll(filters: { email?: string }) {
    const params: unknown[] = [];
    const whereClause = filters.email ? `WHERE LOWER(email) = LOWER($1)` : "";

    if (filters.email) {
      params.push(filters.email);
    }

    const result = await this.query<UserRow>(
      `
        SELECT
          id,
          name,
          email,
          password_hash AS "passwordHash",
          default_currency AS "defaultCurrency",
          theme,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
      `,
      params,
    );

    return result.rows;
  }

  async findById(id: EntityId) {
    const result = await this.query<UserRow>(
      `
        SELECT
          id,
          name,
          email,
          password_hash AS "passwordHash",
          default_currency AS "defaultCurrency",
          theme,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM users
        WHERE id = $1
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async create(input: Omit<User, "id" | "createdAt" | "updatedAt">) {
    const result = await this.query<UserRow>(
      `
        INSERT INTO users (
          id, name, email, password_hash, default_currency, theme, created_at, updated_at
        )
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING
          id,
          name,
          email,
          password_hash AS "passwordHash",
          default_currency AS "defaultCurrency",
          theme,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [input.name, input.email, input.passwordHash, input.defaultCurrency, input.theme],
    );

    return result.rows[0];
  }

  async update(id: EntityId, input: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>) {
    const current = await this.findById(id);

    if (!current) {
      throw new Error("Utilisateur introuvable");
    }

    const next = { ...current, ...input };
    const result = await this.query<UserRow>(
      `
        UPDATE users
        SET
          name = $2,
          email = $3,
          password_hash = $4,
          default_currency = $5,
          theme = $6,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          email,
          password_hash AS "passwordHash",
          default_currency AS "defaultCurrency",
          theme,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [id, next.name, next.email, next.passwordHash, next.defaultCurrency, next.theme],
    );

    return result.rows[0];
  }

  async delete(id: EntityId) {
    await this.query(`DELETE FROM users WHERE id = $1`, [id]);
  }
}

type UserRow = User;
