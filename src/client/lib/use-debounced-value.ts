import { useEffect, useState } from "react";

export const SEARCH_DEBOUNCE_MS = 250;

export function useDebouncedValue<T>(value: T, delay = SEARCH_DEBOUNCE_MS) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeout = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timeout);
	}, [value, delay]);

	return debouncedValue;
}
