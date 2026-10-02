import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import { errorKindOf, errorRetryAfter, errorTraceCode } from './error-kind';
import { sessionDestinationLabel } from './session-destination';

describe('errorKindOf', () => {
	it('maps the API errors to their screens', () => {
		assert.equal(
			errorKindOf(new ApiError('x', 404, { code: 'not_found' })),
			'not-found',
		);
		assert.equal(
			errorKindOf(new ApiError('x', 403, { code: 'forbidden' })),
			'forbidden',
		);
		assert.equal(
			errorKindOf(new ApiError('x', 429, { code: 'too_many_requests' })),
			'rate-limited',
		);
		assert.equal(
			errorKindOf(new ApiError('x', 401, { code: 'unauthenticated' })),
			'session-expired',
		);
		assert.equal(
			errorKindOf(new ApiError('x', 500, { code: 'internal_error' })),
			'server',
		);
	});

	it('tells an unreachable API from a server failure', () => {
		assert.equal(errorKindOf(new ApiError('Could not reach', 503)), 'offline');
		assert.equal(errorKindOf(new ApiError('Timed out', 408)), 'offline');
		assert.equal(
			errorKindOf(new ApiError('x', 503, { code: 'internal_error' })),
			'server',
		);
	});

	it('treats anything else as a 500', () => {
		assert.equal(errorKindOf(new TypeError('boom')), 'server');
		assert.equal(errorKindOf('boom'), 'server');
	});
});

describe('errorTraceCode', () => {
	it("prefers the API's trace id, then Next's digest", () => {
		assert.equal(
			errorTraceCode(new ApiError('x', 500, { traceId: 'abc123' })),
			'abc123',
		);
		assert.equal(
			errorTraceCode(Object.assign(new Error('x'), { digest: '42' })),
			'42',
		);
		assert.equal(errorTraceCode(new Error('x')), null);
		assert.equal(errorTraceCode(new ApiError('x', 503)), null);
	});
});

describe('errorRetryAfter', () => {
	it("reads a 429's wait time when known", () => {
		assert.equal(
			errorRetryAfter(new ApiError('x', 429, { retryAfterSeconds: 12 })),
			12,
		);
		assert.equal(errorRetryAfter(new Error('x')), null);
	});
});

describe('sessionDestinationLabel', () => {
	it('names where the shopper goes back to', () => {
		assert.equal(sessionDestinationLabel('/account/orders'), 'Meus pedidos');
		assert.equal(
			sessionDestinationLabel('/account/orders/0199-abc'),
			'Meus pedidos',
		);
		assert.equal(sessionDestinationLabel('/account/addresses'), 'Endereços');
		assert.equal(sessionDestinationLabel('/checkout/payment'), 'o pagamento');
		assert.equal(
			sessionDestinationLabel('/cart'),
			'a página em que você estava',
		);
	});
});
