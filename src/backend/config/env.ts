export function getBackendPort() {
  const rawPort = Number(process.env.BUDGETAPP_API_PORT ?? "4000");
  return Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 4000;
}

export function getRepositoryMode() {
  return process.env.BUDGETAPP_REPOSITORY_MODE === "postgres" ? "postgres" : "file";
}

export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? "";
}

export function getDatabaseSslEnabled() {
  return process.env.DATABASE_SSL === "true";
}
