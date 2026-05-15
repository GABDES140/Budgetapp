import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler";
import { validateRequest } from "../../middleware/validate-request";

import { BudgetController } from "./budget.controller";
import { budgetParamsSchema, budgetQuerySchema, createBudgetSchema, updateBudgetSchema } from "./budget.schemas";

export function createBudgetRouter(controller: BudgetController) {
  const router = Router();

  router.get("/", validateRequest({ query: budgetQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validateRequest({ params: budgetParamsSchema }), asyncHandler(controller.getById));
  router.post("/", validateRequest({ body: createBudgetSchema }), asyncHandler(controller.create));
  router.put("/:id", validateRequest({ params: budgetParamsSchema, body: updateBudgetSchema }), asyncHandler(controller.update));
  router.delete("/:id", validateRequest({ params: budgetParamsSchema }), asyncHandler(controller.delete));

  return router;
}
