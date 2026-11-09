import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import {
	ActionButton,
	actionButtonClassName,
} from "#/client/component/shared/ActionButton";
import { AppLayout } from "#/client/component/shared/AppLayout";
import { Breadcrumbs } from "#/client/component/shared/Breadcrumbs";
import {
	type CardSearchScope,
	cardSearchQueryKey,
} from "#/client/lib/card-search";
import {
	deckQueryKey,
	decksQueryKey,
	formatCardCount,
} from "#/client/lib/deck";
import { errorMessage } from "#/client/lib/error-message";
import { useDebouncedValue } from "#/client/lib/use-debounced-value";
import type { DeckDetail } from "#/server/schema/deck";
import {
	createCard,
	deleteCard,
	searchCards,
	updateCard,
} from "#/server/serverFn/card";
import { deleteDeck, getDeck } from "#/server/serverFn/deck";

import { CardForm, type CardFormValues } from "./CardForm";
import { CardItem } from "./CardItem";
import { CardSearch } from "./CardSearch";

export function Page({ initialDeck }: { initialDeck: DeckDetail }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const deckId = initialDeck.id;

	const { data: deck } = useQuery({
		queryKey: deckQueryKey(deckId),
		queryFn: async () => {
			const result = await getDeck({ data: { id: deckId } });
			if (!result) {
				throw new Error("Deck not found");
			}

			return result;
		},
		initialData: initialDeck,
	});

	const cardsNewestFirst = [...deck.cards].sort((a, b) => b.id - a.id);
	const atCardLimit = deck.cards.length >= deck.cardLimit;

	const [searchQuery, setSearchQuery] = useState("");
	const [searchScope, setSearchScope] = useState<CardSearchScope>("both");
	const trimmedQuery = searchQuery.trim();
	const debouncedQuery = useDebouncedValue(trimmedQuery);
	const searchActive = trimmedQuery.length > 0;
	const { data: searchResults = [], isFetching: isSearchFetching } = useQuery({
		queryKey: cardSearchQueryKey(deckId, debouncedQuery, searchScope),
		queryFn: () =>
			searchCards({
				data: { deckId, query: debouncedQuery, scope: searchScope },
			}),
		enabled: debouncedQuery.length > 0,
		placeholderData: keepPreviousData,
	});
	const isSearching =
		searchActive && (trimmedQuery !== debouncedQuery || isSearchFetching);
	const displayedCards = searchActive
		? [...searchResults].sort((a, b) => b.id - a.id)
		: cardsNewestFirst;
	const highlightQuery = searchActive ? debouncedQuery : "";

	function refreshDeck() {
		void queryClient.invalidateQueries({ queryKey: deckQueryKey(deckId) });
		void queryClient.invalidateQueries({ queryKey: decksQueryKey });
	}

	const [addFormKey, setAddFormKey] = useState(0);

	const addCard = useMutation({
		mutationFn: (values: CardFormValues) =>
			createCard({ data: { deckId, ...values } }),
		onSuccess: refreshDeck,
	});

	const editCard = useMutation({
		mutationFn: (variables: CardFormValues & { id: number }) =>
			updateCard({ data: variables }),
		onSuccess: refreshDeck,
	});

	const removeCard = useMutation({
		mutationFn: (id: number) => deleteCard({ data: { id } }),
		onSuccess: refreshDeck,
	});

	const removeDeck = useMutation({
		mutationFn: () => deleteDeck({ data: { id: deckId } }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: decksQueryKey });
			await navigate({ to: "/dashboard" });
		},
	});

	const error =
		addCard.error ?? editCard.error ?? removeCard.error ?? removeDeck.error;

	function resetErrors() {
		addCard.reset();
		editCard.reset();
		removeCard.reset();
		removeDeck.reset();
	}

	function handleDeleteDeck() {
		if (
			!window.confirm(
				`Delete "${deck.name}" and all of its cards? This cannot be undone.`,
			)
		) {
			return;
		}

		resetErrors();
		removeDeck.mutate();
	}

	return (
		<AppLayout>
			<section className="mx-auto mt-[clamp(40px,8vh,80px)] max-w-[760px]">
				<Breadcrumbs
					items={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: deck.name },
					]}
				/>
				<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
					Deck
				</p>
				<h1 className="mt-[13px] mb-[9px] text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.075em] [overflow-wrap:anywhere]">
					{deck.name}
				</h1>
				{deck.description ? (
					<p className="m-0 text-sm leading-[1.6] whitespace-pre-wrap text-auth-muted">
						{deck.description}
					</p>
				) : null}
				<div className="mt-6 flex flex-wrap gap-2">
					<Link
						to="/deck/$id/play"
						params={{ id: String(deck.id) }}
						className={actionButtonClassName("primary")}
					>
						Play deck
					</Link>
					<Link
						to="/deck/$id/edit"
						params={{ id: String(deck.id) }}
						className={actionButtonClassName("secondary")}
					>
						Edit deck
					</Link>
					<ActionButton
						variant="danger"
						onClick={handleDeleteDeck}
						disabled={removeDeck.isPending}
					>
						{removeDeck.isPending ? "Deleting…" : "Delete deck"}
					</ActionButton>
				</div>
				{error ? (
					<p
						className="mt-4 mb-0 text-xs leading-[1.5] text-auth-error"
						role="alert"
					>
						{errorMessage(error)}
					</p>
				) : null}
			</section>

			<section
				aria-labelledby="cards-title"
				className="mx-auto mt-12 max-w-[760px]"
			>
				<div className="flex items-baseline justify-between border-b border-auth-line pb-3">
					<h2
						className="m-0 text-[17px] font-semibold tracking-[-0.035em]"
						id="cards-title"
					>
						Cards
					</h2>
					<div className="flex items-baseline gap-2">
						<span className="text-xs font-semibold text-auth-muted">
							{formatCardCount(deck.cards.length)}
						</span>
						<span className="text-xs text-auth-muted">
							Limit {deck.cardLimit}
						</span>
					</div>
				</div>

				{atCardLimit ? (
					<output className="mt-6 block rounded-xl border border-auth-line bg-[#fffefa] p-[22px]">
						<span className="mb-2 block text-[15px] font-semibold tracking-[-0.03em]">
							Card limit reached
						</span>
						<span className="block text-[13px] leading-[1.6] text-auth-muted">
							This deck has reached its card limit of {deck.cardLimit}. Delete a
							card to add another one.
						</span>
					</output>
				) : (
					<div className="mt-6 rounded-xl border border-auth-line bg-[#fffefa] p-[22px]">
						<h3 className="m-0 mb-4 text-[15px] font-semibold tracking-[-0.03em]">
							Add a card
						</h3>
						<CardForm
							key={addFormKey}
							submitLabel="Add card"
							onSubmit={async (values) => {
								resetErrors();
								await addCard.mutateAsync(values);
								setAddFormKey((key) => key + 1);
							}}
						/>
					</div>
				)}

				<CardSearch
					query={searchQuery}
					scope={searchScope}
					resultCount={searchResults.length}
					totalCount={deck.cards.length}
					isSearching={isSearching}
					onQueryChange={setSearchQuery}
					onScopeChange={setSearchScope}
					onClear={() => setSearchQuery("")}
				/>

				{deck.cards.length === 0 ? (
					<p className="mt-6 text-sm text-auth-muted">
						No cards yet. Add your first card above.
					</p>
				) : searchActive && isSearching && displayedCards.length === 0 ? (
					<p className="mt-6 text-sm text-auth-muted">Searching cards…</p>
				) : displayedCards.length === 0 ? (
					<p className="mt-6 text-sm text-auth-muted">
						No cards match your search.
					</p>
				) : (
					<ul className="mt-6 flex flex-col gap-3">
						{displayedCards.map((card) => (
							<CardItem
								key={card.id}
								card={card}
								searchQuery={highlightQuery}
								searchScope={searchScope}
								onUpdate={async (values) => {
									resetErrors();
									await editCard.mutateAsync({ id: card.id, ...values });
								}}
								onDelete={() => {
									resetErrors();
									removeCard.mutate(card.id);
								}}
							/>
						))}
					</ul>
				)}
			</section>
		</AppLayout>
	);
}
