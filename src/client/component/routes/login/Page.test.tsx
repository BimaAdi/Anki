// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { emailSignIn, githubSignIn, navigate } = vi.hoisted(() => ({
	emailSignIn: vi.fn(),
	githubSignIn: vi.fn(),
	navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return { ...actual, useNavigate: () => navigate };
});

vi.mock("#/client/lib/auth-client", () => ({
	authClient: {
		signIn: {
			email: emailSignIn,
			social: githubSignIn,
		},
	},
}));

import { Page } from "./Page";

describe("login page", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it("offers GitHub and email sign-in without public email signup", () => {
		render(<Page />);

		expect(
			screen.getByRole("heading", { name: "Make Learning Stick" }),
		).toBeTruthy();
		expect(screen.getByRole("link", { name: "Anki home" })).toBeTruthy();
		expect(
			screen.getByRole("heading", { name: "Sign in to Anki" }),
		).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Continue with GitHub" }),
		).toBeTruthy();
		expect(screen.getByLabelText("Email address")).toBeTruthy();
		expect(screen.getByLabelText("Password")).toBeTruthy();
		expect(
			screen.queryByText("Email accounts are created by your administrator."),
		).toBeNull();
		expect(screen.queryByRole("link", { name: /sign up/i })).toBeNull();
	});

	it("starts GitHub sign-in with the dashboard callback", async () => {
		githubSignIn.mockResolvedValue({ data: null, error: null });
		render(<Page />);

		fireEvent.click(
			screen.getByRole("button", { name: "Continue with GitHub" }),
		);

		await waitFor(() =>
			expect(githubSignIn).toHaveBeenCalledWith({
				provider: "github",
				callbackURL: "/dashboard",
			}),
		);
	});

	it("signs in provisioned users with email and navigates to the dashboard", async () => {
		emailSignIn.mockResolvedValue({
			data: { token: "session-token" },
			error: null,
		});
		render(<Page />);

		fireEvent.change(screen.getByLabelText("Email address"), {
			target: { value: "reader@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "correct horse battery" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /sign in with email/i }),
		);

		await waitFor(() =>
			expect(emailSignIn).toHaveBeenCalledWith({
				email: "reader@example.com",
				password: "correct horse battery",
				callbackURL: "/dashboard",
			}),
		);
		await waitFor(() =>
			expect(navigate).toHaveBeenCalledWith({ to: "/dashboard" }),
		);
	});

	it("shows email sign-in errors", async () => {
		emailSignIn.mockResolvedValue({
			data: null,
			error: { message: "Invalid email or password" },
		});
		render(<Page />);

		fireEvent.change(screen.getByLabelText("Email address"), {
			target: { value: "reader@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "incorrect" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /sign in with email/i }),
		);

		expect((await screen.findByRole("alert")).textContent).toContain(
			"Invalid email or password",
		);
	});
});
