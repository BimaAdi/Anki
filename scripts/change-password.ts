import { z } from "zod";
import { promptForPassword } from "./prompt-password.ts";

export interface ChangePasswordOptions {
	email?: string;
	password?: string;
}

export async function changePassword(options: ChangePasswordOptions) {
	const emailResult = z.email().safeParse(options.email);
	if (!emailResult.success) {
		console.error("A valid --email is required.");
		process.exitCode = 1;
		return;
	}

	let password: string;
	try {
		password = options.password ?? (await promptForPassword("New password"));
	} catch (error) {
		console.error(
			error instanceof Error ? error.message : "Could not read password.",
		);
		process.exitCode = 1;
		return;
	}

	try {
		const { client } = await import("../src/server/db/index.ts");
		try {
			const { auth } = await import("../src/server/auth.ts");
			const context = await auth.$context;
			const { minPasswordLength, maxPasswordLength } = context.password.config;
			if (
				password.length < minPasswordLength ||
				password.length > maxPasswordLength
			) {
				console.error(
					`Password must be between ${minPasswordLength} and ${maxPasswordLength} characters.`,
				);
				process.exitCode = 1;
				return;
			}

			const result = await context.internalAdapter.findUserByEmail(
				emailResult.data,
			);
			if (!result) {
				console.error(`No account found for ${emailResult.data}.`);
				process.exitCode = 1;
				return;
			}

			const passwordHash = await context.password.hash(password);
			if (await context.internalAdapter.findCredentialAccount(result.user.id)) {
				await context.internalAdapter.updatePassword(
					result.user.id,
					passwordHash,
				);
			} else {
				await context.internalAdapter.createAccount({
					userId: result.user.id,
					providerId: "credential",
					accountId: result.user.id,
					password: passwordHash,
				});
			}
			console.log(`Updated password for ${emailResult.data}.`);
		} catch (error) {
			console.error(
				error instanceof Error ? error.message : "Could not update password.",
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
