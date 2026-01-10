import Link from "next/link";

export default function TopNav() {
	return (
		<ul className="flex justify-center py-4 gap-6 bg-gray-500 text-white">
			<li>
				<Link href="/signup">Signup</Link>
			</li>
			<li>
				<Link href="/signin">Signin</Link>
			</li>
		</ul>
	);
}
