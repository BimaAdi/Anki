import { redirect } from "@tanstack/react-router";

import { getSession } from "#/server/auth.functions";

export async function requireSession() {
	const session = await getSession();
	if (!session) {
		throw redirect({ to: "/login" });
	}

	return session;
}
