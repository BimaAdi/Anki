import { createFileRoute } from "@tanstack/react-router";
import { Page } from "#/client/component/routes/todo/Page.tsx";
import { getTodos } from "#/server/serverFn/todo";

export const Route = createFileRoute("/todo")({
	loader: () => getTodos(),
	component: TodoPage,
});

function TodoPage() {
	const initialTodos = Route.useLoaderData();

	return <Page initialTodos={initialTodos} />;
}
