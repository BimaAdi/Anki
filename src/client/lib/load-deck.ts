import { notFound } from "@tanstack/react-router";

import { getDeck } from "#/server/serverFn/deck";

export async function loadDeck(id: string) {
	const deck = await getDeck({ data: { id: Number(id) } });
	if (!deck) {
		throw notFound();
	}

	return deck;
}
