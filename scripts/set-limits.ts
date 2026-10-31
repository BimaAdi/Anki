import { eq } from "drizzle-orm";
import { z } from "zod";

export interface SetLimitsOptions {
	email?: string;
	deckLimit?: string;
	cardLimit?: string;
}

const limitSchema = z.coerce.number().int().min(0).max(1_000_000);

function parseLimit(value: string | undefined, option: string) {
	if (value === undefined) {
		return undefined;
	}

	const result = limitSchema.safeParse(value);
	if (!result.success) {
		console.error(`${option} must be a whole number between 0 and 1000000.`);
		process.exitCode = 1;
		return null;
	}

	return result.data;
}

export async function setLimits(options: SetLimitsOptions) {
	const emailResult = z.email().safeParse(options.email);
	if (!emailResult.success) {
		console.error("A valid --email is required.");
		process.exitCode = 1;
		return;
	}
	const email = emailResult.data.toLowerCase();

	const deckLimit = parseLimit(options.deckLimit, "--deck-limit");
	const cardLimit = parseLimit(options.cardLimit, "--card-limit");
	if (deckLimit === null || cardLimit === null) {
		return;
	}

	if (deckLimit === undefined && cardLimit === undefined) {
		console.error("Provide --deck-limit, --card-limit, or both.");
		process.exitCode = 1;
		return;
	}

	const updates: { deckLimit?: number; cardLimit?: number } = {};
	if (deckLimit !== undefined) {
		updates.deckLimit = deckLimit;
	}
	if (cardLimit !== undefined) {
		updates.cardLimit = cardLimit;
	}

	try {
		const { client, db } = await import("../src/server/db/index.ts");
		try {
			const { user } = await import("../src/server/db/schema.ts");
			const [updated] = await db
				.update(user)
				.set({ ...updates, updatedAt: new Date() })
				.where(eq(user.email, email))
				.returning({ deckLimit: user.deckLimit, cardLimit: user.cardLimit });

			if (!updated) {
				console.error(`No account found for ${email}.`);
				process.exitCode = 1;
				return;
			}

			console.log(
				`Updated limits for ${email}: ${updated.deckLimit} decks, ${updated.cardLimit} cards per deck.`,
			);
		} finally {
			await client.end();
		}
	} catch (error) {
		console.error(
			error instanceof Error ? error.message : "Could not update limits.",
		);
		process.exitCode = 1;
	}
}
