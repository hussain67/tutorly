import mongoose from "mongoose";

export interface IUser {
	username: string;
	email: string;
	password: string;
	picture?: string;
	role: "subscriber" | "admin" | "instructor";
}

const userSchema = new mongoose.Schema<IUser>(
	{
		username: {
			type: String,
			trim: true,
			required: true
		},
		email: {
			type: String,
			trim: true,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true
		},
		picture: {
			type: String,
			default: "/avatar.png"
		},
		role: {
			type: String,
			enum: ["subscriber", "admin", "instructor"],
			default: "subscriber"
		}
	},
	{ timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
