import { useMutation, useQuery } from "@tanstack/react-query";
import type { counterSchema } from "#/server/schema/counter";
import {
	decrementCounter,
	getCounter,
	incrementCounter,
} from "#/server/serverFn/counter";

const counterQueryKey = ["counter"] as const;

type Counter = import("zod").infer<typeof counterSchema>;

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong";
}

export function Page({ initialCounter }: { initialCounter: Counter }) {
	const { data: counter, refetch } = useQuery({
		queryKey: counterQueryKey,
		queryFn: () => getCounter(),
		initialData: initialCounter,
	});

	const increment = useMutation({
		mutationFn: () => incrementCounter(),
		onSuccess: () => {
			refetch();
		},
	});

	const decrement = useMutation({
		mutationFn: () => decrementCounter(),
		onSuccess: () => {
			refetch();
		},
	});

	const error = increment.error ?? decrement.error;
	const isPending = increment.isPending || decrement.isPending;

	return (
		<main className="mx-auto mt-10 max-w-xl p-6">
			<h1 className="text-3xl font-bold">Counter</h1>

			<p className="mt-6 text-6xl font-bold tabular-nums">
				{counter?.count ?? 0}
			</p>

			<div className="mt-6 flex gap-2">
				<button
					type="button"
					disabled={isPending}
					onClick={() => {
						decrement.reset();
						increment.mutate();
					}}
					className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Increment
				</button>
				<button
					type="button"
					disabled={isPending}
					onClick={() => {
						increment.reset();
						decrement.mutate();
					}}
					className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				>
					Decrement
				</button>
			</div>

			{error && <p className="mt-3 text-red-600">{errorMessage(error)}</p>}
		</main>
	);
}
