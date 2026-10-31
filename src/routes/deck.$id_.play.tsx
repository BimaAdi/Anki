import { createFileRoute } from "@tanstack/react-router";

import { Page } from "#/client/component/routes/deck.$id.play/Page";
import { DeckNotFound } from "#/client/component/shared/DeckNotFound";
import { loadDeck } from "#/client/lib/load-deck";
import { requireSession } from "#/client/lib/require-session";

export const Route = createFileRoute("/deck/$id_/play")({
	beforeLoad: requireSession,
	loader: ({ params }) => loadDeck(params.id),
	notFoundComponent: DeckNotFound,
	component: PlayDeckPage,
});

function PlayDeckPage() {
	const deck = Route.useLoaderData();

	return <Page deck={deck} />;
}
