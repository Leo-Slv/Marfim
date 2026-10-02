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
/** Per tab: the last session ended because the backend refused to renew it. */
const EXPIRED_STORAGE_KEY = 'marfim.auth.expired';

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

/**
 * Stores a new access token; null signs out locally. `expired` marks a
 * session the backend refused to renew, so gated screens can say so
 * ("Sessão expirada") instead of silently sending the shopper to Entrar.
 */
function setSessionAccessToken(
	accessToken: string | null,
	options?: { expired?: boolean },
) {
	cached = accessToken ? sessionFromAccessToken(accessToken) : null;
	if (canUseWebStorage()) {
		if (cached) {
			window.localStorage.setItem(SESSION_STORAGE_KEY, cached.accessToken);
		} else {
			window.localStorage.removeItem(SESSION_STORAGE_KEY);
		}
	}
	writeExpired(!cached && options?.expired === true);
	emit();
}

function writeExpired(expired: boolean) {
	try {
		if (expired) {
			window.sessionStorage.setItem(EXPIRED_STORAGE_KEY, '1');
		} else {
			window.sessionStorage.removeItem(EXPIRED_STORAGE_KEY);
		}
	} catch {
		// Storage unavailable (private mode, SSR): the notice is best effort.
	}
}

/** Whether this tab's last session expired (read after hydration only). */
function wasSessionExpired() {
	try {
		return window.sessionStorage.getItem(EXPIRED_STORAGE_KEY) === '1';
	} catch {
		return false;
	}
}

export type { Session };
export {
	getServerSessionSnapshot,
	getSessionSnapshot,
	setSessionAccessToken,
	subscribeToSession,
	wasSessionExpired,
};
