export const decksQueryKey = ["decks"] as const;

export function deckQueryKey(deckId: number) {
	return ["deck", deckId] as const;
}

export function formatCardCount(count: number) {
	return `${count} ${count === 1 ? "card" : "cards"}`;
}

export function pickRandomCard<T extends { id: number }>(
	cards: T[],
	previousId?: number,
): T | null {
	if (cards.length === 0) {
		return null;
	}

	const candidates =
		cards.length > 1 ? cards.filter((card) => card.id !== previousId) : cards;

	return candidates[Math.floor(Math.random() * candidates.length)];
}
