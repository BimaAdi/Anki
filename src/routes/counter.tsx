import { createFileRoute } from "@tanstack/react-router";
import { Page } from "#/client/component/routes/counter/Page.tsx";
import { getCounter } from "#/server/serverFn/counter";

export const Route = createFileRoute("/counter")({
	loader: () => getCounter(),
	component: CounterPage,
});

function CounterPage() {
	const initialCounter = Route.useLoaderData();

	return <Page initialCounter={initialCounter} />;
}
