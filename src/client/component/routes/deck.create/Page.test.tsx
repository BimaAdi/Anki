// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDeck } from "#/server/serverFn/deck";

const { navigate } = vi.hoisted(() => ({
	navigate: vi.fn(),
}));

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
		useNavigate: () => navigate,
	};
});

vi.mock("#/server/serverFn/deck", () => ({
	createDeck: vi.fn(),
}));

import { Page } from "./Page";

function renderPage() {
	const queryClient = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	});

	render(
		<QueryClientProvider client={queryClient}>
			<Page />
		</QueryClientProvider>,
	);

	return queryClient;
}

describe("create deck page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders the deck form", () => {
		renderPage();

		expect(screen.getByRole("heading", { name: "Create a deck" })).toBeTruthy();
		expect(screen.getByLabelText("Name")).toBeTruthy();
		expect(screen.getByLabelText("Description")).toBeTruthy();
		expect(screen.getByRole("button", { name: "Create deck" })).toBeTruthy();
	});

	it("creates the deck with trimmed values and opens it", async () => {
		vi.mocked(createDeck).mockResolvedValue({
			id: 7,
			name: "Spanish",
			description: "Verbs",
		});
		renderPage();

		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "  Spanish  " },
		});
		fireEvent.change(screen.getByLabelText("Description"), {
			target: { value: "Verbs  " },
		});
		fireEvent.click(screen.getByRole("button", { name: "Create deck" }));

		await waitFor(() =>
			expect(createDeck).toHaveBeenCalledWith({
				data: { name: "Spanish", description: "Verbs" },
			}),
		);
		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({
				to: "/deck/$id",
				params: { id: "7" },
			}),
		);
	});

	it("does not create a deck with a blank name", async () => {
		renderPage();

		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "   " },
		});
		fireEvent.click(screen.getByRole("button", { name: "Create deck" }));

		expect(await screen.findByText("Name is required")).toBeTruthy();
		expect(createDeck).not.toHaveBeenCalled();
		expect(navigate).not.toHaveBeenCalled();
	});

	it("shows the server error and stays on the page", async () => {
		vi.mocked(createDeck).mockRejectedValue(new Error("Could not save deck"));
		renderPage();

		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Spanish" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Create deck" }));

		expect((await screen.findByRole("alert")).textContent).toContain(
			"Could not save deck",
		);
		expect(navigate).not.toHaveBeenCalled();
	});
});
