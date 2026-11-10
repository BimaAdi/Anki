import type { CardSearchScope } from "#/server/schema/card";

export type { CardSearchScope };

export const cardSearchScopes: Array<{
	value: CardSearchScope;
	label: string;
}> = [
	{ value: "both", label: "Both sides" },
	{ value: "front", label: "Front only" },
	{ value: "back", label: "Back only" },
];

export function cardSearchQueryKey(
	deckId: number,
	query: string,
	scope: CardSearchScope,
) {
	return ["deck", deckId, "cards", "search", query, scope] as const;
}

export type HighlightPart = {
	text: string;
	match: boolean;
	start: number;
};

function normalizeSearchText(text: string) {
	return text.trim().toLowerCase();
}

export function highlightParts(text: string, query: string): HighlightPart[] {
	const normalizedQuery = normalizeSearchText(query);

	if (!normalizedQuery) {
		return [{ text, match: false, start: 0 }];
	}

	const normalizedText = text.toLowerCase();
	const parts: HighlightPart[] = [];
	let cursor = 0;
	let matchIndex = normalizedText.indexOf(normalizedQuery, cursor);

	while (matchIndex !== -1) {
		if (matchIndex > cursor) {
			parts.push({
				text: text.slice(cursor, matchIndex),
				match: false,
				start: cursor,
			});
		}

		parts.push({
			text: text.slice(matchIndex, matchIndex + normalizedQuery.length),
			match: true,
			start: matchIndex,
		});
		cursor = matchIndex + normalizedQuery.length;
		matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
	}

	if (cursor < text.length) {
		parts.push({ text: text.slice(cursor), match: false, start: cursor });
	}

	return parts;
}
