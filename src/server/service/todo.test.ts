// @vitest-environment node
import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "#/server/db";
import { todos } from "#/server/db/schema";
import { closeTestDatabase } from "#/server/test/database";
import { createTodo, deleteTodo, listTodos, setTodoCompleted } from "./todo";

vi.mock("#/server/db", async () => {
	const { createTestDatabase } = await import("#/server/test/database");
	return createTestDatabase();
});

afterAll(async () => {
	await closeTestDatabase(db);
});

beforeEach(async () => {
	await db.delete(todos);
});

describe("createTodo", () => {
	it("inserts a todo and returns the created row", async () => {
		const created = await createTodo("Write tests");

		expect(created).toMatchObject({
			title: "Write tests",
			completed: false,
		});
		expect(created.id).toBeGreaterThan(0);

		const rows = await db.select().from(todos);
		expect(rows).toEqual([
			expect.objectContaining({
				id: created.id,
				title: "Write tests",
				completed: false,
			}),
		]);
	});

	it("persists multiple todos with unique ids", async () => {
		const first = await createTodo("First");
		const second = await createTodo("Second");

		expect(second.id).not.toBe(first.id);

		const rows = await db.select().from(todos).orderBy(todos.id);
		expect(rows.map((row) => row.title)).toEqual(["First", "Second"]);
	});
});

describe("listTodos", () => {
	it("returns an empty array when there are no todos", async () => {
		await expect(listTodos()).resolves.toEqual([]);
	});

	it("returns todos ordered by id ascending", async () => {
		await createTodo("Second");
		await createTodo("Third");
		await createTodo("First");

		const rows = await listTodos();

		expect(rows.map((row) => row.title)).toEqual(["Second", "Third", "First"]);
		expect(rows.map((row) => row.id)).toEqual(
			[...rows.map((row) => row.id)].sort((a, b) => a - b),
		);
	});
});

describe("setTodoCompleted", () => {
	it("updates the completed flag in the database", async () => {
		const todo = await createTodo("Toggle me");

		await setTodoCompleted(todo.id, true);

		const [updated] = await db
			.select()
			.from(todos)
			.where(eq(todos.id, todo.id));
		expect(updated.completed).toBe(true);
	});

	it("can mark a todo as incomplete again", async () => {
		const todo = await createTodo("Toggle me twice");

		await setTodoCompleted(todo.id, true);
		await setTodoCompleted(todo.id, false);

		const [updated] = await db
			.select()
			.from(todos)
			.where(eq(todos.id, todo.id));
		expect(updated.completed).toBe(false);
	});

	it("only updates the todo with the given id", async () => {
		const target = await createTodo("Target");
		const other = await createTodo("Other");

		await setTodoCompleted(target.id, true);

		const [updatedTarget] = await db
			.select()
			.from(todos)
			.where(eq(todos.id, target.id));
		const [untouchedOther] = await db
			.select()
			.from(todos)
			.where(eq(todos.id, other.id));

		expect(updatedTarget.completed).toBe(true);
		expect(untouchedOther.completed).toBe(false);
	});
});

describe("deleteTodo", () => {
	it("deletes the todo from the database", async () => {
		const todo = await createTodo("Delete me");

		await deleteTodo(todo.id);

		const rows = await db.select().from(todos);
		expect(rows).toEqual([]);
	});

	it("only deletes the todo with the given id", async () => {
		const target = await createTodo("Target");
		const other = await createTodo("Other");

		await deleteTodo(target.id);

		const rows = await db.select().from(todos);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ id: other.id, title: "Other" });
	});

	it("does nothing when the todo does not exist", async () => {
		const todo = await createTodo("Keep me");

		await deleteTodo(todo.id + 1);

		const rows = await db.select().from(todos);
		expect(rows).toEqual([expect.objectContaining({ id: todo.id })]);
	});
});
