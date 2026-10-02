import {
	clearRefreshToken,
	isPersistentSession,
	passThrough,
	postToOrderCore,
	problem,
	readRefreshToken,
	respondWithSession,
} from '@/lib/session/ordercore-server';

export async function POST(request: Request) {
	const refreshToken = await readRefreshToken();
	if (!refreshToken) {
		return problem(401, 'unauthenticated', 'No session to refresh.');
	}

	const upstream = await postToOrderCore('/api/auth/refresh', request, {
		body: { refreshToken },
	});
	if (upstream.status === 401) {
		// Rotated, expired or revoked: the cookie is useless from now on.
		await clearRefreshToken();
		return passThrough(upstream);
	}

	return respondWithSession(upstream, {
		persistent: await isPersistentSession(),
	});
}
