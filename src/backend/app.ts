import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { createApiRouter } from "./routes";

export function createBackendApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: false,
    }),
  );
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({
      message: "BudgetApp backend API",
      docs: {
        health: "/api/health",
        users: "/api/users",
        budgets: "/api/budgets",
        categories: "/api/categories",
        goals: "/api/goals",
        transactions: "/api/transactions",
      },
    });
  });

  app.use("/api", createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
