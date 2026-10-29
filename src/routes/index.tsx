import { createFileRoute } from "@tanstack/react-router";
import { Page } from "#/client/component/routes/index/Page";

export const Route = createFileRoute("/")({
	component: Page,
});
