import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "#/client/component/routes/dashboard/Page";
import { requireSession } from "#/client/lib/require-session";
import { listDecks } from "#/server/serverFn/deck";
import { getMyLimits } from "#/server/serverFn/user";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const session = await requireSession();
		return { user: session.user };
	},
	loader: async () => {
		const [decks, limits] = await Promise.all([listDecks(), getMyLimits()]);
		return { decks, limits };
	},
	component: Dashboard,
});

function Dashboard() {
	const { user } = Route.useRouteContext();
	const { decks, limits } = Route.useLoaderData();

	return <DashboardPage user={user} initialDecks={decks} limits={limits} />;
}
