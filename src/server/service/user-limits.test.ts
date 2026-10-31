// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "#/server/db";
import { cards, decks, user } from "#/server/db/schema";
import { closeTestDatabase } from "#/server/test/database";
import {
	DEFAULT_CARD_LIMIT,
	DEFAULT_DECK_LIMIT,
	getUserLimits,
} from "./user-limits";

vi.mock("#/server/db", async () => {
	const { createTestDatabase } = await import("#/server/test/database");
	return createTestDatabase();
});

afterAll(async () => {
	await closeTestDatabase(db);
});

beforeEach(async () => {
	await db.delete(cards);
	await db.delete(decks);
	await db.delete(user);
	await db.insert(user).values({
		id: "user-1",
		name: "User 1",
		email: "user-1@example.com",
	});
});

describe("getUserLimits", () => {
	it("returns the default deck and card limits for a new user", async () => {
		await expect(getUserLimits("user-1")).resolves.toEqual({
			deckLimit: DEFAULT_DECK_LIMIT,
			cardLimit: DEFAULT_CARD_LIMIT,
		});
	});

	it("returns the limits stored for the user", async () => {
		await db
			.update(user)
			.set({ deckLimit: 4, cardLimit: 25 })
			.where(eq(user.id, "user-1"));

		await expect(getUserLimits("user-1")).resolves.toEqual({
			deckLimit: 4,
			cardLimit: 25,
		});
	});

	it("returns undefined when the user does not exist", async () => {
		await expect(getUserLimits("missing-user")).resolves.toBeUndefined();
	});
});
