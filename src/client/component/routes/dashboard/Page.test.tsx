// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DeckSummary } from "#/server/schema/deck";
import type { UserLimits } from "#/server/schema/user";

const { navigate, signOut } = vi.hoisted(() => ({
	navigate: vi.fn(),
	signOut: vi.fn(),
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

vi.mock("#/client/lib/auth-client", () => ({
	authClient: { signOut },
}));

vi.mock("#/server/serverFn/deck", () => ({
	listDecks: vi.fn(),
}));

import { DashboardPage } from "./Page";

const user = { name: "Anki User", email: "user@example.com" };
const defaultLimits: UserLimits = { deckLimit: 10, cardLimit: 100 };

function renderPage(
	decks: DeckSummary[] = [],
	limits: UserLimits = defaultLimits,
) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
		},
	});

	render(
		<QueryClientProvider client={queryClient}>
			<DashboardPage user={user} initialDecks={decks} limits={limits} />
		</QueryClientProvider>,
	);
}

describe("dashboard page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("welcomes the authenticated user", () => {
		renderPage();

		expect(
			screen.getByRole("heading", { name: "Welcome, Anki User." }),
		).toBeTruthy();
		expect(screen.getByText("Signed in as user@example.com")).toBeTruthy();
	});

	it("shows an empty state with a link to create the first deck", () => {
		renderPage([]);

		expect(screen.getByRole("heading", { name: "No decks yet." })).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "New deck" }).getAttribute("href"),
		).toBe("/deck/create");
	});

	it("lists the user's decks with card counts and play links", () => {
		renderPage([
			{ id: 1, name: "Spanish", description: "Verbs", cardCount: 2 },
			{ id: 2, name: "Math", description: null, cardCount: 1 },
		]);

		const spanish = screen.getByRole("link", { name: "Spanish" });
		expect(spanish.getAttribute("href")).toBe("/deck/1");
		expect(screen.getByText("Verbs")).toBeTruthy();
		expect(screen.getByText("2 cards")).toBeTruthy();
		expect(screen.getByText("1 card")).toBeTruthy();

		const playLinks = screen.getAllByRole("link", { name: "Play" });
		expect(playLinks.map((link) => link.getAttribute("href"))).toEqual([
			"/deck/1/play",
			"/deck/2/play",
		]);
		expect(screen.queryByText("No decks yet.")).toBeNull();
	});

	it("shows how many decks the user has out of their limit", () => {
		renderPage([{ id: 1, name: "Spanish", description: null, cardCount: 2 }]);

		expect(screen.getByText("1 / 10 decks")).toBeTruthy();
	});

	it("hides the new deck link and explains when the deck limit is reached", () => {
		renderPage([{ id: 1, name: "Spanish", description: null, cardCount: 2 }], {
			deckLimit: 1,
			cardLimit: 100,
		});

		expect(screen.getByText("1 / 1 decks")).toBeTruthy();
		expect(screen.getByRole("status").textContent).toContain("deck limit of 1");
		expect(screen.queryByRole("link", { name: "New deck" })).toBeNull();
	});

	it("signs out and returns to the login page", async () => {
		signOut.mockResolvedValue({ data: { success: true }, error: null });
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

		await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({ to: "/login" }),
		);
	});

	it("shows an error when sign out fails", async () => {
		signOut.mockResolvedValue({
			data: null,
			error: { message: "Session expired" },
		});
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

		const alert = await screen.findByRole("alert");
		expect(within(alert).getByText("Session expired")).toBeTruthy();
	});
});
