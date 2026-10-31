// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "#/server/db";
import { cards, decks, user } from "#/server/db/schema";
import { closeTestDatabase } from "#/server/test/database";
import { createCard, deleteCard, updateCard } from "./card";
import { createDeck } from "./deck";

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
	await db.insert(user).values([
		{ id: "user-1", name: "User 1", email: "user-1@example.com" },
		{ id: "user-2", name: "User 2", email: "user-2@example.com" },
	]);
});

describe("createCard", () => {
	it("adds a card to the user's deck and returns it", async () => {
		const deck = await createDeck("user-1", { name: "Deck", description: "" });

		const created = await createCard("user-1", deck.id, {
			front: "hola",
			back: "hello",
		});

		expect(created).toMatchObject({
			deckId: deck.id,
			front: "hola",
			back: "hello",
		});

		const rows = await db.select().from(cards);
		expect(rows).toEqual([expect.objectContaining({ front: "hola" })]);
	});

	it("returns null and inserts nothing when the deck belongs to another user", async () => {
		const deck = await createDeck("user-2", {
			name: "Private",
			description: "",
		});

		const result = await createCard("user-1", deck.id, {
			front: "x",
			back: "y",
		});

		expect(result).toBeNull();
		await expect(db.select().from(cards)).resolves.toEqual([]);
	});

	it("stops adding cards once the deck reaches the user's card limit", async () => {
		await db.update(user).set({ cardLimit: 2 }).where(eq(user.id, "user-1"));
		const deck = await createDeck("user-1", { name: "Deck", description: "" });

		await createCard("user-1", deck.id, { front: "one", back: "1" });
		await createCard("user-1", deck.id, { front: "two", back: "2" });

		await expect(
			createCard("user-1", deck.id, { front: "three", back: "3" }),
		).rejects.toThrow("card limit of 2");

		const rows = await db.select().from(cards);
		expect(rows).toHaveLength(2);
	});

	it("allows one hundred cards per deck by default", async () => {
		const deck = await createDeck("user-1", { name: "Deck", description: "" });
		await db.insert(cards).values(
			Array.from({ length: 100 }, (_, index) => ({
				deckId: deck.id,
				front: `front ${index}`,
				back: `back ${index}`,
			})),
		);

		await expect(
			createCard("user-1", deck.id, { front: "too many", back: "x" }),
		).rejects.toThrow("card limit of 100");
	});

	it("applies the card limit to each of the user's decks", async () => {
		await db.update(user).set({ cardLimit: 1 }).where(eq(user.id, "user-1"));
		const first = await createDeck("user-1", {
			name: "First",
			description: "",
		});
		const second = await createDeck("user-1", {
			name: "Second",
			description: "",
		});

		await createCard("user-1", first.id, { front: "one", back: "1" });
		await expect(
			createCard("user-1", second.id, { front: "two", back: "2" }),
		).resolves.toMatchObject({ deckId: second.id, front: "two" });
	});
});

describe("updateCard", () => {
	it("updates the front and back of the user's card", async () => {
		const deck = await createDeck("user-1", { name: "Deck", description: "" });
		const card = await createCard("user-1", deck.id, {
			front: "old front",
			back: "old back",
		});

		const updated = await updateCard("user-1", card?.id ?? 0, {
			front: "new front",
			back: "new back",
		});

		expect(updated).toMatchObject({
			id: card?.id,
			front: "new front",
			back: "new back",
		});
	});

	it("returns null and leaves the card unchanged when it belongs to another user", async () => {
		const deck = await createDeck("user-2", {
			name: "Private",
			description: "",
		});
		const card = await createCard("user-2", deck.id, {
			front: "keep",
			back: "keep",
		});

		const result = await updateCard("user-1", card?.id ?? 0, {
			front: "hacked",
			back: "hacked",
		});

		expect(result).toBeNull();
		const [row] = await db
			.select()
			.from(cards)
			.where(eq(cards.id, card?.id ?? 0));
		expect(row.front).toBe("keep");
	});
});

describe("deleteCard", () => {
	it("deletes only the given card from the user's deck", async () => {
		const deck = await createDeck("user-1", { name: "Deck", description: "" });
		const target = await createCard("user-1", deck.id, {
			front: "target",
			back: "t",
		});
		const other = await createCard("user-1", deck.id, {
			front: "other",
			back: "o",
		});

		await deleteCard("user-1", target?.id ?? 0);

		const rows = await db.select().from(cards);
		expect(rows).toEqual([expect.objectContaining({ id: other?.id })]);
	});

	it("does not delete another user's card", async () => {
		const deck = await createDeck("user-2", {
			name: "Private",
			description: "",
		});
		const card = await createCard("user-2", deck.id, {
			front: "keep",
			back: "keep",
		});

		await deleteCard("user-1", card?.id ?? 0);

		const rows = await db.select().from(cards);
		expect(rows).toEqual([expect.objectContaining({ id: card?.id })]);
	});
});
