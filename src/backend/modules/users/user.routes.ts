import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler";
import { validateRequest } from "../../middleware/validate-request";

import { UserController } from "./user.controller";
import { createUserSchema, updateUserSchema, userParamsSchema, userQuerySchema } from "./user.schemas";

export function createUserRouter(controller: UserController) {
  const router = Router();

  router.get("/", validateRequest({ query: userQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validateRequest({ params: userParamsSchema }), asyncHandler(controller.getById));
  router.post("/", validateRequest({ body: createUserSchema }), asyncHandler(controller.create));
  router.put("/:id", validateRequest({ params: userParamsSchema, body: updateUserSchema }), asyncHandler(controller.update));
  router.delete("/:id", validateRequest({ params: userParamsSchema }), asyncHandler(controller.delete));

  return router;
}
