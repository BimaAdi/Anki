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
import { deckQueryKey } from "#/client/lib/deck";
import type { DeckDetail } from "#/server/schema/deck";
import { createCard, deleteCard, updateCard } from "#/server/serverFn/card";
import { deleteDeck, getDeck } from "#/server/serverFn/deck";

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

vi.mock("#/server/serverFn/card", () => ({
	createCard: vi.fn(),
	deleteCard: vi.fn(),
	updateCard: vi.fn(),
}));

vi.mock("#/server/serverFn/deck", () => ({
	deleteDeck: vi.fn(),
	getDeck: vi.fn(),
}));

import { Page } from "./Page";

const deck: DeckDetail = {
	id: 1,
	name: "Spanish",
	description: "Basic verbs",
	cardLimit: 100,
	cards: [
		{ id: 10, deckId: 1, front: "hola", back: "hello" },
		{ id: 11, deckId: 1, front: "adios", back: "goodbye" },
	],
};

function renderPage(initialDeck: DeckDetail = deck) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
			mutations: { retry: false },
		},
	});

	queryClient.setQueryData(deckQueryKey(initialDeck.id), initialDeck);

	render(
		<QueryClientProvider client={queryClient}>
			<Page initialDeck={initialDeck} />
		</QueryClientProvider>,
	);

	return queryClient;
}

function cardItem(text: string) {
	return screen.getByText(text).closest("li") as HTMLElement;
}

function editingCardItem() {
	return screen
		.getAllByRole("listitem")
		.find((item) => within(item).queryByLabelText("Front")) as HTMLElement;
}

