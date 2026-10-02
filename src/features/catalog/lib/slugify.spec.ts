import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { slugify } from './slugify';

describe('slugify', () => {
	it('matches the catalog slugs of the seeded products', () => {
		assert.equal(slugify('Par de canecas Grão'), 'par-de-canecas-grao');
		assert.equal(slugify('Luminária Arco'), 'luminaria-arco');
		assert.equal(slugify('Têxteis'), 'texteis');
	});

	it('collapses punctuation and trims dashes', () => {
		assert.equal(slugify('  Vaso — Duna! '), 'vaso-duna');
	});
});
