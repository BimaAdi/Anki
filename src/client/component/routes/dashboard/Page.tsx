import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { actionButtonClassName } from "#/client/component/shared/ActionButton";
import { AppLayout } from "#/client/component/shared/AppLayout";
import { decksQueryKey, formatCardCount } from "#/client/lib/deck";
import type { DeckSummary } from "#/server/schema/deck";
import { listDecks } from "#/server/serverFn/deck";

interface DashboardPageProps {
	user: {
		name: string;
		email: string;
		image?: string | null;
	};
	initialDecks: DeckSummary[];
}

export function DashboardPage({ user, initialDecks }: DashboardPageProps) {
	const { data: decks } = useQuery({
		queryKey: decksQueryKey,
		queryFn: () => listDecks(),
		initialData: initialDecks,
	});

	return (
		<AppLayout>
			<section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[760px]">
				<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
					Your study space
				</p>
				<h1 className="mt-[13px] mb-[9px] text-[clamp(36px,6vw,58px)] font-semibold tracking-[-0.075em]">
					Welcome, {user.name}.
				</h1>
				<p className="m-0 text-sm text-auth-muted">Signed in as {user.email}</p>
			</section>

			<section
				aria-labelledby="decks-title"
				className="mx-auto mt-[clamp(40px,7vh,72px)] max-w-[1120px]"
			>
				<div className="flex items-end justify-between gap-4 border-b border-auth-line pb-3">
					<h2
						className="m-0 text-[17px] font-semibold tracking-[-0.035em]"
						id="decks-title"
					>
						Your decks
					</h2>
					<Link to="/deck/create" className={actionButtonClassName("primary")}>
						New deck
					</Link>
				</div>

				{decks.length === 0 ? (
					<div className="mt-6 rounded-xl border border-dashed border-[#cfd5c9] bg-[#fffefa] p-[27px]">
						<h3 className="m-0 mb-2 text-[17px] tracking-[-0.035em]">
							No decks yet.
						</h3>
						<p className="m-0 text-[13px] leading-[1.6] text-auth-muted">
							Create your first deck, add some cards, then play it whenever you
							want to study.
						</p>
					</div>
				) : (
					<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{decks.map((deck) => (
							<li
								key={deck.id}
								className="flex flex-col justify-between gap-5 rounded-xl border border-auth-line bg-[#fffefa] p-[22px]"
							>
								<div className="min-w-0">
									<Link
										to="/deck/$id"
										params={{ id: String(deck.id) }}
										className="text-[17px] font-semibold tracking-[-0.035em] text-auth-ink no-underline hover:underline [overflow-wrap:anywhere]"
									>
										{deck.name}
									</Link>
									{deck.description ? (
										<p className="m-0 mt-2 line-clamp-2 text-[13px] leading-[1.6] text-auth-muted">
											{deck.description}
										</p>
									) : null}
								</div>
								<div className="flex items-center justify-between gap-3">
									<span className="text-xs font-semibold text-auth-muted">
										{formatCardCount(deck.cardCount)}
									</span>
									<div className="flex items-center gap-2">
										<Link
											to="/deck/$id"
											params={{ id: String(deck.id) }}
											className={actionButtonClassName("secondary")}
										>
											Edit
										</Link>
										<Link
											to="/deck/$id/play"
											params={{ id: String(deck.id) }}
											className={actionButtonClassName("primary")}
										>
											Play
										</Link>
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</AppLayout>
	);
}
