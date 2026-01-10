"use client";

import { useForm } from "react-hook-form";

type FormData = {
	username: string;
	email: string;
	password: string;
};
const inputStyle = "border-2 border-slate-300 px-2 py-1 w-[300px] rounded-md focus:outline-none focus:border-blue-500 transition";
const formFieldStyle = "flex flex-col mb-4";

function Page() {
	const {
		reset,
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<FormData>();

	const onSubmit = (data: FormData) => {
		console.log(data);
		reset();
	};

	return (
		<section className="grid place-content-center h-full ">
			<div className="bg-white rounded-md p-4">
				<h1 className="text-2xl tracking-wider mb-4 text-center">Signup</h1>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className={formFieldStyle}>
						<label htmlFor="username">Username:</label>
						<input
							className={inputStyle}
							aria-invalid={!!errors.username}
							aria-describedby={""}
							id="username"
							{...register("username")}
						/>
						<span
							className="text-red-400"
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
							aria-describedby={""}
							{...register("email")}
						/>
						<span
							className="text-red-400"
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
							aria-describedby={""}
							{...register("password")}
						/>
						<span
							className="text-red-400"
							role="alert"
						>
							{errors.password ? errors.password.message : ""}
						</span>
					</div>
					<div className={formFieldStyle}>
						<button
							type="submit"
							className="bg-blue-500 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-blue-600 transition	"
						>
							Register
						</button>
					</div>
				</form>
			</div>
		</section>
	);
}

export default Page;
