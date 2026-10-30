import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "#/server/auth";

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const headers = await getRequestHeaders();
		return auth.api.getSession({ headers });
	},
);
