'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during SSR and the hydration render, true afterwards. The bag lives
 * in localStorage, so screens use this to show a placeholder instead of
 * flashing "Sua sacola está vazia" before the real bag is read.
 */
function useIsHydrated() {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
}

export { useIsHydrated };
