import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isDemoStore } from './demo-flag';

describe('isDemoStore', () => {
	it('is on by default', () => {
		assert.equal(isDemoStore(undefined), true);
		assert.equal(isDemoStore(''), true);
		assert.equal(isDemoStore('true'), true);
	});

	it('is off for false, 0 and off', () => {
		assert.equal(isDemoStore('false'), false);
		assert.equal(isDemoStore(' FALSE '), false);
		assert.equal(isDemoStore('0'), false);
		assert.equal(isDemoStore('off'), false);
	});
});
