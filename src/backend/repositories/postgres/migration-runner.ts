import { promises as fs } from "node:fs";
import path from "node:path";

import { getPgPool } from "./client";

export async function runMigrations() {
  const pool = getPgPool();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDirectory = path.join(process.cwd(), "database", "migrations");
    const files = (await fs.readdir(migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();
    const appliedVersions = await client.query<{ version: string }>("SELECT version FROM schema_migrations");
    const appliedSet = new Set(appliedVersions.rows.map((row: { version: string }) => row.version));

    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDirectory, file), "utf-8");

      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      await client.query("COMMIT");
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
