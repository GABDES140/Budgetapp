import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler";
import { validateRequest } from "../../middleware/validate-request";

import {
  createTransactionSchema,
  transactionParamsSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from "./transaction.schemas";
import { TransactionController } from "./transaction.controller";

export function createTransactionRouter(controller: TransactionController) {
  const router = Router();

  router.get("/", validateRequest({ query: transactionQuerySchema }), asyncHandler(controller.list));
  router.get("/:id", validateRequest({ params: transactionParamsSchema }), asyncHandler(controller.getById));
  router.post("/", validateRequest({ body: createTransactionSchema }), asyncHandler(controller.create));
  router.put(
    "/:id",
    validateRequest({ params: transactionParamsSchema, body: updateTransactionSchema }),
    asyncHandler(controller.update),
  );
  router.delete("/:id", validateRequest({ params: transactionParamsSchema }), asyncHandler(controller.delete));

  return router;
}
