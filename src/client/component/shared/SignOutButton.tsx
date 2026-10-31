import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "#/client/lib/auth-client";

export function SignOutButton() {
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
		<>
			{error ? (
				<p className="m-0 text-xs leading-[1.5] text-auth-error" role="alert">
					{error}
				</p>
			) : null}
			<button
				className="cursor-pointer rounded-[7px] border border-auth-line bg-transparent px-[13px] py-[9px] text-xs font-semibold text-auth-ink-soft hover:border-[#bdc4b9] disabled:cursor-wait disabled:opacity-70"
				type="button"
				onClick={signOut}
				disabled={signingOut}
			>
				{signingOut ? "Signing out…" : "Sign out"}
			</button>
		</>
	);
}
