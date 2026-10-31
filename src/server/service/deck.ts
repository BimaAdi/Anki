import { and, asc, count, eq } from "drizzle-orm";
import { db } from "#/server/db";
import { cards, decks } from "#/server/db/schema";
import { createDeckSchema } from "#/server/schema/deck";
import {
	DeckLimitReachedError,
	getUserLimits,
} from "#/server/service/user-limits";

export function ownedDeckIds(userId: string) {
	return db
		.select({ id: decks.id })
		.from(decks)
		.where(eq(decks.userId, userId));
}

export async function findOwnedDeck(userId: string, deckId: number) {
	const [deck] = await db
		.select()
		.from(decks)
		.where(and(eq(decks.id, deckId), eq(decks.userId, userId)));

	return deck;
}

export async function listDecks(userId: string) {
	return db
		.select({
			id: decks.id,
			name: decks.name,
			description: decks.description,
			cardCount: count(cards.id),
		})
		.from(decks)
		.leftJoin(cards, eq(cards.deckId, decks.id))
		.where(eq(decks.userId, userId))
		.groupBy(decks.id)
		.orderBy(asc(decks.id));
}

export async function getDeck(userId: string, deckId: number) {
	const deck = await findOwnedDeck(userId, deckId);
	if (!deck) {
		return null;
	}

	const [limits, deckCards] = await Promise.all([
		getUserLimits(userId),
		db
			.select()
			.from(cards)
			.where(eq(cards.deckId, deck.id))
			.orderBy(asc(cards.id)),
	]);

	if (!limits) {
		return null;
	}

	return { ...deck, cardLimit: limits.cardLimit, cards: deckCards };
}

export async function createDeck(
	userId: string,
	input: { name: string; description: string },
) {
	const values = createDeckSchema.parse(input);

	const [limits, [deckCount]] = await Promise.all([
		getUserLimits(userId),
		db
			.select({ value: count(decks.id) })
			.from(decks)
			.where(eq(decks.userId, userId)),
	]);

	if (!limits) {
		throw new Error("User not found");
	}

	if (deckCount.value >= limits.deckLimit) {
		throw new DeckLimitReachedError(limits.deckLimit);
	}

	const [deck] = await db
		.insert(decks)
		.values({
			userId,
			name: values.name,
			description: values.description || null,
		})
		.returning();

	return deck;
}

export async function updateDeck(
	userId: string,
	deckId: number,
	input: { name: string; description: string },
) {
	const values = createDeckSchema.parse(input);

	const [deck] = await db
		.update(decks)
		.set({
			name: values.name,
			description: values.description || null,
		})
		.where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
		.returning();

	return deck ?? null;
}

export async function deleteDeck(userId: string, deckId: number) {
	await db
		.delete(decks)
		.where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
}
