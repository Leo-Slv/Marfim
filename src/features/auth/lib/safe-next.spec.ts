import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { safeNext } from './safe-next';

describe('safeNext', () => {
	it('keeps same-origin paths with their query', () => {
		assert.equal(safeNext('/cart'), '/cart');
		assert.equal(
			safeNext('/products?categoria=casa'),
			'/products?categoria=casa',
		);
	});

	it('rejects absolute and protocol-relative URLs', () => {
		assert.equal(safeNext('https://evil.example'), null);
		assert.equal(safeNext('//evil.example'), null);
		assert.equal(safeNext('/\\evil.example'), null);
		assert.equal(safeNext('javascript:alert(1)'), null);
	});

	it('never returns to an auth form', () => {
		assert.equal(safeNext('/login'), null);
		assert.equal(safeNext('/register?next=/cart'), null);
	});

	it('is null when missing', () => {
		assert.equal(safeNext(null), null);
		assert.equal(safeNext(''), null);
	});
});
