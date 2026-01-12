import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "./page";
import * as authActions from "../actions/authActions";

// Mock the next/navigation redirect function
vi.mock("next/navigation", () => ({
	redirect: vi.fn()
}));

// Mock the authActions module
vi.mock("../actions/authActions", () => ({
	signupUser: vi.fn()
}));

describe("Signup Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders the signup form with all fields", () => {
		render(<Page />);

		expect(screen.getAllByText("Signup")).toHaveLength(2);
		expect(screen.getByLabelText("Username:")).toBeInTheDocument();
		expect(screen.getByLabelText("Email:")).toBeInTheDocument();
		expect(screen.getByLabelText("Password:")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /signup/i })).toBeInTheDocument();
	});

	it("displays username validation error when field is empty on submit", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Username is required")).toBeInTheDocument();
		});
	});

	it("displays email validation error when field is empty on submit", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Email is required")).toBeInTheDocument();
		});
	});

	it("displays email validation error for invalid email format", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const emailInput = screen.getByLabelText("Email:");
		await user.type(emailInput, "invalidemail");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Invalid email address")).toBeInTheDocument();
		});
	});

	it("displays password validation error when field is empty on submit", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/Password is required/)).toBeInTheDocument();
		});
	});

	it("displays password error for password shorter than 6 characters", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const passwordInput = screen.getByLabelText("Password:");
		await user.type(passwordInput, "abc1");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
		});
	});

	it("displays password error for password longer than 50 characters", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const passwordInput = screen.getByLabelText("Password:");
		const longPassword = "a".repeat(45) + "1234567";

		await user.type(passwordInput, longPassword);

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Password must be at most 50 characters")).toBeInTheDocument();
		});
	});

	it("displays password error when password has no letters", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const passwordInput = screen.getByLabelText("Password:");
		await user.type(passwordInput, "123456");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/Password must contain at least one letter/)).toBeInTheDocument();
		});
	});

	it("displays password error when password has no numbers", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const passwordInput = screen.getByLabelText("Password:");
		await user.type(passwordInput, "abcdef");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/Password must contain at least one letter/)).toBeInTheDocument();
		});
	});

	it("successfully submits valid form data", async () => {
		const user = userEvent.setup();
		vi.mocked(authActions.signupUser).mockResolvedValueOnce({
			success: true,
			userId: "123"
		});

		render(<Page />);

		const usernameInput = screen.getByLabelText("Username:");
		const emailInput = screen.getByLabelText("Email:");
		const passwordInput = screen.getByLabelText("Password:");

		await user.type(usernameInput, "testuser");
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(authActions.signupUser).toHaveBeenCalled();
		});
	});

	it("displays server error message when signup fails", async () => {
		const user = userEvent.setup();
		vi.mocked(authActions.signupUser).mockResolvedValueOnce({
			success: false,
			message: "User already exists"
		});

		render(<Page />);

		const usernameInput = screen.getByLabelText("Username:");
		const emailInput = screen.getByLabelText("Email:");
		const passwordInput = screen.getByLabelText("Password:");

		await user.type(usernameInput, "testuser");
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("User already exists")).toBeInTheDocument();
		});
	});

	it("clears server error when user interacts with form fields", async () => {
		const user = userEvent.setup();
		vi.mocked(authActions.signupUser).mockResolvedValueOnce({
			success: false,
			message: "User already exists"
		});

		render(<Page />);

		const usernameInput = screen.getByLabelText("Username:");
		const emailInput = screen.getByLabelText("Email:");
		const passwordInput = screen.getByLabelText("Password:");

		await user.type(usernameInput, "testuser");
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("User already exists")).toBeInTheDocument();
		});

		// Clear error by interacting with field
		await user.type(usernameInput, "newuser");

		await waitFor(() => {
			expect(screen.queryByText("User already exists")).not.toBeInTheDocument();
		});
	});

	it("disables submit button while form is submitting", async () => {
		const user = userEvent.setup();
		vi.mocked(authActions.signupUser).mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ success: true, userId: "123" }), 100)));

		render(<Page />);

		const usernameInput = screen.getByLabelText("Username:");
		const emailInput = screen.getByLabelText("Email:");
		const passwordInput = screen.getByLabelText("Password:");

		await user.type(usernameInput, "testuser");
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		expect(submitButton).toBeDisabled();

		await waitFor(() => {
			expect(authActions.signupUser).toHaveBeenCalled();
		});
	});

	it("has proper aria labels and descriptions for accessibility", () => {
		render(<Page />);

		const usernameInput = screen.getByLabelText("Username:");
		const emailInput = screen.getByLabelText("Email:");
		const passwordInput = screen.getByLabelText("Password:");

		expect(usernameInput).toHaveAttribute("aria-invalid", "false");
		expect(emailInput).toHaveAttribute("aria-invalid", "false");
		expect(passwordInput).toHaveAttribute("aria-invalid", "false");
	});

	it("shows aria-invalid when validation fails", async () => {
		const user = userEvent.setup();
		render(<Page />);

		const emailInput = screen.getByLabelText("Email:");
		await user.type(emailInput, "invalidemail");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(emailInput).toHaveAttribute("aria-invalid", "true");
		});
	});

	it("resets form after successful submission", async () => {
		const user = userEvent.setup();
		vi.mocked(authActions.signupUser).mockResolvedValueOnce({
			success: true,
			userId: "123"
		});

		render(<Page />);

		const usernameInput = screen.getByLabelText("Username:") as HTMLInputElement;
		const emailInput = screen.getByLabelText("Email:") as HTMLInputElement;
		const passwordInput = screen.getByLabelText("Password:") as HTMLInputElement;

		await user.type(usernameInput, "testuser");
		await user.type(emailInput, "test@example.com");
		await user.type(passwordInput, "password123");

		const submitButton = screen.getByRole("button", { name: /signup/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(usernameInput.value).toBe("");
			expect(emailInput.value).toBe("");
			expect(passwordInput.value).toBe("");
		});
	});
});
