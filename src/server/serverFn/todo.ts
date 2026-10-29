import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	createTodoSchema,
	deleteTodoSchema,
	setTodoCompletedSchema,
	todoSchema,
} from "#/server/schema/todo";
import * as todoService from "#/server/service/todo";

export const getTodos = createServerFn({ method: "GET" }).handler(async () => {
	return z.array(todoSchema).parse(await todoService.listTodos());
});

export const createTodo = createServerFn({ method: "POST" })
	.validator(createTodoSchema)
	.handler(async ({ data }) => {
		return todoSchema.parse(await todoService.createTodo(data.title));
	});

export const setTodoCompleted = createServerFn({ method: "POST" })
	.validator(setTodoCompletedSchema)
	.handler(async ({ data }) => {
		await todoService.setTodoCompleted(data.id, data.completed);
	});

export const deleteTodo = createServerFn({ method: "POST" })
	.validator(deleteTodoSchema)
	.handler(async ({ data }) => {
		await todoService.deleteTodo(data.id);
	});
