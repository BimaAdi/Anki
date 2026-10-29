import { asc, eq } from "drizzle-orm";
import { db } from "#/server/db";
import { todos } from "#/server/db/schema";

export async function listTodos() {
	return db.select().from(todos).orderBy(asc(todos.id));
}

export async function createTodo(title: string) {
	const [todo] = await db.insert(todos).values({ title }).returning();
	return todo;
}

export async function setTodoCompleted(id: number, completed: boolean) {
	await db.update(todos).set({ completed }).where(eq(todos.id, id));
}

export async function deleteTodo(id: number) {
	await db.delete(todos).where(eq(todos.id, id));
}
