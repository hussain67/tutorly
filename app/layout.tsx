import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import TopNav from "./_components/TopNav";

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-roboto",
	display: "swap"
});

export const metadata: Metadata = {
	title: {
		default: "Welcome / Tutorly",
		template: "%s | Tutorly"
	},
	description: "Aneducational platform connecting students with expert tutors for personalized learning experiences."
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${roboto.variable} antialiased min-h-screen flex flex-col w-full mx-auto`}>
				<TopNav />
				<div className=" flex-1 bg-amber-100 px-8 py-4 grid">
					<main className=" max-w-7xl  ">{children}</main>
				</div>
			</body>
		</html>
	);
}
