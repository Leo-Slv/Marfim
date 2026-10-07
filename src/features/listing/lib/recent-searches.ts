import { normalizeSearch } from '@/lib/text/normalize-search';

/** BUSCAS RECENTES keeps the last few terms (MobileBusca.dc.html). */
const MAX_RECENT_SEARCHES = 5;

/** Newest first; the same term in another case or accent moves to the top. */
function addRecentSearch(recent: readonly string[], term: string): string[] {
	const value = term.trim();
	if (!value) {
		return [...recent];
	}
	const key = normalizeSearch(value);
	return [
		value,
		...recent.filter((item) => normalizeSearch(item) !== key),
	].slice(0, MAX_RECENT_SEARCHES);
}

/** Tolerates anything in storage: only strings survive. */
function parseRecentSearches(raw: string | null): string[] {
	if (!raw) {
		return [];
	}
	try {
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed
					.filter((item): item is string => typeof item === 'string')
					.slice(0, MAX_RECENT_SEARCHES)
			: [];
	} catch {
		return [];
	}
}

export { addRecentSearch, MAX_RECENT_SEARCHES, parseRecentSearches };
