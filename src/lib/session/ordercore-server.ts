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

/**
 * On success, stores the refresh token in the cookie and answers with the
 * tokens minus the refresh token; otherwise passes the error through.
 */
async function respondWithSession(upstream: Response) {
	if (!upstream.ok) {
		return passThrough(upstream);
	}

	const tokens = authTokensSchema.parse(await upstream.json());
	const cookieStore = await cookies();
	cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: REFRESH_COOKIE_PATH,
		expires: new Date(tokens.refreshTokenExpiresAt),
	});

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

async function readRefreshToken() {
	return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

async function clearRefreshToken() {
	(await cookies()).delete({ name: REFRESH_COOKIE, path: REFRESH_COOKIE_PATH });
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
	passThrough,
	postToOrderCore,
	problem,
	readFields,
	readRefreshToken,
	respondWithSession,
};
