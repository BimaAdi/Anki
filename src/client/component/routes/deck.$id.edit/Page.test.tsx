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
import type { Deck } from "#/server/schema/deck";
import { updateDeck } from "#/server/serverFn/deck";

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
			params,
			children,
			className,
		}: {
			to: string;
			params?: { id: string };
			children?: ReactNode;
			className?: string;
		}) =>
			createElement(
				"a",
				{ href: to.replace("$id", params?.id ?? ""), className },
				children,
			),
		useNavigate: () => navigate,
	};
});

vi.mock("#/server/serverFn/deck", () => ({
	updateDeck: vi.fn(),
}));

import { Page } from "./Page";

const deck: Deck = {
	id: 3,
	name: "Spanish",
	description: "Verbs",
};

function renderPage() {
	const queryClient = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	});

	render(
		<QueryClientProvider client={queryClient}>
			<Page deck={deck} />
		</QueryClientProvider>,
	);

	return queryClient;
}

describe("edit deck page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("shows the sign out button in the navbar", () => {
		renderPage();

		expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
	});

	it("pre-fills the form with the current deck", () => {
		renderPage();

		expect(screen.getByRole("heading", { name: "Edit deck" })).toBeTruthy();
		expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe(
			"Spanish",
		);
		expect(
			(screen.getByLabelText("Description") as HTMLTextAreaElement).value,
		).toBe("Verbs");
	});

	it("saves the changes and returns to the deck", async () => {
		vi.mocked(updateDeck).mockResolvedValue({
			id: 3,
			name: "Spanish verbs",
			description: "Verbs",
		});
		renderPage();

		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Spanish verbs" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save deck" }));

		await waitFor(() =>
			expect(updateDeck).toHaveBeenCalledWith({
				data: { id: 3, name: "Spanish verbs", description: "Verbs" },
			}),
		);
		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({
				to: "/deck/$id",
				params: { id: "3" },
			}),
		);
	});

	it("does not save a blank name", async () => {
		renderPage();

		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save deck" }));

		expect(await screen.findByText("Name is required")).toBeTruthy();
		expect(updateDeck).not.toHaveBeenCalled();
	});

	it("shows the server error when saving fails", async () => {
		vi.mocked(updateDeck).mockRejectedValue(new Error("Deck not found"));
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Save deck" }));

		expect((await screen.findByRole("alert")).textContent).toContain(
			"Deck not found",
		);
		expect(navigate).not.toHaveBeenCalled();
	});
});
