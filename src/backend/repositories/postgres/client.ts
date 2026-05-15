import { Pool } from "pg";

import { getDatabaseSslEnabled, getDatabaseUrl } from "../../config/env";

let pool: Pool | null = null;

export function getPgPool() {
  if (pool) {
    return pool;
  }

  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error("DATABASE_URL est requis pour utiliser PostgreSQL.");
  }

  pool = new Pool({
    connectionString,
    ssl: getDatabaseSslEnabled() ? { rejectUnauthorized: false } : false,
  });

  return pool;
}

export async function closePgPool() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = null;
}
