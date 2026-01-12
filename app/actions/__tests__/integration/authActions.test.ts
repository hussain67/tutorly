import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from "vitest";
import { setupTestDB, clearTestDB, teardownTestDB } from "./setupTestDB";
import { signupUser } from "../../authActions";
import { User } from "../../../../models/User";

const setCookieMock = vi.fn();

vi.mock("next/headers", () => ({
	cookies: vi.fn(async () => ({
		set: setCookieMock
	}))
}));
describe("Auth Actions - Integration Tests", () => {
	beforeAll(async () => {
		await setupTestDB();
	});

	afterEach(async () => {
		await clearTestDB();
		// Clear cookies mock
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await teardownTestDB();
	});

	describe("signupUser", () => {
		it("should successfully create a new user with valid signup data", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "test@example.com");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(true);
			expect(result.userId).toBeDefined();
			expect(result.message).toBeUndefined();

			// Verify user was created in database
			const user = await User.findById(result.userId);
			expect(user).toBeDefined();
			expect(user?.username).toBe("testuser");
			expect(user?.email).toBe("test@example.com");
			expect(user?.role).toBe("subscriber"); // default role
		});

		it("should fail when email already exists", async () => {
			// Create first user
			await User.create({
				username: "user1",
				email: "existing@example.com",
				password: "hashedpassword",
				role: "subscriber"
			});

			// Try to sign up with same email
			const formData = new FormData();
			formData.append("username", "user2");
			formData.append("email", "existing@example.com");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("User already exists");
			expect(result.userId).toBeUndefined();

			// Verify only one user exists
			const userCount = await User.countDocuments({ email: "existing@example.com" });
			expect(userCount).toBe(1);
		});

		it("should fail with invalid email format", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "not-an-email");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid signup details");
			expect(result.userId).toBeUndefined();

			// Verify no user was created
			const userCount = await User.countDocuments();
			expect(userCount).toBe(0);
		});

		it("should fail with username too short", async () => {
			const formData = new FormData();
			formData.append("username", "ab");
			formData.append("email", "test@example.com");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid signup details");
			expect(result.userId).toBeUndefined();
		});

		it("should fail with username too long", async () => {
			const formData = new FormData();
			formData.append("username", "a".repeat(21));
			formData.append("email", "test@example.com");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid signup details");
			expect(result.userId).toBeUndefined();
		});

		it("should fail with password too short", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "test@example.com");
			formData.append("password", "pass");

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid signup details");
			expect(result.userId).toBeUndefined();
		});

		it("should fail with password too long", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "test@example.com");
			formData.append("password", "a".repeat(51));

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid signup details");
			expect(result.userId).toBeUndefined();
		});

		it("should normalize email to lowercase", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "Test@Example.COM");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(true);
			expect(result.userId).toBeDefined();

			// Verify email was stored in lowercase
			const user = await User.findById(result.userId);
			expect(user?.email).toBe("test@example.com");
		});

		it("should hash password before storing", async () => {
			const plainPassword = "password123";
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "test@example.com");
			formData.append("password", plainPassword);

			const result = await signupUser(formData);

			expect(result.success).toBe(true);

			const user = await User.findById(result.userId);
			expect(user?.password).toBeDefined();
			// Password should be hashed, not stored as plaintext
			expect(user?.password).not.toBe(plainPassword);
		});

		it("should fail with missing required fields", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			// Missing email and password

			const result = await signupUser(formData);

			expect(result.success).toBe(false);
			expect(result.message).toBe("Invalid signup details");
		});

		it("should create user with trimmed whitespace in email and username", async () => {
			const formData = new FormData();
			formData.append("username", "  testuser  ");
			formData.append("email", "  test@example.com  ");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(true);

			const user = await User.findById(result.userId);
			expect(user?.username).toBe("testuser");
			expect(user?.email).toBe("test@example.com");
		});

		it("should set default picture and role on new user", async () => {
			const formData = new FormData();
			formData.append("username", "testuser");
			formData.append("email", "test@example.com");
			formData.append("password", "password123");

			const result = await signupUser(formData);

			expect(result.success).toBe(true);

			const user = await User.findById(result.userId);
			expect(user?.picture).toBe("/avatar.png");
			expect(user?.role).toBe("subscriber");
		});

		it("should handle concurrent signup attempts with same email gracefully", async () => {
			const formData1 = new FormData();
			formData1.append("username", "user1");
			formData1.append("email", "concurrent@example.com");
			formData1.append("password", "password123");

			const formData2 = new FormData();
			formData2.append("username", "user2");
			formData2.append("email", "concurrent@example.com");
			formData2.append("password", "password456");

			const [result1, result2] = await Promise.all([signupUser(formData1), signupUser(formData2)]);

			// One should succeed, one should fail
			const successCount = [result1, result2].filter(r => r.success).length;
			const failCount = [result1, result2].filter(r => !r.success).length;

			expect(successCount).toBe(1);
			expect(failCount).toBe(1);

			// Only one user should exist
			const userCount = await User.countDocuments({ email: "concurrent@example.com" });
			expect(userCount).toBe(1);
		});
	});
});
