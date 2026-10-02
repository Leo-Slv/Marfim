import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildListingHref } from './listing-url';

const params = (query: string) => new URLSearchParams(query);

describe('buildListingHref', () => {
	it('sets a filter and resets the page', () => {
		assert.equal(
			buildListingHref('/products', params('ordem=nome&pagina=3'), {
				categoria: 'casa',
			}),
			'/products?ordem=nome&categoria=casa',
		);
	});

	it('keeps other params when changing the page', () => {
		assert.equal(
			buildListingHref('/products', params('categoria=casa'), {
				pagina: '2',
			}),
			'/products?categoria=casa&pagina=2',
		);
	});

	it('drops defaults and removed params', () => {
		assert.equal(
			buildListingHref('/products', params('categoria=casa&pagina=2'), {
				categoria: null,
				ordem: 'recentes',
			}),
			'/products',
		);
		assert.equal(
			buildListingHref('/products', params('categoria=casa&pagina=2'), {
				pagina: '1',
			}),
			'/products?categoria=casa',
		);
	});
});
