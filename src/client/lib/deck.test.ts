import { afterEach, describe, expect, it, vi } from "vitest";
import { formatCardCount, getCardTextSize, pickRandomCard } from "./deck";

const cards = [
	{ id: 1, front: "a" },
	{ id: 2, front: "b" },
	{ id: 3, front: "c" },
];

describe("formatCardCount", () => {
	it("uses the singular for exactly one card", () => {
		expect(formatCardCount(1)).toBe("1 card");
	});

	it("uses the plural otherwise", () => {
		expect(formatCardCount(0)).toBe("0 cards");
		expect(formatCardCount(2)).toBe("2 cards");
	});
});

describe("getCardTextSize", () => {
	it("uses the largest size for short text", () => {
		expect(getCardTextSize("hola")).toBe(64);
	});

	it("gets smaller as the text gets longer", () => {
		expect(getCardTextSize("a".repeat(12))).toBe(64);
		expect(getCardTextSize("a".repeat(13))).toBe(48);
		expect(getCardTextSize("a".repeat(30))).toBe(48);
		expect(getCardTextSize("a".repeat(31))).toBe(36);
		expect(getCardTextSize("a".repeat(60))).toBe(36);
		expect(getCardTextSize("a".repeat(61))).toBe(28);
		expect(getCardTextSize("a".repeat(120))).toBe(28);
		expect(getCardTextSize("a".repeat(121))).toBe(22);
		expect(getCardTextSize("a".repeat(200))).toBe(22);
		expect(getCardTextSize("a".repeat(201))).toBe(18);
	});

	it("counts characters instead of UTF-16 code units", () => {
		expect(getCardTextSize("😀".repeat(12))).toBe(64);
	});
});

describe("pickRandomCard", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns null when the deck has no cards", () => {
		expect(pickRandomCard([])).toBeNull();
	});

	it("returns the only card even when it was the previous card", () => {
		expect(pickRandomCard([{ id: 9, front: "solo" }], 9)).toEqual({
			id: 9,
			front: "solo",
		});
	});

	it("picks a card from the deck using Math.random", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99);

		expect(pickRandomCard(cards)).toEqual({ id: 3, front: "c" });
	});

	it("does not pick the previous card again when other cards exist", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);

		expect(pickRandomCard(cards, 1)).toEqual({ id: 2, front: "b" });
	});

	it("can still pick the previous card when it is the only candidate", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);

		expect(pickRandomCard([{ id: 5, front: "x" }], 5)).toEqual({
			id: 5,
			front: "x",
		});
	});
});
