import type { ReactNode } from "react";

import { AppLayout } from "./AppLayout";
import { type BreadcrumbItem, Breadcrumbs } from "./Breadcrumbs";

type PageLayoutProps = {
	breadcrumbs: BreadcrumbItem[];
	eyebrow: string;
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	width?: "wide" | "narrow";
	children: ReactNode;
};

export function PageLayout({
	breadcrumbs,
	eyebrow,
	title,
	description,
	actions,
	width = "wide",
	children,
}: PageLayoutProps) {
	const content = (
		<>
			<header className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="m-0 text-[11px] leading-[1.5] font-bold tracking-[0.16em] text-[#808c83] uppercase">
						{eyebrow}
					</p>
					<h1 className="mt-[13px] mb-[9px] text-[clamp(32px,5vw,48px)] font-semibold tracking-[-0.075em] [overflow-wrap:anywhere]">
						{title}
					</h1>
					{description ? (
						<p className="m-0 text-sm leading-[1.6] whitespace-pre-wrap text-auth-muted">
							{description}
						</p>
					) : null}
				</div>
				{actions ? (
					<div className="flex flex-wrap items-center gap-2">{actions}</div>
				) : null}
			</header>
			{children}
		</>
	);

	return (
		<AppLayout>
			<section className="mx-auto mt-[clamp(48px,9vh,96px)] max-w-[760px]">
				<Breadcrumbs items={breadcrumbs} />
				{width === "narrow" ? (
					<div className="mx-auto max-w-[520px]">{content}</div>
				) : (
					content
				)}
			</section>
		</AppLayout>
	);
}
