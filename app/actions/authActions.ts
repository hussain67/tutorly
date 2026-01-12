"use server";
import { MongoServerError } from "mongodb";
import { connectDB } from "../../lib/db";
// import { connectDB } from "@/lib/db";
import { User } from "../../models/User";
import { hashPassword } from "../../lib/password";
import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { signupSchema } from "../../lib/authSchema";

export async function signupUser(formData: FormData): Promise<{ success: boolean; message?: string; userId?: string }> {
	// Convert FormData → plain object
	const rowData = Object.fromEntries(formData.entries());
	// Zod validation
	const parsedData = signupSchema.safeParse(rowData);

	if (!parsedData.success) {
		return {
			success: false,
			message: "Invalid signup details"
		};
	}

	try {
		await connectDB();
		const { username, email, password } = parsedData.data;

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return {
				success: false,
				message: "User already exists"
			};
		}
		const hashed = await hashPassword(password);

		const user = await User.create({
			username,
			email,
			password: hashed
		});
		const cookieStore = await cookies();
		cookieStore.set("userId", user._id.toString(), {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			path: "/"
		});
		return { success: true, userId: user._id.toString() };
	} catch (error) {
		if (error instanceof MongoServerError && error.code === 11000) {
			return {
				success: false,
				message: "User with this email already exists"
			};
		}
		return {
			success: false,
			message: "Server error"
		};
	}
}
