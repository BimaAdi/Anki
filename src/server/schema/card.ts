import { z } from "zod";

export const cardSideSchema = z
	.string()
	.trim()
	.min(1, "This side is required")
	.max(2000, "Must be 2000 characters or less");

export const cardSchema = z.object({
	id: z.number().int(),
	deckId: z.number().int(),
	front: z.string(),
	back: z.string(),
});

export const createCardSchema = z.object({
	deckId: z.number().int().positive(),
	front: cardSideSchema,
	back: cardSideSchema,
});

export const updateCardSchema = z.object({
	id: z.number().int().positive(),
	front: cardSideSchema,
	back: cardSideSchema,
});

export const deleteCardSchema = z.object({
	id: z.number().int().positive(),
});

export type Card = z.infer<typeof cardSchema>;
