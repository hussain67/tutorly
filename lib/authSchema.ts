import { z } from "zod";

export const signupSchema = z.object({
	username: z.string().trim().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters"),

	email: z
		.string()
		.trim()
		.email("Invalid email address")
		.transform(v => v.toLowerCase()),

	password: z.string().min(6, "Password must be at least 6 characters").max(50, "Password must be at most 50 characters")
});
