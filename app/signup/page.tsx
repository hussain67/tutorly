"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signupUser } from "../actions/authActions";
import { redirect } from "next/navigation";

type SignupFormData = {
	username: string;
	email: string;
	password: string;
};

function Page() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset
	} = useForm<SignupFormData>();
	const [serverError, setServerError] = useState<string | null>(null);

	// Submit function
	const onSubmit = async (data: SignupFormData) => {
		const formData = new FormData();
		formData.append("username", data.username);
		formData.append("email", data.email);
		formData.append("password", data.password);

		const result = await signupUser(formData);
		if (!result?.success) {
			setServerError(result.message || "Signup failed");
		}
		reset();

		if (result?.success) {
			// You can redirect
			redirect("/dashboard");
		}
	};

	return (
		<section className="grid place-content-center h-full ">
			<div className="bg-white rounded-md p-4 relative ">
				{serverError && <div className="mb-4 rounded-md bg-red-100 text-red-700 px-3 py-2  absolute left-1/2 transform -translate-x-1/2 -top-12">{serverError}</div>}
				<h1 className="text-2xl tracking-wider mb-4 text-center">Signup</h1>

				<form
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					<div className={formFieldStyle}>
						<label htmlFor="username">Username:</label>
						<input
							className={inputStyle}
							aria-invalid={!!errors.username}
							aria-describedby={errors.username ? "username-error" : ""}
							id="username"
							{...register("username", {
								required: "Username is required"
							})}
							onChange={() => setServerError(null)}
						/>
						<span
							className="text-red-400 mt-1"
							role="alert"
						>
							{errors.username ? errors.username.message : ""}
						</span>
					</div>
					<div className={formFieldStyle}>
						<label htmlFor="email">Email:</label>
						<input
							className={inputStyle}
							id="email"
							type="email"
							aria-invalid={!!errors.email}
							aria-describedby={errors.email ? "email-error" : ""}
							{...register("email", {
								required: "Email is required",
								pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" }
							})}
							onChange={() => setServerError(null)}
						/>
						<span
							className="text-red-400 mt-1"
							role="alert"
						>
							{errors.email ? errors.email.message : ""}
						</span>
					</div>
					<div className={formFieldStyle}>
						<label htmlFor="password">Password:</label>
						<input
							className={inputStyle}
							id="password"
							type="password"
							aria-invalid={!!errors.password}
							aria-describedby={errors.password ? "password-error" : ""}
							{...register("password", {
								required: "Password is required",
								minLength: { value: 6, message: "Password must be at least 6 characters" },
								maxLength: { value: 50, message: "Password must be at most 50 characters" },
								pattern: {
									value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
									message: "Password must contain at least one letter \nand one number"
								}
							})}
							onChange={() => setServerError(null)}
						/>
						<span
							className="text-red-400 mt-1 whitespace-pre-line"
							role="alert"
						>
							{errors.password ? errors.password.message : ""}
						</span>
					</div>
					<div className={formFieldStyle}>
						<button
							disabled={isSubmitting}
							type="submit"
							className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-blue-600 transition	"
						>
							Signup
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}

export default Page;

const inputStyle = "border-2 border-slate-300 px-2 py-1 w-[300px] rounded-md focus:outline-none focus:border-blue-500 transition ";

const formFieldStyle = "flex flex-col mb-4";
