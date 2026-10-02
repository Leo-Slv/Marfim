import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseAccessTokenClaims } from './jwt-claims';

function token(payload: Record<string, unknown>) {
	const encode = (value: unknown) =>
		Buffer.from(JSON.stringify(value)).toString('base64url');
	return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('parseAccessTokenClaims', () => {
	it('reads the OrderCore claims of a customer token', () => {
		assert.deepEqual(
			parseAccessTokenClaims(
				token({
					sub: 'user-1',
					email: 'ana@email.com',
					role: 'Customer',
					customer_id: 'customer-1',
					email_confirmed: 'false',
					exp: 1_800_000_000,
				}),
			),
			{
				userId: 'user-1',
				email: 'ana@email.com',
				role: 'Customer',
				customerId: 'customer-1',
				emailConfirmed: false,
				expiresAt: 1_800_000_000_000,
			},
		);
	});

	it('handles non-ASCII e-mails and admins without a customer id', () => {
		const claims = parseAccessTokenClaims(
			token({
				sub: 'user-2',
				email: 'joão@email.com',
				role: 'Admin',
				email_confirmed: 'true',
				exp: 1,
			}),
		);
		assert.equal(claims?.email, 'joão@email.com');
		assert.equal(claims?.customerId, null);
		assert.equal(claims?.emailConfirmed, true);
	});

	it('rejects malformed tokens', () => {
		assert.equal(parseAccessTokenClaims('not-a-jwt'), null);
		assert.equal(parseAccessTokenClaims('a.%%%.c'), null);
		assert.equal(parseAccessTokenClaims(token({ sub: 'x' })), null);
	});
});
