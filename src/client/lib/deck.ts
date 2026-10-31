export const decksQueryKey = ["decks"] as const;

export function deckQueryKey(deckId: number) {
	return ["deck", deckId] as const;
}

export function formatCardCount(count: number) {
	return `${count} ${count === 1 ? "card" : "cards"}`;
}

const cardTextSizes = [
	{ maxLength: 12, fontSize: 64 },
	{ maxLength: 30, fontSize: 48 },
	{ maxLength: 60, fontSize: 36 },
	{ maxLength: 120, fontSize: 28 },
	{ maxLength: 200, fontSize: 22 },
];
const smallestCardTextSize = 18;

export function getCardTextSize(text: string) {
	const length = Array.from(text).length;

	return (
		cardTextSizes.find((size) => length <= size.maxLength)?.fontSize ??
		smallestCardTextSize
	);
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
