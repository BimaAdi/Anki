import { useId } from "react";

import { ActionButton } from "#/client/component/shared/ActionButton";
import { Input } from "#/client/component/shared/Input";
import { formatDeckCount } from "#/client/lib/deck";
import { DECK_NAME_MAX_LENGTH } from "#/server/schema/deck";

type DeckSearchProps = {
	query: string;
	resultCount: number;
	totalCount: number;
	isSearching: boolean;
	onQueryChange: (query: string) => void;
	onClear: () => void;
};

export function DeckSearch({
	query,
	resultCount,
	totalCount,
	isSearching,
	onQueryChange,
	onClear,
}: DeckSearchProps) {
	const idPrefix = useId();
	const hasQuery = query.trim().length > 0;

	return (
		<div className="mt-6 rounded-xl border border-auth-line bg-[#fffefa] p-[22px]">
			<search
				aria-label="Deck search"
				className="flex flex-col gap-3 sm:flex-row sm:items-end"
			>
				<div className="min-w-0 flex-1">
					<label
						className="mb-2 block text-xs font-[650] text-auth-ink-soft"
						htmlFor={`${idPrefix}-query`}
					>
						Search decks
					</label>
					<Input
						id={`${idPrefix}-query`}
						type="search"
						placeholder="Search deck titles…"
						value={query}
						maxLength={DECK_NAME_MAX_LENGTH}
						autoComplete="off"
						onChange={(event) => onQueryChange(event.target.value)}
					/>
				</div>
				<ActionButton
					className="h-12 shrink-0"
					onClick={onClear}
					disabled={!hasQuery}
				>
					Clear search
				</ActionButton>
			</search>
			{hasQuery ? (
				<output
					aria-live="polite"
					className="mt-4 block text-xs leading-[1.5] text-auth-muted"
				>
					{isSearching
						? "Searching…"
						: `Showing ${resultCount} of ${formatDeckCount(totalCount)}`}
				</output>
			) : null}
		</div>
	);
}
