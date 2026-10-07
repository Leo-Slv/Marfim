'use client';

import { useSyncExternalStore } from 'react';

/**
 * Whether a CSS media query matches; null during SSR and the hydration
 * render, when the viewport isn't known yet. For when the two layouts can't
 * both stay mounted (CSS hides the other one otherwise).
 */
function useMediaQuery(query: string): boolean | null {
	return useSyncExternalStore(
		(onChange) => {
			const list = window.matchMedia(query);
			list.addEventListener('change', onChange);
			return () => list.removeEventListener('change', onChange);
		},
		() => window.matchMedia(query).matches,
		() => null,
	);
}

export { useMediaQuery };
