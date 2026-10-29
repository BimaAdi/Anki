import { Link } from "@tanstack/react-router";

export function Page() {
	return (
		<main className="mx-auto mt-10 max-w-xl p-6">
			<h1 className="text-3xl font-bold">Vibe</h1>
			<p className="mt-2 text-gray-600">
				A small Todo app built with TanStack Start.
			</p>
			<div className="mt-6 flex gap-2">
				<Link
					to="/todo"
					className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Go to Todo List
				</Link>
				<Link
					to="/counter"
					className="inline-block rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				>
					Go to Counter
				</Link>
			</div>
		</main>
	);
}
