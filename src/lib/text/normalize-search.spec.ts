import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeSearch } from './normalize-search';

describe('normalizeSearch', () => {
	it('lowercases and strips accents', () => {
		assert.equal(
			normalizeSearch('Luminária FAÍSCA Têxteis'),
			'luminaria faisca texteis',
		);
	});
});
