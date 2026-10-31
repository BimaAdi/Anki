import { createFileRoute } from "@tanstack/react-router";

import { Page } from "#/client/component/routes/deck.create/Page";
import { requireSession } from "#/client/lib/require-session";

export const Route = createFileRoute("/deck/create")({
	beforeLoad: requireSession,
	component: Page,
});
