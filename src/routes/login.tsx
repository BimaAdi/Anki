import { createFileRoute, redirect } from "@tanstack/react-router";

import { Page } from "#/client/component/routes/login/Page";
import { getSession } from "#/server/auth.functions";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const session = await getSession();
		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: Page,
});
