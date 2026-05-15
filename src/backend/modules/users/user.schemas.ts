import { z } from "zod";

import { currencySchema, entityIdParamSchema, themeSchema } from "../shared.schemas";

export const userParamsSchema = entityIdParamSchema;
export const userQuerySchema = z.object({
  email: z.string().email().optional(),
}).strict();

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  passwordHash: z.string().min(1),
  defaultCurrency: currencySchema,
  theme: themeSchema,
});

export const updateUserSchema = createUserSchema.partial();
