import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { actionButtonClassName } from "#/client/component/shared/ActionButton";
import { AppLayout } from "#/client/component/shared/AppLayout";
import {
	DeckForm,
	type DeckFormValues,
} from "#/client/component/shared/DeckForm";
import { decksQueryKey } from "#/client/lib/deck";
import { errorMessage } from "#/client/lib/error-message";
import { createDeck } from "#/server/serverFn/deck";

export function Page() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const create = useMutation({
		mutationFn: (values: DeckFormValues) => createDeck({ data: values }),
		onSuccess: async (deck) => {
			await queryClient.invalidateQueries({ queryKey: decksQueryKey });
			await navigate({ to: "/deck/$id", params: { id: String(deck.id) } });
		},
	});

	return (
		<AppLayout>
			<section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[520px]">
				<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
					New deck
				</p>
				<h1 className="mt-[13px] mb-[9px] text-[clamp(32px,5vw,44px)] font-semibold tracking-[-0.075em]">
					Create a deck
				</h1>
				<p className="m-0 mb-9 text-sm leading-[1.6] text-auth-muted">
					Group related cards together, then play the deck whenever you want to
					study.
				</p>
				{create.error ? (
					<p
						className="-mt-[5px] mb-[15px] text-xs leading-[1.5] text-auth-error"
						role="alert"
					>
						{errorMessage(create.error)}
					</p>
				) : null}
				<DeckForm
					submitLabel="Create deck"
					onSubmit={async (values) => {
						await create.mutateAsync(values);
					}}
				/>
				<div className="mt-4 flex">
					<Link to="/dashboard" className={actionButtonClassName("secondary")}>
						Cancel
					</Link>
				</div>
			</section>
		</AppLayout>
	);
}
