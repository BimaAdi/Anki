// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "#/server/db";
import { cards, decks, user } from "#/server/db/schema";
import { closeTestDatabase } from "#/server/test/database";
import { createDeck, deleteDeck, getDeck, listDecks, updateDeck } from "./deck";

vi.mock("#/server/db", async () => {
	const { createTestDatabase } = await import("#/server/test/database");
	return createTestDatabase();
});

afterAll(async () => {
	await closeTestDatabase(db);
});

async function insertUser(id: string) {
	await db.insert(user).values({
		id,
		name: `User ${id}`,
		email: `${id}@example.com`,
	});
}

beforeEach(async () => {
	await db.delete(cards);
	await db.delete(decks);
	await db.delete(user);
	await insertUser("user-1");
	await insertUser("user-2");
});

describe("createDeck", () => {
	it("inserts a deck owned by the user and returns it", async () => {
		const created = await createDeck("user-1", {
			name: "Spanish",
			description: "Basic verbs",
		});

		expect(created).toMatchObject({
			name: "Spanish",
			description: "Basic verbs",
			userId: "user-1",
		});
		expect(created.id).toBeGreaterThan(0);
	});

	it("stores a blank description as null", async () => {
		const created = await createDeck("user-1", {
			name: "Math",
			description: "",
		});

		expect(created.description).toBeNull();
	});
});

describe("listDecks", () => {
	it("returns an empty array when the user has no decks", async () => {
		await expect(listDecks("user-1")).resolves.toEqual([]);
	});

	it("returns only the user's decks with their card counts", async () => {
		const first = await createDeck("user-1", {
			name: "First",
			description: "",
		});
		const second = await createDeck("user-1", {
			name: "Second",
			description: "",
		});
		await createDeck("user-2", { name: "Other user", description: "" });
		await db.insert(cards).values([
			{ deckId: first.id, front: "a", back: "b" },
			{ deckId: first.id, front: "c", back: "d" },
		]);

		const rows = await listDecks("user-1");

		expect(rows).toEqual([
			expect.objectContaining({ id: first.id, name: "First", cardCount: 2 }),
			expect.objectContaining({ id: second.id, name: "Second", cardCount: 0 }),
		]);
	});
});

describe("getDeck", () => {
	it("returns the deck with its cards ordered by id", async () => {
		const deck = await createDeck("user-1", { name: "Deck", description: "" });
		await db.insert(cards).values([
			{ deckId: deck.id, front: "first", back: "1" },
			{ deckId: deck.id, front: "second", back: "2" },
		]);

		const result = await getDeck("user-1", deck.id);

		expect(result).toMatchObject({ id: deck.id, name: "Deck" });
		expect(result?.cards.map((card) => card.front)).toEqual([
			"first",
			"second",
		]);
	});

	it("returns null when the deck belongs to another user", async () => {
		const deck = await createDeck("user-2", {
			name: "Private",
			description: "",
		});

		await expect(getDeck("user-1", deck.id)).resolves.toBeNull();
	});

	it("returns null when the deck does not exist", async () => {
		await expect(getDeck("user-1", 999_999)).resolves.toBeNull();
	});
});

describe("updateDeck", () => {
	it("updates the name and description", async () => {
		const deck = await createDeck("user-1", { name: "Old", description: "" });

		const updated = await updateDeck("user-1", deck.id, {
			name: "New",
			description: "Updated",
		});

		expect(updated).toMatchObject({
			id: deck.id,
			name: "New",
			description: "Updated",
		});
	});

	it("returns null and leaves the deck unchanged when it belongs to another user", async () => {
		const deck = await createDeck("user-2", { name: "Keep", description: "" });

		const result = await updateDeck("user-1", deck.id, {
			name: "Hacked",
			description: "",
		});

		expect(result).toBeNull();
		const [row] = await db.select().from(decks).where(eq(decks.id, deck.id));
		expect(row.name).toBe("Keep");
	});
});

describe("deleteDeck", () => {
	it("deletes the deck and its cards", async () => {
		const deck = await createDeck("user-1", {
			name: "Delete me",
			description: "",
		});
		await db.insert(cards).values({ deckId: deck.id, front: "f", back: "b" });

		await deleteDeck("user-1", deck.id);

		await expect(db.select().from(decks)).resolves.toEqual([]);
		await expect(db.select().from(cards)).resolves.toEqual([]);
	});

	it("does not delete another user's deck", async () => {
		const deck = await createDeck("user-2", { name: "Keep", description: "" });

		await deleteDeck("user-1", deck.id);

		const rows = await db.select().from(decks);
		expect(rows).toEqual([expect.objectContaining({ id: deck.id })]);
	});
});
