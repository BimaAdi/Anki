import { z } from "zod";

export const userLimitsSchema = z.object({
	deckLimit: z.number().int().nonnegative(),
	cardLimit: z.number().int().nonnegative(),
});

export type UserLimits = z.infer<typeof userLimitsSchema>;
