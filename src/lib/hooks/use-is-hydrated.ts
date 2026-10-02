'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during SSR and the hydration render, true afterwards. The cart and
 * the session live in localStorage, so screens use this to show a
 * placeholder instead of flashing the signed-out or empty state before
 * they are read.
 */
function useIsHydrated() {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
}

export { useIsHydrated };
