import { describe, expect, it } from "vitest";
import { highlightParts } from "./card-search";

describe("highlightParts", () => {
	it("returns the whole text when there is no query", () => {
		expect(highlightParts("hola", "")).toEqual([
			{ text: "hola", match: false, start: 0 },
		]);
	});

	it("marks every match and preserves the surrounding text", () => {
		expect(highlightParts("banana", "an")).toEqual([
			{ text: "b", match: false, start: 0 },
			{ text: "an", match: true, start: 1 },
			{ text: "an", match: true, start: 3 },
			{ text: "a", match: false, start: 5 },
		]);
	});

	it("keeps the original casing of the matched text", () => {
		expect(highlightParts("Hola HOLA", "hola")).toEqual([
			{ text: "Hola", match: true, start: 0 },
			{ text: " ", match: false, start: 4 },
			{ text: "HOLA", match: true, start: 5 },
		]);
	});

	it("marks a whole match when the query covers the text", () => {
		expect(highlightParts("hello", " hello ")).toEqual([
			{ text: "hello", match: true, start: 0 },
		]);
	});

	it("returns no parts for empty text", () => {
		expect(highlightParts("", "hola")).toEqual([]);
	});
});
