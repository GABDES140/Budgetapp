import type { QueryResultRow } from "pg";

import { getPgPool } from "./client";

export class PostgresRepositoryBase {
  protected async query<T extends QueryResultRow>(sql: string, params: unknown[] = []) {
    return getPgPool().query<T>(sql, params);
  }
}
