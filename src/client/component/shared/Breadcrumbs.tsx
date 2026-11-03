import { Link } from "@tanstack/react-router";

export type BreadcrumbItem = {
	label: string;
	href?: "/dashboard";
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
	return (
		<nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-auth-muted">
			<ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
				<li aria-hidden="true" className="text-[#a0a69d]">
					/
				</li>
				{items.map((item, index) => {
					const isCurrentPage = index === items.length - 1;

					return (
						<li className="flex min-w-0 items-center gap-2" key={item.label}>
							{index > 0 ? (
								<span aria-hidden="true" className="text-[#a0a69d]">
									/
								</span>
							) : null}
							{isCurrentPage || !item.href ? (
								<span
									aria-current={isCurrentPage ? "page" : undefined}
									className="truncate font-semibold text-auth-ink-soft"
								>
									{item.label}
								</span>
							) : (
								<Link
									to={item.href}
									className="truncate text-auth-muted underline-offset-4 hover:text-auth-ink hover:underline"
								>
									{item.label}
								</Link>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
