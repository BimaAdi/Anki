import { createFileRoute, redirect } from "@tanstack/react-router";

import { DashboardPage } from "#/client/component/routes/dashboard/Page";
import { getSession } from "#/server/auth.functions";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}

		return { user: session.user };
	},
	component: Dashboard,
});

function Dashboard() {
	const { user } = Route.useRouteContext();
	return <DashboardPage user={user} />;
}
