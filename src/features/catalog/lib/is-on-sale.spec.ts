import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOnSale } from './is-on-sale';

describe('isOnSale', () => {
	it('is true when the compare-at price is above the current price', () => {
		assert.equal(isOnSale({ currentPrice: 90, compareAtPrice: 120 }), true);
	});

	it('is false without a compare-at price', () => {
		assert.equal(isOnSale({ currentPrice: 90, compareAtPrice: null }), false);
	});

	it('is false when the compare-at price is not above the current price', () => {
		assert.equal(isOnSale({ currentPrice: 90, compareAtPrice: 90 }), false);
	});
});
