import { z } from "zod";

export const CARD_FRONT_MAX_LENGTH = 150;
export const CARD_BACK_MAX_LENGTH = 250;

export const cardFrontSchema = z
	.string()
	.trim()
	.min(1, "Front is required")
	.max(
		CARD_FRONT_MAX_LENGTH,
		`Front must be ${CARD_FRONT_MAX_LENGTH} characters or less`,
	);

export const cardBackSchema = z
	.string()
	.trim()
	.min(1, "Back is required")
	.max(
		CARD_BACK_MAX_LENGTH,
		`Back must be ${CARD_BACK_MAX_LENGTH} characters or less`,
	);

export const cardSchema = z.object({
	id: z.number().int(),
	deckId: z.number().int(),
	front: z.string(),
	back: z.string(),
});

export const createCardSchema = z.object({
	deckId: z.number().int().positive(),
	front: cardFrontSchema,
	back: cardBackSchema,
});

export const updateCardSchema = z.object({
	id: z.number().int().positive(),
	front: cardFrontSchema,
	back: cardBackSchema,
});

export const deleteCardSchema = z.object({
	id: z.number().int().positive(),
});

export type Card = z.infer<typeof cardSchema>;
