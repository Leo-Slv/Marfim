import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { piecesInCatalog, piecesOfAtelier } from './catalog-pieces';

const products = [
	{ slug: 'vaso-duna', name: 'Vaso Duna', brand: 'Estúdio Barro Cru' },
	{ slug: 'cadeira-lina', name: 'Cadeira Lina', brand: 'Oficina Tora' },
	{ slug: 'jarra-seixo', name: 'Jarra Seixo', brand: 'Estúdio Barro Cru' },
];

describe('piecesOfAtelier', () => {
	it('keeps the products of the atelier', () => {
		assert.deepEqual(
			piecesOfAtelier(products, 'Estúdio Barro Cru').map((p) => p.slug),
			['vaso-duna', 'jarra-seixo'],
		);
	});

	it('is empty for an atelier without products', () => {
		assert.deepEqual(piecesOfAtelier(products, 'Tear Alto'), []);
	});
});

describe('piecesInCatalog', () => {
	it('drops tags that are not in the catalog and keeps their order', () => {
		assert.deepEqual(
			piecesInCatalog(products, ['jarra-seixo', 'tigela-areia', 'vaso-duna']),
			[
				{ slug: 'jarra-seixo', name: 'Jarra Seixo' },
				{ slug: 'vaso-duna', name: 'Vaso Duna' },
			],
		);
	});
});
