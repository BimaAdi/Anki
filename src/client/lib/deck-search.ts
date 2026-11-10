export function deckSearchQueryKey(query: string) {
	return ["decks", "search", query] as const;
}
