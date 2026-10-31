import { createFileRoute } from "@tanstack/react-router";

import { Page } from "#/client/component/routes/deck.$id/Page";
import { DeckNotFound } from "#/client/component/shared/DeckNotFound";
import { loadDeck } from "#/client/lib/load-deck";
import { requireSession } from "#/client/lib/require-session";

export const Route = createFileRoute("/deck/$id")({
	beforeLoad: requireSession,
	loader: ({ params }) => loadDeck(params.id),
	notFoundComponent: DeckNotFound,
	component: DeckPage,
});

function DeckPage() {
	const initialDeck = Route.useLoaderData();

	return <Page initialDeck={initialDeck} />;
}
