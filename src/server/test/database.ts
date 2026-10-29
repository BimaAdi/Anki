import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "#/server/db/schema";

config({ path: [".env.local", ".env"] });

const migrationsFolder = fileURLToPath(
	new URL("../../../drizzle", import.meta.url),
);
const cleanupByDatabase = new WeakMap<object, () => Promise<void>>();

export async function createTestDatabase() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required to run service tests");
	}

	const databaseName = `vibe_test_${randomUUID().replaceAll("-", "")}`;
	const admin = postgres(databaseUrl, { max: 1 });
	let client: ReturnType<typeof postgres> | undefined;

	try {
		await admin.unsafe(`CREATE DATABASE "${databaseName}"`);
		const testDatabaseUrl = new URL(databaseUrl);
		testDatabaseUrl.pathname = `/${databaseName}`;
		client = postgres(testDatabaseUrl.toString(), { max: 1 });

		const db = drizzle(client, { schema });
		await migrate(db, { migrationsFolder });

		let cleaned = false;
		cleanupByDatabase.set(db, async () => {
			if (cleaned) return;
			cleaned = true;

			try {
				await client?.end();
			} finally {
				try {
					await admin.unsafe(`DROP DATABASE "${databaseName}"`);
				} finally {
					await admin.end();
				}
			}
		});

		return { db };
	} catch (error) {
		try {
			await client?.end();
		} finally {
			try {
				await admin.unsafe(`DROP DATABASE IF EXISTS "${databaseName}"`);
			} finally {
				await admin.end();
			}
		}
		throw error;
	}
}

export async function closeTestDatabase(db: object) {
	const cleanup = cleanupByDatabase.get(db);
	if (!cleanup) return;

	cleanupByDatabase.delete(db);
	await cleanup();
}
