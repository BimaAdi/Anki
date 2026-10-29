import { z } from "zod";

export const todoSchema = z.object({
	id: z.number().int(),
	title: z.string(),
	completed: z.boolean(),
	createdAt: z.date().nullable(),
});

export const createTodoSchema = z.object({
	title: z.string().trim().min(1, "Title is required").max(200),
});

export const setTodoCompletedSchema = z.object({
	id: z.number().int().positive(),
	completed: z.boolean(),
});

export const deleteTodoSchema = z.object({
	id: z.number().int().positive(),
});

export type Todo = z.infer<typeof todoSchema>;
