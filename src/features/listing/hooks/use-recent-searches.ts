'use client';

import { useSyncExternalStore } from 'react';

import {
	clearRecentSearches,
	getRecentSearchesSnapshot,
	getServerRecentSearchesSnapshot,
	rememberSearch,
	subscribeToRecentSearches,
} from '../lib/recent-searches-store';

function useRecentSearches() {
	const recent = useSyncExternalStore(
		subscribeToRecentSearches,
		getRecentSearchesSnapshot,
		getServerRecentSearchesSnapshot,
	);

	return { recent, remember: rememberSearch, clear: clearRecentSearches };
}

export { useRecentSearches };