describe("deck page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
		vi.restoreAllMocks();
	});

	it("shows the sign out button in the navbar", () => {
		renderPage();

		expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
	});

	it("shows the deck and its cards", () => {
		renderPage();

		expect(screen.getByRole("heading", { name: "Spanish" })).toBeTruthy();
		expect(screen.getByText("Basic verbs")).toBeTruthy();
		expect(screen.getByText("2 cards")).toBeTruthy();
		expect(screen.getByText("hola")).toBeTruthy();
		expect(screen.getByText("hello")).toBeTruthy();
		expect(screen.getByText("adios")).toBeTruthy();
		expect(screen.getByText("goodbye")).toBeTruthy();
	});

	it("links to play and edit the deck", () => {
		renderPage();

		expect(
			screen.getByRole("link", { name: "Play deck" }).getAttribute("href"),
		).toBe("/deck/1/play");
		expect(
			screen.getByRole("link", { name: "Edit deck" }).getAttribute("href"),
		).toBe("/deck/1/edit");
	});

	it("orders deck actions as play, edit, delete, then back to all decks", () => {
		renderPage();

		const allDecks = screen.getByRole("link", { name: "Back to all decks" });
		expect(allDecks.getAttribute("href")).toBe("/dashboard");

		const actionRow = allDecks.parentElement as HTMLElement;
		expect(
			Array.from(actionRow.children).map((action) => action.textContent),
		).toEqual(["Play deck", "Edit deck", "Delete deck", "Back to all decks"]);
	});

	it("shows an empty state when the deck has no cards", () => {
		renderPage({ ...deck, cards: [] });

		expect(
			screen.getByText("No cards yet. Add your first card above."),
		).toBeTruthy();
		expect(screen.getByText("0 cards")).toBeTruthy();
	});

	it("shows the card limit for the deck", () => {
		renderPage();

		expect(screen.getByText("Limit 100")).toBeTruthy();
	});

	it("hides the add form and explains when the deck reaches its card limit", () => {
		renderPage({ ...deck, cardLimit: 2 });

		expect(screen.getByRole("status").textContent).toContain("card limit of 2");
		expect(screen.queryByRole("button", { name: "Add card" })).toBeNull();
	});

	it("adds a card, refreshes the deck, and clears the form", async () => {
		const created = { id: 12, deckId: 1, front: "casa", back: "house" };
		vi.mocked(createCard).mockResolvedValue(created);
		vi.mocked(getDeck).mockResolvedValue({
			...deck,
			cards: [...deck.cards, created],
		});
		renderPage();

		fireEvent.change(screen.getByLabelText("Front"), {
			target: { value: "casa" },
		});
		fireEvent.change(screen.getByLabelText("Back"), {
			target: { value: "house" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Add card" }));

		await waitFor(() =>
			expect(createCard).toHaveBeenCalledWith({
				data: { deckId: 1, front: "casa", back: "house" },
			}),
		);
		expect(await screen.findByText("house")).toBeTruthy();
		await waitFor(() =>
			expect(
				(screen.getByLabelText("Front") as HTMLTextAreaElement).value,
			).toBe(""),
		);
		expect((screen.getByLabelText("Back") as HTMLTextAreaElement).value).toBe(
			"",
		);
		expect(screen.queryByText("This side is required")).toBeNull();
	});

	it("shows the newly added card as the first item", async () => {
		const created = { id: 12, deckId: 1, front: "casa", back: "house" };
		vi.mocked(createCard).mockResolvedValue(created);
		vi.mocked(getDeck).mockResolvedValue({
			...deck,
			cards: [...deck.cards, created],
		});
		renderPage();

		fireEvent.change(screen.getByLabelText("Front"), {
			target: { value: "casa" },
		});
		fireEvent.change(screen.getByLabelText("Back"), {
			target: { value: "house" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Add card" }));

		await screen.findByText("house");
		const fronts = screen
			.getAllByText(/^(casa|hola|adios)$/)
			.map((element) => element.textContent);
		expect(fronts).toEqual(["casa", "adios", "hola"]);
	});

	it("does not add a card when a side is blank", async () => {
		renderPage();

		fireEvent.change(screen.getByLabelText("Front"), {
			target: { value: "question" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Add card" }));

		expect(await screen.findByText("This side is required")).toBeTruthy();
		expect(createCard).not.toHaveBeenCalled();
	});

	it("edits a card inline and saves the changes", async () => {
		vi.mocked(updateCard).mockResolvedValue({
			id: 10,
			deckId: 1,
			front: "hola amigo",
			back: "hello friend",
		});
		vi.mocked(getDeck).mockResolvedValue(deck);
		renderPage();

		fireEvent.click(
			within(cardItem("hola")).getByRole("button", { name: "Edit" }),
		);

		const item = editingCardItem();
		fireEvent.change(within(item).getByLabelText("Front"), {
			target: { value: "hola amigo" },
		});
		fireEvent.change(within(item).getByLabelText("Back"), {
			target: { value: "hello friend" },
		});
		fireEvent.click(within(item).getByRole("button", { name: "Save card" }));

		await waitFor(() =>
			expect(updateCard).toHaveBeenCalledWith({
				data: { id: 10, front: "hola amigo", back: "hello friend" },
			}),
		);
		await waitFor(() =>
			expect(screen.queryByRole("button", { name: "Save card" })).toBeNull(),
		);
	});

	it("cancels card editing without saving", () => {
		renderPage();

		fireEvent.click(
			within(cardItem("hola")).getByRole("button", { name: "Edit" }),
		);
		fireEvent.click(
			within(editingCardItem()).getByRole("button", { name: "Cancel" }),
		);

		expect(updateCard).not.toHaveBeenCalled();
		expect(screen.getByText("hola")).toBeTruthy();
	});

	it("deletes a card", async () => {
		vi.mocked(deleteCard).mockResolvedValue(undefined);
		vi.mocked(getDeck).mockResolvedValue({ ...deck, cards: [deck.cards[1]] });
		renderPage();

		fireEvent.click(
			within(cardItem("hola")).getByRole("button", { name: "Delete" }),
		);

		await waitFor(() =>
			expect(deleteCard).toHaveBeenCalledWith({ data: { id: 10 } }),
		);
	});

	it("deletes the deck after confirmation and returns to the dashboard", async () => {
		vi.spyOn(window, "confirm").mockReturnValue(true);
		vi.mocked(deleteDeck).mockResolvedValue(undefined);
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Delete deck" }));

		await waitFor(() =>
			expect(deleteDeck).toHaveBeenCalledWith({ data: { id: 1 } }),
		);
		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" }),
		);
	});

	it("keeps the deck when deletion is cancelled", () => {
		vi.spyOn(window, "confirm").mockReturnValue(false);
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Delete deck" }));

		expect(deleteDeck).not.toHaveBeenCalled();
		expect(navigate).not.toHaveBeenCalled();
	});

	it("shows the error message when a card action fails", async () => {
		vi.mocked(deleteCard).mockRejectedValue(new Error("Failed to delete card"));
		renderPage();

		fireEvent.click(
			within(cardItem("hola")).getByRole("button", { name: "Delete" }),
		);

		expect(await screen.findByText("Failed to delete card")).toBeTruthy();
	});

	it("shows a fallback message for non-Error failures", async () => {
		vi.mocked(deleteCard).mockRejectedValue("nope");
		renderPage();

		fireEvent.click(
			within(cardItem("hola")).getByRole("button", { name: "Delete" }),
		);

		expect(await screen.findByText("Something went wrong")).toBeTruthy();
	});
});
