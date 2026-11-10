import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { actionButtonClassName } from "#/client/component/shared/ActionButton";
import {
	DeckForm,
	type DeckFormValues,
} from "#/client/component/shared/DeckForm";
import { PageLayout } from "#/client/component/shared/PageLayout";
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
		<PageLayout
			width="narrow"
			breadcrumbs={[
				{ label: "Dashboard", href: "/dashboard" },
				{ label: deck.name },
				{ label: "Edit deck" },
			]}
			eyebrow="Deck settings"
			title="Edit deck"
			description="Update the name or description. Your cards stay in this deck."
		>
			<div className="mt-9">
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
			</div>
		</PageLayout>
	);
}
