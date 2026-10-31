import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "#/client/component/routes/dashboard/Page";
import { requireSession } from "#/client/lib/require-session";
import { listDecks } from "#/server/serverFn/deck";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const session = await requireSession();
		return { user: session.user };
	},
	loader: () => listDecks(),
	component: Dashboard,
});

function Dashboard() {
	const { user } = Route.useRouteContext();
	const initialDecks = Route.useLoaderData();

	return <DashboardPage user={user} initialDecks={initialDecks} />;
}
