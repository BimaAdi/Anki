import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";

import { actionButtonClassName } from "#/client/component/shared/ActionButton";
import {
	DeckForm,
	type DeckFormValues,
} from "#/client/component/shared/DeckForm";
import { PageLayout } from "#/client/component/shared/PageLayout";
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
		<PageLayout
			width="narrow"
			breadcrumbs={[
				{ label: "Dashboard", href: "/dashboard" },
				{ label: "New deck" },
			]}
			eyebrow="New deck"
			title="Create a deck"
			description="Group related cards together, then play the deck whenever you want to study."
		>
			<div className="mt-9">
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
			</div>
		</PageLayout>
	);
}
