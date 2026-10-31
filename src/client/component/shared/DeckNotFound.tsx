import { Link } from "@tanstack/react-router";

import { actionButtonClassName } from "./ActionButton";
import { AppLayout } from "./AppLayout";

export function DeckNotFound() {
	return (
		<AppLayout>
			<section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[520px] rounded-xl border border-dashed border-[#cfd5c9] bg-[#fffefa] p-[27px]">
				<h1 className="m-0 mb-2 text-[24px] font-semibold tracking-[-0.05em]">
					Deck not found
				</h1>
				<p className="m-0 mb-5 text-[13px] leading-[1.6] text-auth-muted">
					It may have been deleted, or it belongs to another account.
				</p>
				<Link to="/dashboard" className={actionButtonClassName("primary")}>
					Back to decks
				</Link>
			</section>
		</AppLayout>
	);
}
