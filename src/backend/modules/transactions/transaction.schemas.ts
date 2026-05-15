import { z } from "zod";

import { currencySchema, entityIdParamSchema, isoDateSchema } from "../shared.schemas";

export const transactionParamsSchema = entityIdParamSchema;

export const transactionQuerySchema = z.object({
  budgetId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
}).strict();

export const createTransactionSchema = z.object({
  budgetId: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  currency: currencySchema,
  date: isoDateSchema,
  description: z.string().min(1),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1).nullable(),
  notes: z.string().nullable(),
  isRecurring: z.boolean(),
  recurringRuleId: z.string().min(1).nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();
