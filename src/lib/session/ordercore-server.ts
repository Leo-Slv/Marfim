import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

/**
 * Server side of the session BFF (`src/app/api/session/*`): talks to
 * OrderCore's `auth/*` and keeps the refresh token in an httpOnly cookie, so
 * page JavaScript only ever sees the short-lived access token
 * (Docs/specs/auth/access.md, decision 1).
 */
const REFRESH_COOKIE = 'marfim_refresh';
const REFRESH_COOKIE_PATH = '/api/session';
/** "0" when the session must end with the browser ("Manter conectado" off). */
const PERSIST_COOKIE = 'marfim_persist';

const orderCoreUrl = (
	process.env.ORDERCORE_API_URL ??
	process.env.NEXT_PUBLIC_API_URL ??
	'http://localhost:8080'
).replace(/\/$/, '');

/** Mirrors OrderCore's `AuthTokensResponse`. */
const authTokensSchema = z.object({
	userId: z.string(),
	role: z.string(),
	customerId: z.string().nullable(),
	accessToken: z.string(),
	accessTokenExpiresAt: z.string(),
	refreshToken: z.string(),
	refreshTokenExpiresAt: z.string(),
});

/** POSTs JSON to OrderCore, forwarding the shopper's address for rate limits. */
async function postToOrderCore(
	path: string,
	request: Request,
	options: { body?: unknown; accessToken?: string | null } = {},
) {
	const headers = new Headers({
		Accept: 'application/json',
		'Content-Type': 'application/json',
	});
	if (options.accessToken) {
		headers.set('Authorization', `Bearer ${options.accessToken}`);
	}
	// Honoured by OrderCore only from trusted proxies (access pendency #1).
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		headers.set('X-Forwarded-For', forwardedFor);
	}

	try {
		return await fetch(`${orderCoreUrl}${path}`, {
			method: 'POST',
			headers,
			body: JSON.stringify(options.body ?? {}),
			cache: 'no-store',
		});
	} catch {
		return problem(503, 'service_unavailable', 'Could not reach the API.');
	}
}

/** Passes OrderCore's error through untouched (status, body, Retry-After). */
async function passThrough(upstream: Response) {
	const headers = new Headers({
		'Content-Type':
			upstream.headers.get('content-type') ?? 'application/problem+json',
	});
	const retryAfter = upstream.headers.get('retry-after');
	if (retryAfter) {
		headers.set('Retry-After', retryAfter);
	}
	return new Response(await upstream.text(), {
		status: upstream.status,
		headers,
	});
}

type SessionOptions = {
	/**
	 * Keep the refresh cookie until the token expires (default); false makes
	 * it a session cookie, gone when the browser closes, and remembers that
	 * for the renewals.
	 */
	persistent?: boolean;
	/** Only this role may sign in; any other gets `403 not_admin`. */
	requireRole?: 'Admin';
};

/**
 * On success, stores the refresh token in the cookie and answers with the
 * tokens minus the refresh token; otherwise passes the error through.
 */
async function respondWithSession(
	upstream: Response,
	{ persistent = true, requireRole }: SessionOptions = {},
) {
	if (!upstream.ok) {
		return passThrough(upstream);
	}

	const tokens = authTokensSchema.parse(await upstream.json());

	if (requireRole && tokens.role !== requireRole) {
		// OrderCore has no role-restricted sign-in (admin pendency #1): end
		// the session it just opened, so it never reaches the browser.
		await revokeSession(tokens.refreshToken, tokens.accessToken);
		return problem(403, 'not_admin', 'This account is not an administrator.');
	}

	const cookieStore = await cookies();
	const cookieOptions = {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: REFRESH_COOKIE_PATH,
	} as const;
	cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, {
		...cookieOptions,
		...(persistent ? { expires: new Date(tokens.refreshTokenExpiresAt) } : {}),
	});
	if (persistent) {
		cookieStore.delete({ name: PERSIST_COOKIE, path: REFRESH_COOKIE_PATH });
	} else {
		cookieStore.set(PERSIST_COOKIE, '0', cookieOptions);
	}

	// Everything except the refresh token, which only lives in the cookie.
	return Response.json(
		{
			userId: tokens.userId,
			role: tokens.role,
			customerId: tokens.customerId,
			accessToken: tokens.accessToken,
			accessTokenExpiresAt: tokens.accessTokenExpiresAt,
			refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
		},
		{ status: upstream.status },
	);
}

/** Ends a session upstream (best effort; needs both of its tokens). */
async function revokeSession(refreshToken: string, accessToken: string) {
	try {
		await fetch(`${orderCoreUrl}/api/auth/sign-out`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ refreshToken }),
			cache: 'no-store',
		});
	} catch {
		// The token still expires on its own.
	}
}

/** Whether the current session asked to stay signed in. */
async function isPersistentSession() {
	return (await cookies()).get(PERSIST_COOKIE)?.value !== '0';
}

async function readRefreshToken() {
	return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

async function clearRefreshToken() {
	const cookieStore = await cookies();
	cookieStore.delete({ name: REFRESH_COOKIE, path: REFRESH_COOKIE_PATH });
	cookieStore.delete({ name: PERSIST_COOKIE, path: REFRESH_COOKIE_PATH });
}

/** A ProblemDetails response in OrderCore's shape. */
function problem(status: number, code: string, title: string) {
	return Response.json(
		{ status, title, code },
		{ status, headers: { 'Content-Type': 'application/problem+json' } },
	);
}

/** Reads a JSON body, keeping only the given string fields. */
async function readFields<TKey extends string>(
	request: Request,
	keys: readonly TKey[],
): Promise<Record<TKey, string> | null> {
	try {
		const body = (await request.json()) as Record<string, unknown>;
		const fields = {} as Record<TKey, string>;
		for (const key of keys) {
			fields[key] = typeof body[key] === 'string' ? body[key] : '';
		}
		return fields;
	} catch {
		return null;
	}
}

export {
	clearRefreshToken,
	isPersistentSession,
	passThrough,
	postToOrderCore,
	problem,
	readFields,
	readRefreshToken,
	respondWithSession,
	revokeSession,
};
