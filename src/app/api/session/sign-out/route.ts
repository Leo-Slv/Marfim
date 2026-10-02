import {
	clearRefreshToken,
	postToOrderCore,
	readRefreshToken,
} from '@/lib/session/ordercore-server';

/** Ends the session upstream (best effort) and always clears the cookie. */
export async function POST(request: Request) {
	const refreshToken = await readRefreshToken();
	const accessToken = request.headers
		.get('authorization')
		?.replace(/^Bearer\s+/i, '');

	if (refreshToken && accessToken) {
		await postToOrderCore('/api/auth/sign-out', request, {
			body: { refreshToken },
			accessToken,
		});
	}

	await clearRefreshToken();
	return new Response(null, { status: 204 });
}
