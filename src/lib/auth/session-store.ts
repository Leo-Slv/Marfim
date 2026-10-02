import { parseAccessTokenClaims, type AccessTokenClaims } from './jwt-claims';

/**
 * The signed-in session as the page sees it: the short-lived access token
 * and its claims. The refresh token never gets here — the BFF keeps it in an
 * httpOnly cookie (Docs/specs/auth/access.md). Persisted in localStorage and
 * read through `useSyncExternalStore` (`use-session.ts`), same pattern as
 * the cart store; other tabs follow via `storage` events.
 */
type Session = AccessTokenClaims & { accessToken: string };

const SESSION_STORAGE_KEY = 'marfim.auth.session';

let cached: Session | null | undefined;
const listeners = new Set<() => void>();

function canUseWebStorage() {
	return (
		typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
	);
}

function sessionFromAccessToken(accessToken: string): Session | null {
	const claims = parseAccessTokenClaims(accessToken);
	return claims ? { ...claims, accessToken } : null;
}

function read(): Session | null {
	if (!canUseWebStorage()) {
		return null;
	}
	const accessToken = window.localStorage.getItem(SESSION_STORAGE_KEY);
	return accessToken ? sessionFromAccessToken(accessToken) : null;
}

function emit() {
	listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
	if (event.key === SESSION_STORAGE_KEY) {
		cached = read();
		emit();
	}
}

function subscribeToSession(listener: () => void) {
	listeners.add(listener);
	if (listeners.size === 1 && typeof window !== 'undefined') {
		window.addEventListener('storage', handleStorage);
	}
	return () => {
		listeners.delete(listener);
		if (listeners.size === 0 && typeof window !== 'undefined') {
			window.removeEventListener('storage', handleStorage);
		}
	};
}

function getSessionSnapshot(): Session | null {
	if (cached === undefined) {
		cached = read();
	}
	return cached;
}

function getServerSessionSnapshot(): Session | null {
	return null;
}

/** Stores a new access token; null signs out locally. */
function setSessionAccessToken(accessToken: string | null) {
	cached = accessToken ? sessionFromAccessToken(accessToken) : null;
	if (canUseWebStorage()) {
		if (cached) {
			window.localStorage.setItem(SESSION_STORAGE_KEY, cached.accessToken);
		} else {
			window.localStorage.removeItem(SESSION_STORAGE_KEY);
		}
	}
	emit();
}

export type { Session };
export {
	getServerSessionSnapshot,
	getSessionSnapshot,
	setSessionAccessToken,
	subscribeToSession,
};
