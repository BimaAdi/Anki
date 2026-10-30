import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "#/client/lib/auth-client";

interface DashboardPageProps {
	user: {
		name: string;
		email: string;
		image?: string | null;
	};
}

export function DashboardPage({ user }: DashboardPageProps) {
	const navigate = useNavigate();
	const [signingOut, setSigningOut] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function signOut() {
		setSigningOut(true);
		setError(null);
		try {
			const result = await authClient.signOut();
			if (result.error) {
				setError(
					result.error.message ?? "We couldn't sign you out. Please try again.",
				);
				return;
			}
			await navigate({ to: "/login" });
		} catch {
			setError("We couldn't sign you out. Please try again.");
		} finally {
			setSigningOut(false);
		}
	}

	return (
		<main className="min-h-screen px-[clamp(24px,6vw,84px)] py-[30px] max-[700px]:px-5 max-[700px]:py-[22px]">
			<header className="mx-auto flex max-w-[1120px] items-center justify-between border-b border-auth-line pb-5">
				<a
					className="inline-flex w-fit items-center gap-[11px] text-xl font-bold tracking-[-0.06em] text-auth-ink no-underline"
					href="/"
					aria-label="Anki home"
				>
					<span
						className="grid size-8 place-items-center rounded-[10px] bg-auth-lime text-base font-extrabold tracking-[-0.08em] text-auth-ink"
						aria-hidden="true"
					>
						A
					</span>
					<span>Anki</span>
				</a>
				<button
					className="cursor-pointer rounded-[7px] border border-auth-line bg-transparent px-[13px] py-[9px] text-xs font-semibold text-auth-ink-soft hover:border-[#bdc4b9] disabled:cursor-wait disabled:opacity-70"
					type="button"
					onClick={signOut}
					disabled={signingOut}
				>
					{signingOut ? "Signing out…" : "Sign out"}
				</button>
			</header>
			{error ? (
				<p
					className="-mt-[5px] mb-[15px] text-xs leading-[1.5] text-auth-error"
					role="alert"
				>
					{error}
				</p>
			) : null}
			<section className="mx-auto mt-[clamp(70px,13vh,140px)] max-w-[760px] max-[700px]:mt-[76px]">
				<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
					Your study space
				</p>
				<h1 className="mt-[13px] mb-[9px] text-[clamp(36px,6vw,58px)] font-semibold tracking-[-0.075em]">
					Welcome, {user.name}.
				</h1>
				<p className="m-0 text-sm text-auth-muted">Signed in as {user.email}</p>
				<div className="mt-[52px] flex items-start gap-5 rounded-xl border border-auth-line bg-[#fffefa] p-[27px] max-[700px]:mt-9 max-[700px]:gap-[14px] max-[700px]:p-[21px]">
					<span
						className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef4db] text-xl text-[#4b633c]"
						aria-hidden="true"
					>
						✳
					</span>
					<div>
						<h2 className="mt-[3px] mb-2 text-[17px] tracking-[-0.035em]">
							Your next session starts here.
						</h2>
						<p className="m-0 text-[13px] leading-[1.6] text-auth-muted">
							Your account is ready. Keep showing up, one small step at a time.
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
