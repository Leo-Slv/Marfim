'use client';

import { useSyncExternalStore } from 'react';

import {
	getServerSessionSnapshot,
	getSessionSnapshot,
	subscribeToSession,
} from './session-store';

/** The current session, or null when signed out (always null on the server). */
function useSession() {
	return useSyncExternalStore(
		subscribeToSession,
		getSessionSnapshot,
		getServerSessionSnapshot,
	);
}

export { useSession };
