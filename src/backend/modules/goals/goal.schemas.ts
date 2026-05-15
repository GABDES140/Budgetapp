import { z } from "zod";

import { currencySchema, entityIdParamSchema, isoDateSchema } from "../shared.schemas";

export const goalParamsSchema = entityIdParamSchema;
export const goalQuerySchema = z.object({
  budgetId: z.string().min(1).optional(),
}).strict();

export const createGoalSchema = z.object({
  budgetId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0),
  currency: currencySchema,
  targetDate: isoDateSchema.nullable(),
  status: z.enum(["active", "completed", "archived"]),
});

export const updateGoalSchema = createGoalSchema.partial();
