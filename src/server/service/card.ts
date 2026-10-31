import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "#/server/db";
import { cards } from "#/server/db/schema";
import { createCardSchema, updateCardSchema } from "#/server/schema/card";
import { findOwnedDeck, ownedDeckIds } from "#/server/service/deck";
import {
	CardLimitReachedError,
	getUserLimits,
} from "#/server/service/user-limits";

export async function createCard(
	userId: string,
	deckId: number,
	input: { front: string; back: string },
) {
	const values = createCardSchema.parse({ deckId, ...input });

	const deck = await findOwnedDeck(userId, values.deckId);
	if (!deck) {
		return null;
	}

	const [limits, [cardCount]] = await Promise.all([
		getUserLimits(userId),
		db
			.select({ value: count(cards.id) })
			.from(cards)
			.where(eq(cards.deckId, deck.id)),
	]);

	if (!limits) {
		throw new Error("User not found");
	}

	if (cardCount.value >= limits.cardLimit) {
		throw new CardLimitReachedError(limits.cardLimit);
	}

	const [card] = await db
		.insert(cards)
		.values({ deckId: deck.id, front: values.front, back: values.back })
		.returning();

	return card;
}

export async function updateCard(
	userId: string,
	cardId: number,
	input: { front: string; back: string },
) {
	const values = updateCardSchema.parse({ id: cardId, ...input });

	const [card] = await db
		.update(cards)
		.set({ front: values.front, back: values.back })
		.where(
			and(eq(cards.id, values.id), inArray(cards.deckId, ownedDeckIds(userId))),
		)
		.returning();

	return card ?? null;
}

export async function deleteCard(userId: string, cardId: number) {
	await db
		.delete(cards)
		.where(
			and(eq(cards.id, cardId), inArray(cards.deckId, ownedDeckIds(userId))),
		);
}
