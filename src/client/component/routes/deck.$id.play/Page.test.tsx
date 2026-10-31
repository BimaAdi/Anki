// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DeckDetail } from "#/server/schema/deck";

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
		useNavigate: () => vi.fn(),
	};
});

import { Page } from "./Page";

const deck: DeckDetail = {
	id: 1,
	name: "Spanish",
	description: null,
	cardLimit: 100,
	cards: [
		{ id: 10, deckId: 1, front: "hola", back: "hello" },
		{ id: 11, deckId: 1, front: "adios", back: "goodbye" },
	],
};

describe("play page", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it("shows the sign out button in the navbar", () => {
		render(<Page deck={deck} />);

		expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
	});

	it("links back to the deck from the header", () => {
		render(<Page deck={deck} />);

		expect(
			screen.getByRole("link", { name: "Back to deck" }).getAttribute("href"),
		).toBe("/deck/1");
	});

	it("explains how to start when the deck is empty", () => {
		render(<Page deck={{ ...deck, cards: [] }} />);

		expect(
			screen.getByRole("heading", { name: "This deck has no cards yet." }),
		).toBeTruthy();
		expect(
			screen.getByRole("link", { name: "Add cards" }).getAttribute("href"),
		).toBe("/deck/1");
		expect(screen.queryByRole("button", { name: "Show answer" })).toBeNull();
	});

	it("shows only the front of a random card until the answer is revealed", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		render(<Page deck={deck} />);

		expect(screen.getByText("hola")).toBeTruthy();
		expect(screen.queryByText("hello")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Show answer" }));

		expect(screen.getByText("hello")).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Show answer" })).toBeNull();
	});

	it("uses a larger font for short text than for long text", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const longText = "a".repeat(250);
		render(
			<Page
				deck={{
					...deck,
					cards: [{ id: 10, deckId: 1, front: "hola", back: longText }],
				}}
			/>,
		);

		expect(screen.getByText("hola").style.fontSize).toBe("64px");

		fireEvent.click(screen.getByRole("button", { name: "Show answer" }));

		expect(screen.getByText(longText).style.fontSize).toBe("18px");
	});

	it("moves to a different card and hides the answer on next card", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		render(<Page deck={deck} />);

		fireEvent.click(screen.getByRole("button", { name: "Show answer" }));
		fireEvent.click(screen.getByRole("button", { name: "Next card" }));

		expect(screen.queryByText("hola")).toBeNull();
		expect(screen.getByText("adios")).toBeTruthy();
		expect(screen.queryByText("goodbye")).toBeNull();
		expect(screen.getByRole("button", { name: "Show answer" })).toBeTruthy();
	});

	it("keeps showing the only card when the deck has one card", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		render(<Page deck={{ ...deck, cards: [deck.cards[0]] }} />);

		fireEvent.click(screen.getByRole("button", { name: "Show answer" }));
		fireEvent.click(screen.getByRole("button", { name: "Next card" }));

		expect(screen.getByText("hola")).toBeTruthy();
	});
});
