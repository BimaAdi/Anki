import { useForm } from "@tanstack/react-form";
import { useId } from "react";

import { ActionButton } from "#/client/component/shared/ActionButton";
import { Button } from "#/client/component/shared/Button";
import { Textarea } from "#/client/component/shared/Textarea";
import { cardSideSchema } from "#/server/schema/card";

export type CardFormValues = {
	front: string;
	back: string;
};

type CardFormProps = {
	defaultValues?: CardFormValues;
	submitLabel: string;
	onSubmit: (values: CardFormValues) => Promise<void>;
	onCancel?: () => void;
};

const sides = [
	{ name: "front", label: "Front", placeholder: "Question or prompt" },
	{ name: "back", label: "Back", placeholder: "Answer" },
] as const;

function fieldErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return error;
	}

	if (
		typeof error === "object" &&
		error !== null &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}

	return "Invalid value";
}

export function CardForm({
	defaultValues = { front: "", back: "" },
	submitLabel,
	onSubmit,
	onCancel,
}: CardFormProps) {
	const idPrefix = useId();
	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			try {
				await onSubmit({
					front: value.front.trim(),
					back: value.back.trim(),
				});
			} catch {
				// handled by the page through the mutation error
			}
		},
	});

	return (
		<form
			className="flex flex-col gap-[14px]"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			{sides.map((side) => (
				<form.Field
					key={side.name}
					name={side.name}
					validators={{ onChange: cardSideSchema }}
				>
					{(field) => (
						<div className="flex flex-col">
							<label
								className="mb-2 text-xs font-[650] text-auth-ink-soft"
								htmlFor={`${idPrefix}-${field.name}`}
							>
								{side.label}
							</label>
							<Textarea
								id={`${idPrefix}-${field.name}`}
								name={field.name}
								placeholder={side.placeholder}
								maxLength={2000}
								rows={2}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
							/>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<p className="mt-2 text-xs leading-[1.5] text-auth-error">
										{field.state.meta.errors.map(fieldErrorMessage).join(", ")}
									</p>
								)}
						</div>
					)}
				</form.Field>
			))}
			<div className="flex flex-col gap-2">
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button variant="primary" type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving…" : submitLabel}
							<span className="text-[17px] text-auth-lime" aria-hidden="true">
								↗
							</span>
						</Button>
					)}
				</form.Subscribe>
				{onCancel ? (
					<ActionButton className="self-end" onClick={onCancel}>
						Cancel
					</ActionButton>
				) : null}
			</div>
		</form>
	);
}
