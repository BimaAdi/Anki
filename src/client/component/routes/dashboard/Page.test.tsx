// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { navigate, signOut } = vi.hoisted(() => ({
	navigate: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return { ...actual, useNavigate: () => navigate };
});

vi.mock("#/client/lib/auth-client", () => ({
	authClient: { signOut },
}));

import { DashboardPage } from "./Page";

describe("dashboard page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("welcomes the authenticated user", () => {
		render(
			<DashboardPage user={{ name: "Anki User", email: "user@example.com" }} />,
		);

		expect(
			screen.getByRole("heading", { name: "Welcome, Anki User." }),
		).toBeTruthy();
		expect(screen.getByText("Signed in as user@example.com")).toBeTruthy();
	});

	it("signs out and returns to the login page", async () => {
		signOut.mockResolvedValue({ data: { success: true }, error: null });
		render(
			<DashboardPage user={{ name: "Anki User", email: "user@example.com" }} />,
		);

		fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

		await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({ to: "/login" }),
		);
	});
});
