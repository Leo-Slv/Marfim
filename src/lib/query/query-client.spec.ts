import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import { shouldRetry } from './query-client';

describe('shouldRetry', () => {
	it('retries once what may be transient', () => {
		assert.equal(shouldRetry(0, new ApiError('x', 500)), true);
		assert.equal(shouldRetry(0, new ApiError('x', 503)), true);
		assert.equal(shouldRetry(0, new ApiError('x', 408)), true);
		assert.equal(shouldRetry(0, new TypeError('x')), true);
		assert.equal(shouldRetry(1, new ApiError('x', 500)), false);
	});

	it('never retries a client error', () => {
		assert.equal(shouldRetry(0, new ApiError('x', 404)), false);
		assert.equal(shouldRetry(0, new ApiError('x', 403)), false);
		assert.equal(shouldRetry(0, new ApiError('x', 429)), false);
	});
});
