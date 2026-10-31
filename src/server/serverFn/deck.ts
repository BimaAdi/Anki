import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	createDeckSchema,
	deckDetailSchema,
	deckIdSchema,
	deckSchema,
	deckSummarySchema,
	updateDeckSchema,
} from "#/server/schema/deck";
import * as deckService from "#/server/service/deck";
import { requireUserId } from "#/server/session";

export const listDecks = createServerFn({ method: "GET" }).handler(async () => {
	const userId = await requireUserId();
	return z.array(deckSummarySchema).parse(await deckService.listDecks(userId));
});

export const getDeck = createServerFn({ method: "GET" })
	.validator(deckIdSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const deck = await deckService.getDeck(userId, data.id);
		return deck ? deckDetailSchema.parse(deck) : null;
	});

export const createDeck = createServerFn({ method: "POST" })
	.validator(createDeckSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		return deckSchema.parse(await deckService.createDeck(userId, data));
	});

export const updateDeck = createServerFn({ method: "POST" })
	.validator(updateDeckSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const deck = await deckService.updateDeck(userId, data.id, data);
		if (!deck) {
			throw new Error("Deck not found");
		}

		return deckSchema.parse(deck);
	});

export const deleteDeck = createServerFn({ method: "POST" })
	.validator(deckIdSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		await deckService.deleteDeck(userId, data.id);
	});
