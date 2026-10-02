import {
	postToOrderCore,
	problem,
	readRefreshToken,
	respondWithSession,
	revokeSession,
} from '@/lib/session/ordercore-server';

/**
 * The admin panel's sign-in (Docs/specs/admin/admin-login.md): OrderCore's
 * sign-in, but only an `Admin` gets a session (`403 not_admin` otherwise),
 * and "Manter conectado" off makes the refresh cookie a session cookie.
 * A session it replaces on this browser is ended upstream.
 */
export async function POST(request: Request) {
	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return problem(400, 'validation_error', 'Invalid request.');
	}
	const email = typeof body.email === 'string' ? body.email : '';
	const password = typeof body.password === 'string' ? body.password : '';
	const keepSignedIn = body.keepSignedIn !== false;

	const previousRefreshToken = await readRefreshToken();
	const previousAccessToken = request.headers
		.get('authorization')
		?.replace(/^Bearer\s+/i, '');

	const response = await respondWithSession(
		await postToOrderCore('/api/auth/sign-in', request, {
			body: { email, password },
		}),
		{ persistent: keepSignedIn, requireRole: 'Admin' },
	);

	if (response.ok && previousRefreshToken && previousAccessToken) {
		await revokeSession(previousRefreshToken, previousAccessToken);
	}
	return response;
}
