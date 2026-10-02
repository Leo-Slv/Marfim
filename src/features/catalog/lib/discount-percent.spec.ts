import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatDiscountPercent } from './discount-percent';

describe('formatDiscountPercent', () => {
	it('rounds the discount to the nearest percent', () => {
		assert.equal(formatDiscountPercent(1290, 1490), '-13%');
		assert.equal(formatDiscountPercent(359, 449), '-20%');
	});
});
