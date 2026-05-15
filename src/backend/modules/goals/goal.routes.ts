import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler";
import { validateRequest } from "../../middleware/validate-request";

import { GoalController } from "./goal.controller";
import { createGoalSchema, goalParamsSchema, goalQuerySchema, updateGoalSchema } from "./goal.schemas";

export function createGoalRouter(controller: GoalController) {
  const router = Router();

  router.get("/", validateRequest({ query: goalQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validateRequest({ params: goalParamsSchema }), asyncHandler(controller.getById));
  router.post("/", validateRequest({ body: createGoalSchema }), asyncHandler(controller.create));
  router.put("/:id", validateRequest({ params: goalParamsSchema, body: updateGoalSchema }), asyncHandler(controller.update));
  router.delete("/:id", validateRequest({ params: goalParamsSchema }), asyncHandler(controller.delete));

  return router;
}
