import { z } from "zod";
import { promptForPassword } from "./prompt-password.ts";

export interface CreateUserOptions {
	email?: string;
	name?: string;
	password?: string;
}

export async function createUser(options: CreateUserOptions) {
	const emailResult = z.email().safeParse(options.email);
	const name = options.name?.trim();
	if (!emailResult.success || !name) {
		console.error("Both a valid --email and a non-empty --name are required.");
		process.exitCode = 1;
		return;
	}

	let password: string;
	try {
		password = options.password ?? (await promptForPassword("Password"));
	} catch (error) {
		console.error(
			error instanceof Error ? error.message : "Could not read password.",
		);
		process.exitCode = 1;
		return;
	}

	if (password.length < 8 || password.length > 128) {
		console.error("Password must be between 8 and 128 characters.");
		process.exitCode = 1;
		return;
	}

	try {
		const { client } = await import("../src/server/db/index.ts");
		try {
			const { auth } = await import("../src/server/auth.ts");
			await auth.api.createUser({
				body: {
					email: emailResult.data,
					name,
					password,
					role: "user",
				},
			});
			console.log(`Created email sign-in account for ${emailResult.data}.`);
		} catch (error) {
			console.error(
				error instanceof Error ? error.message : "Could not create user.",
			);
			process.exitCode = 1;
		} finally {
			await client.end();
		}
	} catch (error) {
		console.error(
			error instanceof Error
				? error.message
				: "Could not connect to the database.",
		);
		process.exitCode = 1;
	}
}
