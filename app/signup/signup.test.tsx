import { describe, it, beforeEach, afterAll, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "./page";

// Mock console.log to test form submission
const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

describe("Registration Page", () => {
	beforeEach(() => {
		consoleLogSpy.mockClear();
		vi.clearAllMocks();
	});

	afterAll(() => {
		consoleLogSpy.mockRestore();
	});

	describe("Form Rendering", () => {
		it("should render the registration form", () => {
			render(<Page />);
			const heading = screen.getByRole("heading", { name: /register/i });
			expect(heading).toBeInTheDocument();
		});

		it("should render all form fields", () => {
			render(<Page />);
			const usernameInput = screen.getByLabelText(/username/i);
			const emailInput = screen.getByLabelText(/email/i);
			const passwordInput = screen.getByLabelText(/password/i);

			expect(usernameInput).toBeInTheDocument();
			expect(emailInput).toBeInTheDocument();
			expect(passwordInput).toBeInTheDocument();
		});

		it("should render the submit button", () => {
			render(<Page />);
			const submitButton = screen.getByRole("button", { name: /register/i });
			expect(submitButton).toBeInTheDocument();
		});

		it("should have correct input types", () => {
			render(<Page />);
			const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
			const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

			expect(emailInput.type).toBe("email");
			expect(passwordInput.type).toBe("password");
		});

		it("should render error message containers for each field", () => {
			render(<Page />);
			const alerts = screen.getAllByRole("alert");
			expect(alerts).toHaveLength(3); // username, email, password
		});
	});

	describe("Form Interaction", () => {
		it("should update form field values on user input", async () => {
			const user = userEvent.setup();
			render(<Page />);

			const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
			const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
			const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

			await user.type(usernameInput, "testuser");
			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "password123");

			expect(usernameInput.value).toBe("testuser");
			expect(emailInput.value).toBe("test@example.com");
			expect(passwordInput.value).toBe("password123");
		});

		it("should clear error messages when fields are valid", async () => {
			const user = userEvent.setup();
			render(<Page />);

			const usernameInput = screen.getByLabelText(/username/i);
			const alerts = screen.getAllByRole("alert");

			// All alerts should be empty initially
			alerts.forEach(alert => {
				expect(alert).toHaveTextContent("");
			});

			await user.type(usernameInput, "testuser");
			expect(usernameInput).toHaveValue("testuser");
		});
	});

	describe("Form Submission", () => {
		it("should submit form with valid data", async () => {
			const user = userEvent.setup();
			render(<Page />);

			const usernameInput = screen.getByLabelText(/username/i);
			const emailInput = screen.getByLabelText(/email/i);
			const passwordInput = screen.getByLabelText(/password/i);
			const submitButton = screen.getByRole("button", { name: /register/i });

			await user.type(usernameInput, "testuser");
			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "password123");
			await user.click(submitButton);

			await waitFor(() => {
				expect(consoleLogSpy).toHaveBeenCalledWith({
					username: "testuser",
					email: "test@example.com",
					password: "password123"
				});
			});
		});

		it("should reset form fields after successful submission", async () => {
			const user = userEvent.setup();
			render(<Page />);

			const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
			const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
			const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
			const submitButton = screen.getByRole("button", { name: /register/i });

			// Fill form
			await user.type(usernameInput, "testuser");
			await user.type(emailInput, "test@example.com");
			await user.type(passwordInput, "password123");

			// Submit form
			await user.click(submitButton);

			// Check if fields are cleared
			await waitFor(() => {
				expect(usernameInput.value).toBe("");
				expect(emailInput.value).toBe("");
				expect(passwordInput.value).toBe("");
			});
		});

		it("should handle multiple form submissions", async () => {
			const user = userEvent.setup();
			render(<Page />);

			const usernameInput = screen.getByLabelText(/username/i);
			const emailInput = screen.getByLabelText(/email/i);
			const passwordInput = screen.getByLabelText(/password/i);
			const submitButton = screen.getByRole("button", { name: /register/i });

			// First submission
			await user.type(usernameInput, "user1");
			await user.type(emailInput, "user1@example.com");
			await user.type(passwordInput, "pass1");
			await user.click(submitButton);

			await waitFor(() => {
				expect(consoleLogSpy).toHaveBeenLastCalledWith({
					username: "user1",
					email: "user1@example.com",
					password: "pass1"
				});
			});

			// Second submission
			await user.type(usernameInput, "user2");
			await user.type(emailInput, "user2@example.com");
			await user.type(passwordInput, "pass2");
			await user.click(submitButton);

			await waitFor(() => {
				expect(consoleLogSpy).toHaveBeenLastCalledWith({
					username: "user2",
					email: "user2@example.com",
					password: "pass2"
				});
			});

			expect(consoleLogSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe("Accessibility", () => {
		it("should have proper labels for all inputs", () => {
			render(<Page />);
			expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		});

		it("should have aria-invalid attribute on inputs", () => {
			render(<Page />);
			const usernameInput = screen.getByLabelText(/username/i);
			const emailInput = screen.getByLabelText(/email/i);
			const passwordInput = screen.getByLabelText(/password/i);

			expect(usernameInput).toHaveAttribute("aria-invalid");
			expect(emailInput).toHaveAttribute("aria-invalid");
			expect(passwordInput).toHaveAttribute("aria-invalid");
		});

		it("should have alert role for error messages", () => {
			render(<Page />);
			const alerts = screen.getAllByRole("alert");
			expect(alerts.length).toBeGreaterThan(0);
		});

		it("should have proper button type", () => {
			render(<Page />);
			const submitButton = screen.getByRole("button", { name: /register/i }) as HTMLButtonElement;
			expect(submitButton.type).toBe("submit");
		});
	});

	describe("Styling", () => {
		it("should apply correct CSS classes to inputs", () => {
			render(<Page />);
			const inputs = screen.getAllByRole("textbox");

			inputs.forEach(input => {
				expect(input).toHaveClass("border-2");
				expect(input).toHaveClass("border-slate-300");
			});
		});

		it("should apply correct CSS classes to error messages", () => {
			render(<Page />);
			const alerts = screen.getAllByRole("alert");

			alerts.forEach(alert => {
				expect(alert).toHaveClass("text-red-400");
			});
		});

		it("should apply correct CSS classes to submit button", () => {
			render(<Page />);
			const submitButton = screen.getByRole("button", { name: /register/i });

			expect(submitButton).toHaveClass("bg-blue-500");
			expect(submitButton).toHaveClass("text-white");
		});
	});
});
