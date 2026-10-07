import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatRange, pageNumbers, paginate, parsePage } from './pagination';

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

describe('paginate', () => {
	const items = Array.from({ length: 10 }, (_, i) => i + 1);

	it('slices one page and reports the totals', () => {
		assert.deepEqual(paginate(items, 2, 4), {
			items: [5, 6, 7, 8],
			page: 2,
			pageSize: 4,
			totalItems: 10,
			totalPages: 3,
		});
	});

	it('has no pages for an empty list', () => {
		assert.equal(paginate([], 1, 8).totalPages, 0);
	});
});
