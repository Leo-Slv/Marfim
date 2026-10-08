/**
 * Whether the visitor closed the demonstration-store band in this browser
 * session. Same shape as the cart store: an external store over web storage
 * read with `useSyncExternalStore`; storage failures just mean "not closed".
 */
const DISMISSED_KEY = 'marfim.demo.dismissed';
const listeners = new Set<() => void>();

function subscribeDemoBanner(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function isDemoBannerDismissed(): boolean {
	try {
		return window.sessionStorage.getItem(DISMISSED_KEY) === '1';
	} catch {
		return false;
	}
}

function dismissDemoBanner() {
	try {
		window.sessionStorage.setItem(DISMISSED_KEY, '1');
	} catch {
		// Storage blocked: the band simply comes back on the next render.
	}
	listeners.forEach((listener) => listener());
}

export { dismissDemoBanner, isDemoBannerDismissed, subscribeDemoBanner };
