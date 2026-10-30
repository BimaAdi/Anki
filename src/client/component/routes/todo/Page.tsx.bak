import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { Todo } from "#/server/schema/todo";
import {
	createTodo,
	deleteTodo,
	getTodos,
	setTodoCompleted,
} from "#/server/serverFn/todo";
import { TodoItem } from "./TodoItem";

const todosQueryKey = ["todos"] as const;

const titleSchema = z.string().trim().min(1, "Title is required").max(200);

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong";
}

function fieldErrorMessage(error: unknown) {
	return error instanceof Error
		? error.message
		: typeof error === "object" &&
				error !== null &&
				"message" in error &&
				typeof error.message === "string"
			? error.message
			: "Invalid value";
}

export function Page({ initialTodos }: { initialTodos: Todo[] }) {
	const { data: todos = [], refetch } = useQuery({
		queryKey: todosQueryKey,
		queryFn: () => getTodos(),
		initialData: initialTodos,
	});

	const create = useMutation({
		mutationFn: (newTitle: string) => createTodo({ data: { title: newTitle } }),
		onSuccess: () => {
			refetch();
		},
	});

	const setCompleted = useMutation({
		mutationFn: (variables: { id: number; completed: boolean }) =>
			setTodoCompleted({ data: variables }),
		onSuccess: () => {
			refetch();
		},
	});

	const remove = useMutation({
		mutationFn: (id: number) => deleteTodo({ data: { id } }),
		onSuccess: () => {
			refetch();
		},
	});

	const error = create.error ?? setCompleted.error ?? remove.error;

	function resetErrors() {
		create.reset();
		setCompleted.reset();
		remove.reset();
	}

	const form = useForm({
		defaultValues: { title: "" },
		onSubmit: async ({ value }) => {
			resetErrors();
			try {
				await create.mutateAsync(value.title.trim());
				form.reset();
			} catch {
				// handled via create.error below
			}
		},
	});

	return (
		<main className="mx-auto mt-10 max-w-xl p-6">
			<h1 className="text-3xl font-bold">Todo List</h1>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
				className="mt-6 flex gap-2"
			>
				<form.Field name="title" validators={{ onChange: titleSchema }}>
					{(field) => (
						<div className="flex-1">
							<input
								type="text"
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(event) => field.handleChange(event.target.value)}
								placeholder="What needs to be done?"
								maxLength={200}
								className="w-full rounded border border-gray-300 px-3 py-2"
							/>
							{field.state.meta.isTouched &&
								field.state.meta.errors.length > 0 && (
									<p className="mt-1 text-sm text-red-600">
										{field.state.meta.errors.map(fieldErrorMessage).join(", ")}
									</p>
								)}
						</div>
					)}
				</form.Field>
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
						>
							{isSubmitting ? "Adding..." : "Add"}
						</button>
					)}
				</form.Subscribe>
			</form>

			{error && <p className="mt-3 text-red-600">{errorMessage(error)}</p>}

			{todos.length === 0 ? (
				<p className="mt-6 text-gray-500">No todos yet.</p>
			) : (
				<ul className="mt-6 space-y-2">
					{todos.map((todo) => (
						<TodoItem
							key={todo.id}
							todo={todo}
							onToggle={(completed) => {
								resetErrors();
								setCompleted.mutate({ id: todo.id, completed });
							}}
							onDelete={() => {
								resetErrors();
								remove.mutate(todo.id);
							}}
						/>
					))}
				</ul>
			)}
		</main>
	);
}
