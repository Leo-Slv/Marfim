import {
	isApiError,
	parseResponseBody,
	toApiError,
} from '@/lib/http/api-error';

import {
	getSessionSnapshot,
	setSessionAccessToken,
	type Session,
} from './session-store';

/** Renew this long before the access token's expiry. */
const REFRESH_MARGIN_MS = 30_000;

type SignInInput = { email: string; password: string };
type SignUpInput = { name: string; email: string; password: string };

/** What the BFF returns: OrderCore's tokens minus the refresh token. */
type SessionTokens = { accessToken: string };

/** POSTs to the storefront's own BFF (`src/app/api/session/*`). */
async function postSession(
	action: 'sign-in' | 'sign-up' | 'refresh' | 'sign-out',
	body?: unknown,
	accessToken?: string,
) {
	const headers = new Headers({ Accept: 'application/json' });
	if (body !== undefined) {
		headers.set('Content-Type', 'application/json');
	}
	if (accessToken) {
		headers.set('Authorization', `Bearer ${accessToken}`);
	}

	const response = await fetch(`/api/session/${action}`, {
		method: 'POST',
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
		credentials: 'same-origin',
		cache: 'no-store',
	});
	const payload = await parseResponseBody(response);
	if (!response.ok) {
		throw toApiError(response, payload);
	}
	return payload as SessionTokens | null;
}

function startSession(tokens: SessionTokens | null) {
	if (!tokens) {
		throw new Error('The session endpoint answered without tokens.');
	}
	setSessionAccessToken(tokens.accessToken);
	const session = getSessionSnapshot();
	if (!session) {
		throw new Error('The API returned an unreadable access token.');
	}
	return session;
}

async function signIn(input: SignInInput) {
	return startSession(await postSession('sign-in', input));
}

async function signUp(input: SignUpInput) {
	return startSession(await postSession('sign-up', input));
}

let refreshing: Promise<Session | null> | null = null;

/**
 * Exchanges the cookie's refresh token for a new access token. Concurrent
 * callers share one request (the refresh token rotates: a second parallel
 * use would end the session). Null when the session can't be renewed; it's
 * cleared only when the server rejects it (401), not on a network blip.
 */
function refreshSession(): Promise<Session | null> {
	refreshing ??= postSession('refresh')
		.then(startSession)
		.catch((error: unknown) => {
			if (isApiError(error) && error.status === 401) {
				setSessionAccessToken(null);
			}
			return null;
		})
		.finally(() => {
			refreshing = null;
		});
	return refreshing;
}

function hasSession() {
	return getSessionSnapshot() !== null;
}

/** A usable bearer token, renewed first when close to expiry; null if signed out. */
async function getValidAccessToken() {
	const session = getSessionSnapshot();
	if (!session) {
		return null;
	}
	if (session.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
		return session.accessToken;
	}
	return (await refreshSession())?.accessToken ?? null;
}

/** Ends the session on the server (best effort) and locally. */
async function signOut() {
	const session = getSessionSnapshot();
	try {
		await postSession('sign-out', undefined, session?.accessToken);
	} finally {
		setSessionAccessToken(null);
	}
}

export type { SignInInput, SignUpInput };
export {
	getValidAccessToken,
	hasSession,
	refreshSession,
	signIn,
	signOut,
	signUp,
};
