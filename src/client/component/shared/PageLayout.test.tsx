// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const { createElement } = await import("react");
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		Link: ({
			to,
			children,
			className,
		}: {
			to: string;
			children?: ReactNode;
			className?: string;
		}) => createElement("a", { href: to, className }, children),
		useNavigate: () => vi.fn(),
	};
});

vi.mock("#/client/lib/auth-client", () => ({
	authClient: { signOut: vi.fn() },
}));

import { PageLayout } from "./PageLayout";

describe("page layout", () => {
	afterEach(cleanup);

	it("keeps the breadcrumb at the top of the shared page frame", () => {
		render(
			<PageLayout
				breadcrumbs={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Spanish" },
				]}
				eyebrow="Deck"
				title="Spanish"
				description="Basic verbs"
			>
				<p>Body</p>
			</PageLayout>,
		);

		const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
		const section = breadcrumb.parentElement as HTMLElement;

		expect(section.firstElementChild).toBe(breadcrumb);
		expect(section.classList.contains("mt-[clamp(48px,9vh,96px)]")).toBe(true);
		expect(section.classList.contains("max-w-[760px]")).toBe(true);
		expect(
			within(breadcrumb)
				.getByRole("link", { name: "Dashboard" })
				.getAttribute("href"),
		).toBe("/dashboard");
		expect(screen.getByText("Deck")).toBeTruthy();
		expect(
			screen.getByRole("heading", { name: "Spanish", level: 1 }),
		).toBeTruthy();
		expect(screen.getByText("Basic verbs")).toBeTruthy();
		expect(screen.getByText("Body")).toBeTruthy();
	});

	it("centers narrow content inside the same page frame", () => {
		render(
			<PageLayout
				width="narrow"
				breadcrumbs={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Edit deck" },
				]}
				eyebrow="Deck settings"
				title="Edit deck"
			>
				<p>Form</p>
			</PageLayout>,
		);

		const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
		const section = breadcrumb.parentElement as HTMLElement;
		const narrow = screen.getByText("Form").parentElement as HTMLElement;

		expect(section.classList.contains("max-w-[760px]")).toBe(true);
		expect(narrow.classList.contains("max-w-[520px]")).toBe(true);
		expect(narrow.classList.contains("mx-auto")).toBe(true);
	});

	it("renders actions next to the page title", () => {
		render(
			<PageLayout
				breadcrumbs={[{ label: "Dashboard" }]}
				eyebrow="Your study space"
				title="Dashboard"
				actions={<button type="button">New deck</button>}
			>
				<p>Body</p>
			</PageLayout>,
		);

		const heading = screen.getByRole("heading", { name: "Dashboard" });
		const action = screen.getByRole("button", { name: "New deck" });

		expect(
			heading.compareDocumentPosition(action) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});
});
