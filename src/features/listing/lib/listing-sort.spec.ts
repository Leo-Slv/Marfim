import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseSort } from './listing-sort';

describe('parseSort', () => {
	it('maps each URL value to the API sort', () => {
		assert.equal(parseSort('nome').apiSort, 'Name');
		assert.equal(parseSort('menor-preco').apiSort, 'PriceAsc');
		assert.equal(parseSort('maior-preco').apiSort, 'PriceDesc');
	});

	it('defaults to "Mais recentes" (Newest) for missing or unknown values', () => {
		assert.equal(parseSort(null).value, 'recentes');
		assert.equal(parseSort('qualquer').apiSort, 'Newest');
	});
});
