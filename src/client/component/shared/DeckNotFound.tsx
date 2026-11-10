import { Link } from "@tanstack/react-router";

import { actionButtonClassName } from "./ActionButton";
import { PageLayout } from "./PageLayout";

export function DeckNotFound() {
	return (
		<PageLayout
			width="narrow"
			breadcrumbs={[
				{ label: "Dashboard", href: "/dashboard" },
				{ label: "Deck not found" },
			]}
			eyebrow="Deck"
			title="Deck not found"
			description="It may have been deleted, or it belongs to another account."
		>
			<div className="mt-6">
				<Link to="/dashboard" className={actionButtonClassName("primary")}>
					Back to decks
				</Link>
			</div>
		</PageLayout>
	);
}
