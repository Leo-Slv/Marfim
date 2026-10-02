import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { attemptSignature, resolveAttempt } from './checkout-attempt';

describe('attemptSignature', () => {
	it('ignores the order of the bag lines', () => {
		assert.equal(
			attemptSignature(
				[
					{ productId: 'b', quantity: 1 },
					{ productId: 'a', quantity: 2 },
				],
				's',
				'c',
			),
			attemptSignature(
				[
					{ productId: 'a', quantity: 2 },
					{ productId: 'b', quantity: 1 },
				],
				's',
				'c',
			),
		);
	});

	it('changes with quantities and addresses', () => {
		const base = attemptSignature([{ productId: 'a', quantity: 1 }], 's', 'c');
		assert.notEqual(
			attemptSignature([{ productId: 'a', quantity: 2 }], 's', 'c'),
			base,
		);
		assert.notEqual(
			attemptSignature([{ productId: 'a', quantity: 1 }], 's', 'other'),
			base,
		);
	});
});

describe('resolveAttempt', () => {
	const newKey = () => 'fresh-key';

	it('reuses the stored key for the same signature', () => {
		assert.deepEqual(
			resolveAttempt({ key: 'k1', signature: 'sig' }, 'sig', newKey),
			{ key: 'k1', signature: 'sig' },
		);
	});

	it('starts a new attempt when the bag or addresses changed', () => {
		assert.deepEqual(
			resolveAttempt({ key: 'k1', signature: 'sig' }, 'other', newKey),
			{ key: 'fresh-key', signature: 'other' },
		);
		assert.deepEqual(resolveAttempt(null, 'sig', newKey), {
			key: 'fresh-key',
			signature: 'sig',
		});
	});
});
