import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "#/server/auth";

export async function requireUserId() {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!session) {
		throw new Error("You need to sign in to continue.");
	}

	return session.user.id;
}
