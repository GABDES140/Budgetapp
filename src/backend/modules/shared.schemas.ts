import { z } from "zod";

export const entityIdParamSchema = z.object({
  id: z.string().min(1),
});

export const currencySchema = z.string().regex(/^[A-Z]{3}$/, "La devise doit respecter le format ISO a trois lettres.");
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit utiliser le format YYYY-MM-DD.");
export const themeSchema = z.enum(["light", "dark", "system"]);
