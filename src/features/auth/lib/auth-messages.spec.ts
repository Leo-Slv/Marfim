import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import { authErrorCopy, hasErrorCode } from './auth-messages';

const apiError = (
	status: number,
	code: string | null,
	retryAfterSeconds: number | null = null,
) => new ApiError('x', status, { code, retryAfterSeconds });

describe('authErrorCopy', () => {
	it('maps the backend codes to the mockup copy', () => {
		assert.match(
			authErrorCopy(apiError(401, 'invalid_credentials')).text,
			/incorretos/,
		);
		assert.match(
			authErrorCopy(apiError(400, 'account_inactive')).text,
			/desativada/,
		);
		assert.equal(
			authErrorCopy(apiError(409, 'email_already_registered')).offerSignIn,
			true,
		);
	});

	it('locks for Retry-After seconds, or 60 when unreadable', () => {
		assert.equal(
			authErrorCopy(apiError(429, 'too_many_requests', 42)).lockSeconds,
			42,
		);
		assert.equal(
			authErrorCopy(apiError(429, 'too_many_requests')).lockSeconds,
			60,
		);
	});

	it('has a generic fallback', () => {
		assert.match(authErrorCopy(new Error('boom')).text, /Algo deu errado/);
		assert.match(authErrorCopy(apiError(500, 'x')).text, /Algo deu errado/);
		assert.match(authErrorCopy(apiError(503, null)).text, /falar com a loja/);
	});
});

describe('hasErrorCode', () => {
	it('checks the ProblemDetails code', () => {
		assert.equal(
			hasErrorCode(
				apiError(400, 'invalid_or_expired_token'),
				'invalid_or_expired_token',
			),
			true,
		);
		assert.equal(
			hasErrorCode(new Error('x'), 'invalid_or_expired_token'),
			false,
		);
	});
});
