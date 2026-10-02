/**
 * The claims OrderCore puts in its access tokens (`OrderCoreClaimTypes` /
 * `JwtAccessTokenIssuer` in the backend). Decoded only to drive the UI —
 * the backend validates the signature; the client never trusts these for
 * authorization.
 */
type AccessTokenClaims = {
	userId: string;
	email: string;
	role: 'Customer' | 'Admin';
	customerId: string | null;
	emailConfirmed: boolean;
	/** Expiry, ms since epoch. */
	expiresAt: number;
};

function decodeBase64Url(segment: string) {
	const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64.padEnd(
		base64.length + ((4 - (base64.length % 4)) % 4),
		'=',
	);
	const binary = atob(padded);
	const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

/** Null for anything that isn't a well-formed OrderCore access token. */
function parseAccessTokenClaims(token: string): AccessTokenClaims | null {
	const [, payloadSegment] = token.split('.');
	if (!payloadSegment) {
		return null;
	}

	try {
		const payload = JSON.parse(decodeBase64Url(payloadSegment)) as Record<
			string,
			unknown
		>;
		const { sub, email, role, exp } = payload;
		if (
			typeof sub !== 'string' ||
			typeof email !== 'string' ||
			(role !== 'Customer' && role !== 'Admin') ||
			typeof exp !== 'number'
		) {
			return null;
		}

		return {
			userId: sub,
			email,
			role,
			customerId:
				typeof payload.customer_id === 'string' ? payload.customer_id : null,
			emailConfirmed: payload.email_confirmed === 'true',
			expiresAt: exp * 1000,
		};
	} catch {
		return null;
	}
}

export type { AccessTokenClaims };
export { parseAccessTokenClaims };
