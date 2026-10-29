import { eq, sql } from "drizzle-orm";
import { db } from "#/server/db";
import { counter } from "#/server/db/schema";

const COUNTER_ID = 1;

async function ensureCounter() {
	const [existing] = await db
		.select()
		.from(counter)
		.where(eq(counter.id, COUNTER_ID));

	if (existing) {
		return existing;
	}

	const [created] = await db
		.insert(counter)
		.values({ id: COUNTER_ID, count: 0 })
		.returning();

	return created;
}

export async function getCounter() {
	return ensureCounter();
}

export async function incrementCounter() {
	await ensureCounter();

	const [updated] = await db
		.update(counter)
		.set({ count: sql`${counter.count} + 1` })
		.where(eq(counter.id, COUNTER_ID))
		.returning();

	return updated;
}

export async function decrementCounter() {
	await ensureCounter();

	const [updated] = await db
		.update(counter)
		.set({ count: sql`${counter.count} - 1` })
		.where(eq(counter.id, COUNTER_ID))
		.returning();

	return updated;
}
