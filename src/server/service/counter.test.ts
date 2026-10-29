// @vitest-environment node
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "#/server/db";
import { counter } from "#/server/db/schema";
import { decrementCounter, getCounter, incrementCounter } from "./counter";

// Replace the real database connection with an in-memory SQLite database so
// the tests never touch the database configured through DATABASE_URL.
vi.mock("#/server/db", async () => {
	const { default: Database } = await import("better-sqlite3");
	const { drizzle } = await import("drizzle-orm/better-sqlite3");
	const schema = await import("#/server/db/schema");

	const sqlite = new Database(":memory:");
	const db = drizzle(sqlite, { schema });

	return { db };
});

const migrationsFolder = fileURLToPath(
	new URL("../../../drizzle", import.meta.url),
);

beforeAll(() => {
	migrate(db, { migrationsFolder });
});

beforeEach(async () => {
	await db.delete(counter);
});

describe("getCounter", () => {
	it("creates the counter row with a count of zero when it does not exist", async () => {
		const result = await getCounter();

		expect(result).toMatchObject({ count: 0 });

		const rows = await db.select().from(counter);
		expect(rows).toEqual([expect.objectContaining({ count: 0 })]);
	});

	it("returns the existing count", async () => {
		await db.insert(counter).values({ id: 1, count: 5 });

		await expect(getCounter()).resolves.toMatchObject({ count: 5 });
	});
});

describe("incrementCounter", () => {
	it("initializes the counter and increments it to one", async () => {
		const result = await incrementCounter();

		expect(result).toMatchObject({ count: 1 });

		const rows = await db.select().from(counter);
		expect(rows).toEqual([expect.objectContaining({ count: 1 })]);
	});

	it("increments the existing count", async () => {
		await db.insert(counter).values({ id: 1, count: 41 });

		await expect(incrementCounter()).resolves.toMatchObject({ count: 42 });
	});

	it("increments the count on every call", async () => {
		await incrementCounter();
		await incrementCounter();
		const result = await incrementCounter();

		expect(result).toMatchObject({ count: 3 });
	});
});

describe("decrementCounter", () => {
	it("initializes the counter and decrements it to minus one", async () => {
		const result = await decrementCounter();

		expect(result).toMatchObject({ count: -1 });

		const rows = await db.select().from(counter);
		expect(rows).toEqual([expect.objectContaining({ count: -1 })]);
	});

	it("decrements the existing count", async () => {
		await db.insert(counter).values({ id: 1, count: 43 });

		await expect(decrementCounter()).resolves.toMatchObject({ count: 42 });
	});

	it("decrements the count on every call", async () => {
		await db.insert(counter).values({ id: 1, count: 3 });

		await decrementCounter();
		await decrementCounter();
		const result = await decrementCounter();

		expect(result).toMatchObject({ count: 0 });
	});
});
