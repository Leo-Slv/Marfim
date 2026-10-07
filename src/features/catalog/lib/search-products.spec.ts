import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { searchProducts } from './search-products';

const categories = [
	{ id: 'c1', name: 'Iluminação' },
	{ id: 'c2', name: 'Cozinha' },
];

const products = [
	{
		name: 'Luminária Arco',
		brand: 'Oficina Faísca',
		categoryId: 'c1',
		shortDescription: 'Latão escovado',
	},
	{
		name: 'Jarra Seixo',
		brand: 'Estúdio Barro Cru',
		categoryId: 'c2',
		shortDescription: 'Cerâmica queimada a lenha',
	},
];

const names = (term: string) =>
	searchProducts(products, categories, term).map((product) => product.name);

describe('searchProducts', () => {
	it('matches the name ignoring case and accents', () => {
		assert.deepEqual(names('LUMINARIA'), ['Luminária Arco']);
	});

	it('matches the atelier, the category and the short description', () => {
		assert.deepEqual(names('faisca'), ['Luminária Arco']);
		assert.deepEqual(names('cozinha'), ['Jarra Seixo']);
		assert.deepEqual(names('ceramica'), ['Jarra Seixo']);
	});

	it('finds nothing for a blank term or an unknown word', () => {
		assert.deepEqual(names('  '), []);
		assert.deepEqual(names('mesa'), []);
	});
});
