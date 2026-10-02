'use client';

import { useEffect, useState } from 'react';

/** `value`, but only after it stopped changing for `delayMs`. */
function useDebouncedValue<T>(value: T, delayMs: number) {
	const [debounced, setDebounced] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delayMs);
		return () => clearTimeout(timer);
	}, [value, delayMs]);

	return debounced;
}

export { useDebouncedValue };
