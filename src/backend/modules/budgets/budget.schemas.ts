import { z } from "zod";

import { currencySchema, entityIdParamSchema } from "../shared.schemas";

export const budgetParamsSchema = entityIdParamSchema;
export const budgetQuerySchema = z.object({
  ownerId: z.string().min(1).optional(),
}).strict();

export const createBudgetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["personal", "shared"]),
  monthlyLimit: z.number().positive(),
  defaultCurrency: currencySchema,
  ownerId: z.string().min(1),
});

export const updateBudgetSchema = createBudgetSchema.partial();
