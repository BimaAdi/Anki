import { z } from "zod";
import { cardSchema } from "#/server/schema/card";

export const DECK_NAME_MAX_LENGTH = 50;
export const DECK_DESCRIPTION_MAX_LENGTH = 100;

export const deckNameSchema = z
	.string()
	.trim()
	.min(1, "Name is required")
	.max(
		DECK_NAME_MAX_LENGTH,
		`Name must be ${DECK_NAME_MAX_LENGTH} characters or less`,
	);

export const deckDescriptionSchema = z
	.string()
	.trim()
	.max(
		DECK_DESCRIPTION_MAX_LENGTH,
		`Description must be ${DECK_DESCRIPTION_MAX_LENGTH} characters or less`,
	);

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
