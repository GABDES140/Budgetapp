import { closePgPool } from "../repositories/postgres/client";
import { runMigrations } from "../repositories/postgres/migration-runner";
import { runSeed } from "../repositories/postgres/seed-runner";

async function main() {
  await runMigrations();
  await runSeed();
  console.log("Seed PostgreSQL applique.");
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePgPool();
  });
