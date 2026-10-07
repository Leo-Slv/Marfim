import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { addRecentSearch, parseRecentSearches } from './recent-searches';

describe('addRecentSearch', () => {
	it('puts the new term first', () => {
		assert.deepEqual(addRecentSearch(['vaso'], 'manta'), ['manta', 'vaso']);
	});

	it('moves a repeated term to the top, whatever its case or accents', () => {
		assert.deepEqual(addRecentSearch(['vaso', 'Luminária'], ' luminaria '), [
			'luminaria',
			'vaso',
		]);
	});

	it('keeps the last five and ignores blank terms', () => {
		const recent = ['a1', 'a2', 'a3', 'a4', 'a5'];
		assert.deepEqual(addRecentSearch(recent, 'novo'), [
			'novo',
			'a1',
			'a2',
			'a3',
			'a4',
		]);
		assert.deepEqual(addRecentSearch(recent, '  '), recent);
	});
});

describe('parseRecentSearches', () => {
	it('reads a stored list and drops anything that is not a string', () => {
		assert.deepEqual(parseRecentSearches('["vaso", 3, "manta"]'), [
			'vaso',
			'manta',
		]);
	});

	it('is empty for missing or broken storage', () => {
		assert.deepEqual(parseRecentSearches(null), []);
		assert.deepEqual(parseRecentSearches('{oops'), []);
		assert.deepEqual(parseRecentSearches('{"a":1}'), []);
	});
});
