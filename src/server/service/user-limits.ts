import { eq } from "drizzle-orm";
import { db } from "#/server/db";
import { user } from "#/server/db/schema";

export const DEFAULT_DECK_LIMIT = 10;
export const DEFAULT_CARD_LIMIT = 100;

export async function getUserLimits(userId: string) {
	const [limits] = await db
		.select({ deckLimit: user.deckLimit, cardLimit: user.cardLimit })
		.from(user)
		.where(eq(user.id, userId));

	return limits;
}

export class DeckLimitReachedError extends Error {
	constructor(readonly limit: number) {
		super(`You have reached your deck limit of ${limit}.`);
		this.name = "DeckLimitReachedError";
	}
}

export class CardLimitReachedError extends Error {
	constructor(readonly limit: number) {
		super(`This deck has reached its card limit of ${limit}.`);
		this.name = "CardLimitReachedError";
	}
}
