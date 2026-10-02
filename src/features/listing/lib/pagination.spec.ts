import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatRange, pageNumbers, parsePage } from './pagination';

describe('parsePage', () => {
	it('reads a positive integer', () => {
		assert.equal(parsePage('3'), 3);
	});

	it('falls back to page 1 for missing or invalid values', () => {
		assert.equal(parsePage(null), 1);
		assert.equal(parsePage('0'), 1);
		assert.equal(parsePage('-2'), 1);
		assert.equal(parsePage('2.5'), 1);
		assert.equal(parsePage('abc'), 1);
	});
});

describe('pageNumbers', () => {
	it('lists every page', () => {
		assert.deepEqual(pageNumbers(3), [1, 2, 3]);
		assert.deepEqual(pageNumbers(0), []);
	});
});

describe('formatRange', () => {
	it('shows the first page range', () => {
		assert.equal(formatRange(1, 8, 14), '1–8 DE 14');
	});

	it('clamps the last page to the total', () => {
		assert.equal(formatRange(2, 8, 14), '9–14 DE 14');
	});
});
