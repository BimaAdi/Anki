import { useState } from "react";

import { ActionButton } from "#/client/component/shared/ActionButton";
import type { Card } from "#/server/schema/card";
import { CardForm, type CardFormValues } from "./CardForm";

type CardItemProps = {
	card: Card;
	onUpdate: (values: CardFormValues) => Promise<void>;
	onDelete: () => void;
};

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
	const [editing, setEditing] = useState(false);

	if (editing) {
		return (
			<li className="rounded-xl border border-[#c9d3bc] bg-[#fffefa] p-[22px]">
				<CardForm
					defaultValues={{ front: card.front, back: card.back }}
					submitLabel="Save card"
					onSubmit={async (values) => {
						await onUpdate(values);
						setEditing(false);
					}}
					onCancel={() => setEditing(false)}
				/>
			</li>
		);
	}

	return (
		<li className="rounded-xl border border-auth-line bg-[#fffefa] p-[22px]">
			<div className="grid gap-5 sm:grid-cols-2">
				<CardSide label="Front" text={card.front} />
				<CardSide label="Back" text={card.back} />
			</div>
			<div className="mt-5 flex justify-end gap-2 border-t border-auth-line pt-4">
				<ActionButton onClick={() => setEditing(true)}>Edit</ActionButton>
				<ActionButton variant="danger" onClick={onDelete}>
					Delete
				</ActionButton>
			</div>
		</li>
	);
}

function CardSide({ label, text }: { label: string; text: string }) {
	return (
		<div className="min-w-0">
			<p className="m-0 mb-2 text-[11px] font-bold tracking-[0.12em] text-[#808c83] uppercase">
				{label}
			</p>
			<p className="m-0 text-[15px] leading-[1.6] whitespace-pre-wrap text-auth-ink [overflow-wrap:anywhere]">
				{text}
			</p>
		</div>
	);
}
