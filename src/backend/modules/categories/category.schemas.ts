import { z } from "zod";

import { entityIdParamSchema } from "../shared.schemas";

export const categoryParamsSchema = entityIdParamSchema;
export const categoryQuerySchema = z.object({
  budgetId: z.string().min(1).optional(),
}).strict();

export const createCategorySchema = z.object({
  budgetId: z.string().min(1).nullable(),
  name: z.string().min(1),
  type: z.enum(["income", "expense", "both"]),
  color: z.string().min(1),
  icon: z.string().min(1),
  isDefault: z.boolean(),
});

export const updateCategorySchema = createCategorySchema.partial();
