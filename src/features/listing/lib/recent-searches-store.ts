import { addRecentSearch, parseRecentSearches } from './recent-searches';

/**
 * Recent search terms of this browser, persisted in localStorage and read
 * through `useSyncExternalStore` — the cart's pattern (`cart-store.ts`).
 * OrderCore keeps no search history (mobile navigation pendency #3).
 */
const RECENT_SEARCHES_KEY = 'marfim.search.recent';
const EMPTY: readonly string[] = [];

let cached: readonly string[] | null = null;
const listeners = new Set<() => void>();

function canUseWebStorage() {
	return (
		typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
	);
}

function read(): readonly string[] {
	if (!canUseWebStorage()) {
		return EMPTY;
	}
	try {
		return parseRecentSearches(
			window.localStorage.getItem(RECENT_SEARCHES_KEY),
		);
	} catch {
		return EMPTY;
	}
}

function emit() {
	listeners.forEach((listener) => listener());
}

function subscribeToRecentSearches(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getRecentSearchesSnapshot() {
	cached ??= read();
	return cached;
}

function getServerRecentSearchesSnapshot() {
	return EMPTY;
}

function commit(next: readonly string[]) {
	cached = next;
	if (canUseWebStorage()) {
		try {
			window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
		} catch {
			// Storage full or blocked: the list still works for this visit.
		}
	}
	emit();
}

function rememberSearch(term: string) {
	commit(addRecentSearch(getRecentSearchesSnapshot(), term));
}

function clearRecentSearches() {
	commit(EMPTY);
}

export {
	clearRecentSearches,
	getRecentSearchesSnapshot,
	getServerRecentSearchesSnapshot,
	rememberSearch,
	subscribeToRecentSearches,
};
