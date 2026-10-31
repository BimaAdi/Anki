import { useForm } from "@tanstack/react-form";

import { deckDescriptionSchema, deckNameSchema } from "#/server/schema/deck";
import { Button } from "./Button";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

export type DeckFormValues = {
	name: string;
	description: string;
};

type DeckFormProps = {
	defaultValues?: DeckFormValues;
	submitLabel: string;
	onSubmit: (values: DeckFormValues) => Promise<void>;
};

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

export function DeckForm({
	defaultValues = { name: "", description: "" },
	submitLabel,
	onSubmit,
}: DeckFormProps) {
	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			try {
				await onSubmit({
					name: value.name.trim(),
					description: value.description.trim(),
				});
			} catch {
				// handled by the page through the mutation error
			}
		},
	});

	return (
		<form
			className="flex flex-col"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
		>
			<form.Field name="name" validators={{ onChange: deckNameSchema }}>
				{(field) => (
					<div className="mb-[19px] flex flex-col">
						<label
							className="mb-2 text-xs font-[650] text-auth-ink-soft"
							htmlFor={field.name}
						>
							Name
						</label>
						<Input
							id={field.name}
							name={field.name}
							type="text"
							placeholder="e.g. Spanish verbs"
							maxLength={100}
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
			<form.Field
				name="description"
				validators={{ onChange: deckDescriptionSchema }}
			>
				{(field) => (
					<div className="mb-[19px] flex flex-col">
						<label
							className="mb-2 text-xs font-[650] text-auth-ink-soft"
							htmlFor={field.name}
						>
							Description
						</label>
						<Textarea
							id={field.name}
							name={field.name}
							placeholder="What is this deck about? (optional)"
							maxLength={500}
							rows={3}
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
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						className="mt-1"
						variant="primary"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving…" : submitLabel}
						<span className="text-[17px] text-auth-lime" aria-hidden="true">
							↗
						</span>
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
