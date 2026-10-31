import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { actionButtonClassName } from "#/client/component/shared/ActionButton";
import { AppLayout } from "#/client/component/shared/AppLayout";
import {
	DeckForm,
	type DeckFormValues,
} from "#/client/component/shared/DeckForm";
import { deckQueryKey, decksQueryKey } from "#/client/lib/deck";
import { errorMessage } from "#/client/lib/error-message";
import type { Deck } from "#/server/schema/deck";
import { updateDeck } from "#/server/serverFn/deck";

export function Page({ deck }: { deck: Deck }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const update = useMutation({
		mutationFn: (values: DeckFormValues) =>
			updateDeck({ data: { id: deck.id, ...values } }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: decksQueryKey });
			await queryClient.invalidateQueries({ queryKey: deckQueryKey(deck.id) });
			await navigate({ to: "/deck/$id", params: { id: String(deck.id) } });
		},
	});

	return (
		<AppLayout>
			<section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[520px]">
				<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
					Deck settings
				</p>
				<h1 className="mt-[13px] mb-[9px] text-[clamp(32px,5vw,44px)] font-semibold tracking-[-0.075em]">
					Edit deck
				</h1>
				<p className="m-0 mb-9 text-sm leading-[1.6] text-auth-muted">
					Update the name or description. Your cards stay in this deck.
				</p>
				{update.error ? (
					<p
						className="-mt-[5px] mb-[15px] text-xs leading-[1.5] text-auth-error"
						role="alert"
					>
						{errorMessage(update.error)}
					</p>
				) : null}
				<DeckForm
					defaultValues={{
						name: deck.name,
						description: deck.description ?? "",
					}}
					submitLabel="Save deck"
					onSubmit={async (values) => {
						await update.mutateAsync(values);
					}}
				/>
				<div className="mt-4 flex">
					<Link
						to="/deck/$id"
						params={{ id: String(deck.id) }}
						className={actionButtonClassName("secondary")}
					>
						Cancel
					</Link>
				</div>
			</section>
		</AppLayout>
	);
}
