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
import type { Todo } from "#/server/schema/todo";
import {
	createTodo,
	deleteTodo,
	getTodos,
	setTodoCompleted,
} from "#/server/serverFn/todo";
import { Page } from "./Page";

const todosQueryKey = ["todos"] as const;

vi.mock("#/server/serverFn/todo", () => ({
	createTodo: vi.fn(),
	deleteTodo: vi.fn(),
	getTodos: vi.fn(),
	setTodoCompleted: vi.fn(),
}));

const todos: Todo[] = [
	{
		id: 1,
		title: "Write tests",
		completed: false,
		createdAt: new Date("2026-01-01T00:00:00Z"),
	},
	{
		id: 2,
		title: "Ship feature",
		completed: true,
		createdAt: null,
	},
];

function renderPage(initialTodos: Todo[]) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
			mutations: { retry: false },
		},
	});

	queryClient.setQueryData(todosQueryKey, initialTodos);

	render(
		<QueryClientProvider client={queryClient}>
			<Page initialTodos={initialTodos} />
		</QueryClientProvider>,
	);

	return queryClient;
}

describe("Page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("renders the heading and empty state", () => {
		renderPage([]);

		expect(screen.getByRole("heading", { name: "Todo List" })).toBeTruthy();
		expect(screen.getByText("No todos yet.")).toBeTruthy();
	});

	it("renders the provided todos", () => {
		renderPage(todos);

		expect(screen.getByText("Write tests")).toBeTruthy();
		expect(screen.getByText("Ship feature")).toBeTruthy();
		expect(screen.queryByText("No todos yet.")).toBeNull();
	});

	it("creates a todo, updates the cache, and clears the input", async () => {
		const created: Todo = {
			id: 3,
			title: "New todo",
			completed: false,
			createdAt: null,
		};
		vi.mocked(createTodo).mockResolvedValue(created);
		vi.mocked(getTodos).mockResolvedValue([created]);
		const queryClient = renderPage([]);

		const input = screen.getByPlaceholderText("What needs to be done?");
		fireEvent.change(input, { target: { value: "New todo" } });
		fireEvent.click(screen.getByRole("button", { name: "Add" }));

		await waitFor(() =>
			expect(createTodo).toHaveBeenCalledWith({
				data: { title: "New todo" },
			}),
		);
		await waitFor(() =>
			expect(queryClient.getQueryData(todosQueryKey)).toEqual([created]),
		);
		expect((input as HTMLInputElement).value).toBe("");
	});

	it("does not create a todo with a blank title", async () => {
		renderPage([]);

		const input = screen.getByPlaceholderText("What needs to be done?");
		fireEvent.change(input, { target: { value: "   " } });
		fireEvent.click(screen.getByRole("button", { name: "Add" }));

		await waitFor(() => expect(createTodo).not.toHaveBeenCalled());
	});

	it("toggles a todo and updates the cache", async () => {
		vi.mocked(setTodoCompleted).mockResolvedValue(undefined);
		vi.mocked(getTodos).mockResolvedValue([
			{ ...todos[0], completed: true },
			todos[1],
		]);
		const queryClient = renderPage(todos);

		fireEvent.click(screen.getAllByRole("checkbox")[0]);

		await waitFor(() =>
			expect(setTodoCompleted).toHaveBeenCalledWith({
				data: { id: 1, completed: true },
			}),
		);
		expect(queryClient.getQueryData<Todo[]>(todosQueryKey)?.[0].completed).toBe(
			true,
		);
	});

	it("deletes a todo and updates the cache", async () => {
		vi.mocked(deleteTodo).mockResolvedValue(undefined);
		vi.mocked(getTodos).mockResolvedValue([todos[1]]);
		const queryClient = renderPage(todos);

		fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

		await waitFor(() =>
			expect(deleteTodo).toHaveBeenCalledWith({ data: { id: 1 } }),
		);
		expect(queryClient.getQueryData<Todo[]>(todosQueryKey)).toEqual([todos[1]]);
	});

	it("shows the error message when an action fails", async () => {
		vi.mocked(deleteTodo).mockRejectedValue(new Error("Failed to delete"));

		renderPage(todos);

		fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

		expect(await screen.findByText("Failed to delete")).toBeTruthy();
	});

	it("shows a fallback message for non-Error failures", async () => {
		vi.mocked(deleteTodo).mockRejectedValue("nope");

		renderPage(todos);

		fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

		expect(await screen.findByText("Something went wrong")).toBeTruthy();
	});
});
