import type { Todo } from "#/server/schema/todo";

type TodoItemProps = {
	todo: Todo;
	onToggle: (completed: boolean) => void;
	onDelete: () => void;
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
	return (
		<li className="flex items-center gap-3 rounded border border-gray-200 px-3 py-2">
			<input
				type="checkbox"
				checked={todo.completed}
				onChange={(event) => onToggle(event.target.checked)}
				className="h-4 w-4"
			/>
			<span
				className={`flex-1 ${todo.completed ? "text-gray-400 line-through" : ""}`}
			>
				{todo.title}
			</span>
			<button
				type="button"
				onClick={onDelete}
				className="text-sm text-red-600 hover:underline"
			>
				Delete
			</button>
		</li>
	);
}
