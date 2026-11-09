import { useId } from "react";

import { ActionButton } from "#/client/component/shared/ActionButton";
import { Input } from "#/client/component/shared/Input";
import {
	type CardSearchScope,
	cardSearchScopes,
} from "#/client/lib/card-search";
import { formatCardCount } from "#/client/lib/deck";
import { CARD_FRONT_MAX_LENGTH } from "#/server/schema/card";

type CardSearchProps = {
	query: string;
	scope: CardSearchScope;
	resultCount: number;
	totalCount: number;
	isSearching: boolean;
	onQueryChange: (query: string) => void;
	onScopeChange: (scope: CardSearchScope) => void;
	onClear: () => void;
};

const selectClassName =
	"h-12 w-full rounded-[7px] border border-[#dfe2d9] bg-[#fffefa] px-[14px] text-[13px] text-auth-ink outline-none transition-[border-color,box-shadow] duration-150 focus:border-[#758c66] focus:shadow-[0_0_0_3px_rgb(117_140_102_/_13%)] sm:w-[150px]";

export function CardSearch({
	query,
	scope,
	resultCount,
	totalCount,
	isSearching,
	onQueryChange,
	onScopeChange,
	onClear,
}: CardSearchProps) {
	const idPrefix = useId();
	const hasQuery = query.trim().length > 0;

	return (
		<div className="mt-6 rounded-xl border border-auth-line bg-[#fffefa] p-[22px]">
			<search
				aria-label="Card search"
				className="flex flex-col gap-3 sm:flex-row sm:items-end"
			>
				<div className="min-w-0 flex-1">
					<label
						className="mb-2 block text-xs font-[650] text-auth-ink-soft"
						htmlFor={`${idPrefix}-query`}
					>
						Search cards
					</label>
					<Input
						id={`${idPrefix}-query`}
						type="search"
						placeholder="Search cards…"
						value={query}
						maxLength={CARD_FRONT_MAX_LENGTH}
						autoComplete="off"
						onChange={(event) => onQueryChange(event.target.value)}
					/>
				</div>
				<div>
					<label
						className="mb-2 block text-xs font-[650] text-auth-ink-soft"
						htmlFor={`${idPrefix}-scope`}
					>
						Search in
					</label>
					<select
						id={`${idPrefix}-scope`}
						className={selectClassName}
						value={scope}
						onChange={(event) =>
							onScopeChange(event.target.value as CardSearchScope)
						}
					>
						{cardSearchScopes.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
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
						: `Showing ${resultCount} of ${formatCardCount(totalCount)}`}
				</output>
			) : null}
		</div>
	);
}
