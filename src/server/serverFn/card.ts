import { createServerFn } from "@tanstack/react-start";
import {
	cardSchema,
	createCardSchema,
	deleteCardSchema,
	updateCardSchema,
} from "#/server/schema/card";
import * as cardService from "#/server/service/card";
import { requireUserId } from "#/server/session";

export const createCard = createServerFn({ method: "POST" })
	.validator(createCardSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const card = await cardService.createCard(userId, data.deckId, data);
		if (!card) {
			throw new Error("Deck not found");
		}

		return cardSchema.parse(card);
	});

export const updateCard = createServerFn({ method: "POST" })
	.validator(updateCardSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const card = await cardService.updateCard(userId, data.id, data);
		if (!card) {
			throw new Error("Card not found");
		}

		return cardSchema.parse(card);
	});

export const deleteCard = createServerFn({ method: "POST" })
	.validator(deleteCardSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		await cardService.deleteCard(userId, data.id);
	});
