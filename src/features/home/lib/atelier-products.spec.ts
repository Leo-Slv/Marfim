import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	atelierProductNames,
	formatAtelierProductsLine,
} from './atelier-products';

const products = [
	{ name: 'Jarra Seixo', brand: 'Estúdio Barro Cru' },
	{ name: 'Cadeira Lina', brand: 'Oficina Tora' },
	{ name: 'Vaso Duna', brand: 'Estúdio Barro Cru' },
	{ name: 'Sem marca', brand: null },
];

describe('atelierProductNames', () => {
	it('keeps only the products whose brand is the atelier', () => {
		assert.deepEqual(atelierProductNames(products, 'Estúdio Barro Cru'), [
			'Jarra Seixo',
			'Vaso Duna',
		]);
	});
});

describe('formatAtelierProductsLine', () => {
	it('pluralizes and lists the products', () => {
		assert.equal(
			formatAtelierProductsLine(['Jarra Seixo', 'Vaso Duna']),
			'2 peças: Jarra Seixo, Vaso Duna',
		);
	});

	it('uses the singular for one product', () => {
		assert.equal(
			formatAtelierProductsLine(['Cadeira Lina']),
			'1 peça: Cadeira Lina',
		);
	});

	it('has a fallback for an atelier without products', () => {
		assert.equal(formatAtelierProductsLine([]), 'Peças em breve');
	});
});
