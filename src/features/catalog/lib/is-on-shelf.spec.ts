import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOnShelf } from './is-on-shelf';

describe('isOnShelf', () => {
	it('keeps published products', () => {
		assert.equal(isOnShelf({ status: 'Active' }), true);
	});

	it('drops drafts and discontinued products', () => {
		assert.equal(isOnShelf({ status: 'Draft' }), false);
		assert.equal(isOnShelf({ status: 'Discontinued' }), false);
	});
});
