import type { ReactNode } from "react";

type AppLayoutProps = {
	actions?: ReactNode;
	children: ReactNode;
};

export function AppLayout({ actions, children }: AppLayoutProps) {
	return (
		<main className="min-h-screen px-[clamp(24px,6vw,84px)] py-[30px] pb-16 max-[700px]:px-5 max-[700px]:py-[22px]">
			<header className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 border-b border-auth-line pb-5">
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
				{actions}
			</header>
			{children}
		</main>
	);
}
