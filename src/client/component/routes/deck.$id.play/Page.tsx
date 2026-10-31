import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { actionButtonClassName } from "#/client/component/shared/ActionButton";
import { AppLayout } from "#/client/component/shared/AppLayout";
import { Button } from "#/client/component/shared/Button";
import { formatCardCount, pickRandomCard } from "#/client/lib/deck";
import type { DeckDetail } from "#/server/schema/deck";

export function Page({ deck }: { deck: DeckDetail }) {
	const [card, setCard] = useState(() => pickRandomCard(deck.cards));
	const [showAnswer, setShowAnswer] = useState(false);

	function nextCard() {
		setCard(pickRandomCard(deck.cards, card?.id));
		setShowAnswer(false);
	}

	return (
		<AppLayout
			actions={
				<Link
					to="/deck/$id"
					params={{ id: String(deck.id) }}
					className={actionButtonClassName("secondary")}
				>
					Back to deck
				</Link>
			}
		>
			<section className="mx-auto mt-[clamp(40px,8vh,80px)] max-w-[680px]">
				<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
					Playing
				</p>
				<h1 className="mt-[13px] mb-[9px] text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.075em] [overflow-wrap:anywhere]">
					{deck.name}
				</h1>
				<p className="m-0 text-sm text-auth-muted">
					{formatCardCount(deck.cards.length)} in this deck
				</p>

				{card ? (
					<>
						<div className="mt-8 flex min-h-[300px] flex-col rounded-xl border border-auth-line bg-[#fffefa] p-[32px] max-[700px]:p-[24px]">
							<p className="m-0 mb-4 text-[11px] font-bold tracking-[0.12em] text-[#808c83] uppercase">
								Front
							</p>
							<p className="m-0 text-[28px] leading-[1.35] font-[550] tracking-[-0.04em] whitespace-pre-wrap text-auth-ink [overflow-wrap:anywhere]">
								{card.front}
							</p>
							{showAnswer ? (
								<div className="mt-8 border-t border-auth-line pt-6">
									<p className="m-0 mb-3 text-[11px] font-bold tracking-[0.12em] text-[#808c83] uppercase">
										Back
									</p>
									<p className="m-0 text-[20px] leading-[1.5] whitespace-pre-wrap text-auth-ink-soft [overflow-wrap:anywhere]">
										{card.back}
									</p>
								</div>
							) : null}
						</div>
						<div className="mt-6">
							{showAnswer ? (
								<Button variant="primary" type="button" onClick={nextCard}>
									Next card
									<span
										className="text-[17px] text-auth-lime"
										aria-hidden="true"
									>
										↗
									</span>
								</Button>
							) : (
								<Button
									variant="primary"
									type="button"
									onClick={() => setShowAnswer(true)}
								>
									Show answer
									<span
										className="text-[17px] text-auth-lime"
										aria-hidden="true"
									>
										↗
									</span>
								</Button>
							)}
						</div>
					</>
				) : (
					<div className="mt-8 rounded-xl border border-dashed border-[#cfd5c9] bg-[#fffefa] p-[27px]">
						<h2 className="m-0 mb-2 text-[17px] tracking-[-0.035em]">
							This deck has no cards yet.
						</h2>
						<p className="m-0 mb-5 text-[13px] leading-[1.6] text-auth-muted">
							Add a few cards before you start playing.
						</p>
						<Link
							to="/deck/$id"
							params={{ id: String(deck.id) }}
							className={actionButtonClassName("primary")}
						>
							Add cards
						</Link>
					</div>
				)}
			</section>
		</AppLayout>
	);
}
