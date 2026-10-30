import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "#/client/component/shared/Button";
import { Input } from "#/client/component/shared/Input";
import { authClient } from "#/client/lib/auth-client";

import { GitHubMark } from "./GitHubMark";

export function RightSection() {
	const navigate = useNavigate();
	const [pending, setPending] = useState<"github" | null>(null);
	const [error, setError] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setError(null);

			try {
				const result = await authClient.signIn.email({
					email: value.email,
					password: value.password,
					callbackURL: "/dashboard",
				});
				if (result.error) {
					setError(
						result.error.message ??
							"We couldn't sign you in. Check your details and try again.",
					);
					return;
				}
				await navigate({ to: "/dashboard" });
			} catch {
				setError("We couldn't sign you in. Check your details and try again.");
			}
		},
	});

	async function signInWithGitHub() {
		setPending("github");
		setError(null);

		try {
			const result = await authClient.signIn.social({
				provider: "github",
				callbackURL: "/dashboard",
			});
			if (result.error) {
				setError(
					result.error.message ??
						"GitHub sign-in is unavailable. Please try again.",
				);
			}
		} catch {
			setError("GitHub sign-in is unavailable. Please try again.");
		} finally {
			setPending(null);
		}
	}

	return (
		<section
			className="grid min-h-screen place-items-center bg-auth-paper px-[clamp(32px,7vw,100px)] py-[50px] max-[900px]:px-8 max-[900px]:py-10 max-[700px]:min-h-screen max-[700px]:items-start max-[700px]:px-6 max-[700px]:pt-8 max-[700px]:pb-11"
			aria-labelledby="sign-in-title"
		>
			<div className="w-full max-w-[390px] max-[700px]:mx-auto max-[700px]:max-w-[420px]">
				<div
					className="hidden w-fit items-center gap-[11px] text-xl font-bold tracking-[-0.06em] text-auth-ink max-[700px]:mb-[62px] max-[700px]:inline-flex"
					aria-hidden="true"
				>
					<span className="grid size-8 place-items-center rounded-[10px] bg-auth-lime text-base font-extrabold tracking-[-0.08em]">
						A
					</span>
					<span>Anki</span>
				</div>
				<div className="mb-[31px]">
					<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
						Welcome back
					</p>
					<h2
						className="mt-[10px] mb-[8px] text-[32px] font-[650] tracking-[-0.065em] max-[700px]:text-[29px]"
						id="sign-in-title"
					>
						Sign in to Anki
					</h2>
					<p className="m-0 text-sm text-auth-muted">
						Choose how you’d like to continue.
					</p>
				</div>

				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button
							variant="secondary"
							type="button"
							onClick={signInWithGitHub}
							disabled={pending !== null || isSubmitting}
						>
							<GitHubMark />
							{pending === "github"
								? "Connecting to GitHub…"
								: "Continue with GitHub"}
						</Button>
					)}
				</form.Subscribe>

				<div
					className="my-[25px] grid grid-cols-[1fr_auto_1fr] items-center gap-3"
					aria-hidden="true"
				>
					<span className="h-px bg-auth-line" />
					<p className="m-0 text-[11px] text-[#91978f]">
						or sign in with email
					</p>
					<span className="h-px bg-auth-line" />
				</div>

				<form
					className="flex flex-col"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						void form.handleSubmit();
					}}
				>
					<form.Field name="email">
						{(field) => (
							<>
								<label
									className="mb-2 text-xs font-[650] text-auth-ink-soft"
									htmlFor={field.name}
								>
									Email address
								</label>
								<Input
									className="mb-[19px]"
									autoComplete="email"
									id={field.name}
									name={field.name}
									type="email"
									placeholder="you@example.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									required
								/>
							</>
						)}
					</form.Field>
					<form.Field name="password">
						{(field) => (
							<>
								<label
									className="mb-2 text-xs font-[650] text-auth-ink-soft"
									htmlFor={field.name}
								>
									Password
								</label>
								<Input
									className="mb-[19px]"
									autoComplete="current-password"
									id={field.name}
									name={field.name}
									type="password"
									placeholder="Enter your password"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
									required
								/>
							</>
						)}
					</form.Field>
					{error ? (
						<p
							className="-mt-[5px] mb-[15px] text-xs leading-[1.5] text-auth-error"
							role="alert"
						>
							{error}
						</p>
					) : null}
					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<Button
								className="mt-1"
								variant="primary"
								type="submit"
								disabled={pending !== null || isSubmitting}
							>
								{isSubmitting ? "Signing in…" : "Sign in with email"}
								<span className="text-[17px] text-auth-lime" aria-hidden="true">
									↗
								</span>
							</Button>
						)}
					</form.Subscribe>
				</form>

				<p className="mt-8 mb-0 text-center text-[10px] leading-[1.6] text-[#9a9f97]">
					By continuing, you agree to use your account responsibly.
				</p>
			</div>
		</section>
	);
}
