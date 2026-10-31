import { z } from "zod";
import { cardSchema } from "#/server/schema/card";

export const deckNameSchema = z
	.string()
	.trim()
	.min(1, "Name is required")
	.max(100, "Name must be 100 characters or less");

export const deckDescriptionSchema = z
	.string()
	.trim()
	.max(500, "Description must be 500 characters or less");

export const deckSchema = z.object({
	id: z.number().int(),
	name: z.string(),
	description: z.string().nullable(),
});

export const deckSummarySchema = deckSchema.extend({
	cardCount: z.number().int(),
});

export const deckDetailSchema = deckSchema.extend({
	cardLimit: z.number().int().nonnegative(),
	cards: z.array(cardSchema),
});

export const deckIdSchema = z.object({
	id: z.number().int().positive(),
});

export const createDeckSchema = z.object({
	name: deckNameSchema,
	description: deckDescriptionSchema,
});

export const updateDeckSchema = createDeckSchema.extend({
	id: z.number().int().positive(),
});

export type Deck = z.infer<typeof deckSchema>;
export type DeckSummary = z.infer<typeof deckSummarySchema>;
export type DeckDetail = z.infer<typeof deckDetailSchema>;
