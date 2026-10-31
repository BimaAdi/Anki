import { and, eq, inArray } from "drizzle-orm";
import { db } from "#/server/db";
import { cards } from "#/server/db/schema";
import { findOwnedDeck, ownedDeckIds } from "#/server/service/deck";

export async function createCard(
	userId: string,
	deckId: number,
	input: { front: string; back: string },
) {
	const deck = await findOwnedDeck(userId, deckId);
	if (!deck) {
		return null;
	}

	const [card] = await db
		.insert(cards)
		.values({ deckId: deck.id, front: input.front, back: input.back })
		.returning();

	return card;
}

export async function updateCard(
	userId: string,
	cardId: number,
	input: { front: string; back: string },
) {
	const [card] = await db
		.update(cards)
		.set({ front: input.front, back: input.back })
		.where(
			and(eq(cards.id, cardId), inArray(cards.deckId, ownedDeckIds(userId))),
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
