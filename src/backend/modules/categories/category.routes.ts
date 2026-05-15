import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler";
import { validateRequest } from "../../middleware/validate-request";

import {
  categoryParamsSchema,
  categoryQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from "./category.schemas";
import { CategoryController } from "./category.controller";

export function createCategoryRouter(controller: CategoryController) {
  const router = Router();

  router.get("/", validateRequest({ query: categoryQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validateRequest({ params: categoryParamsSchema }), asyncHandler(controller.getById));
  router.post("/", validateRequest({ body: createCategorySchema }), asyncHandler(controller.create));
  router.put(
    "/:id",
    validateRequest({ params: categoryParamsSchema, body: updateCategorySchema }),
    asyncHandler(controller.update),
  );
  router.delete("/:id", validateRequest({ params: categoryParamsSchema }), asyncHandler(controller.delete));

  return router;
}
