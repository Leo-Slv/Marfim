import {
	passThrough,
	postToOrderCore,
	problem,
	readFields,
	readRefreshToken,
} from '@/lib/session/ordercore-server';

/**
 * Changes the signed-in user's password. OrderCore keeps the session whose
 * refresh token is sent and ends every other one — that token lives in the
 * httpOnly cookie, so the call goes through here.
 */
export async function POST(request: Request) {
	const accessToken = request.headers
		.get('authorization')
		?.replace(/^Bearer\s+/i, '');
	if (!accessToken) {
		return problem(401, 'unauthenticated', 'Sign in to change the password.');
	}
	const body = await readFields(request, ['currentPassword', 'newPassword']);
	if (!body) {
		return problem(400, 'validation_error', 'Invalid request.');
	}

	const upstream = await postToOrderCore('/api/auth/password/change', request, {
		body: { ...body, refreshToken: await readRefreshToken() },
		accessToken,
	});
	if (!upstream.ok) {
		return passThrough(upstream);
	}
	return new Response(null, { status: 204 });
}
