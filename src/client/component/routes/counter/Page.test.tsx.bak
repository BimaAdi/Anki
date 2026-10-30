// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	decrementCounter,
	getCounter,
	incrementCounter,
} from "#/server/serverFn/counter";
import { Page } from "./Page";

const counterQueryKey = ["counter"] as const;

vi.mock("#/server/serverFn/counter", () => ({
	decrementCounter: vi.fn(),
	getCounter: vi.fn(),
	incrementCounter: vi.fn(),
}));

function renderPage(count: number) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
			mutations: { retry: false },
		},
	});

	queryClient.setQueryData(counterQueryKey, { count });

	render(
		<QueryClientProvider client={queryClient}>
			<Page initialCounter={{ count }} />
		</QueryClientProvider>,
	);

	return queryClient;
}

describe("Page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders the heading and the current count", () => {
		renderPage(7);

		expect(screen.getByRole("heading", { name: "Counter" })).toBeTruthy();
		expect(screen.getByText("7")).toBeTruthy();
	});

	it("renders a negative count", () => {
		renderPage(-3);

		expect(screen.getByText("-3")).toBeTruthy();
	});

	it("increments the counter and updates the query cache", async () => {
		vi.mocked(incrementCounter).mockResolvedValue({ count: 8 });
		vi.mocked(getCounter).mockResolvedValue({ count: 8 });
		const queryClient = renderPage(7);

		fireEvent.click(screen.getByRole("button", { name: "Increment" }));

		await waitFor(() => expect(incrementCounter).toHaveBeenCalledTimes(1));
		expect(await screen.findByText("8")).toBeTruthy();
		expect(queryClient.getQueryData(counterQueryKey)).toEqual({ count: 8 });
	});

	it("decrements the counter and updates the query cache", async () => {
		vi.mocked(decrementCounter).mockResolvedValue({ count: 6 });
		vi.mocked(getCounter).mockResolvedValue({ count: 6 });
		const queryClient = renderPage(7);

		fireEvent.click(screen.getByRole("button", { name: "Decrement" }));

		await waitFor(() => expect(decrementCounter).toHaveBeenCalledTimes(1));
		expect(await screen.findByText("6")).toBeTruthy();
		expect(queryClient.getQueryData(counterQueryKey)).toEqual({ count: 6 });
	});

	it("shows the error message when an action fails", async () => {
		vi.mocked(incrementCounter).mockRejectedValue(
			new Error("Failed to increment"),
		);

		renderPage(7);

		fireEvent.click(screen.getByRole("button", { name: "Increment" }));

		expect(await screen.findByText("Failed to increment")).toBeTruthy();
	});

	it("shows a fallback message for non-Error failures", async () => {
		vi.mocked(decrementCounter).mockRejectedValue("nope");

		renderPage(7);

		fireEvent.click(screen.getByRole("button", { name: "Decrement" }));

		expect(await screen.findByText("Something went wrong")).toBeTruthy();
	});
});
