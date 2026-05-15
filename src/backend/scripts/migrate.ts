import { closePgPool } from "../repositories/postgres/client";
import { runMigrations } from "../repositories/postgres/migration-runner";

async function main() {
  await runMigrations();
  console.log("Migrations PostgreSQL appliquees.");
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePgPool();
  });
