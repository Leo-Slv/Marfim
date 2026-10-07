import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { exploreTerms } from './explore-terms';

describe('exploreTerms', () => {
	it('lists the categories, then each atelier once', () => {
		assert.deepEqual(
			exploreTerms(
				[{ name: 'Casa' }, { name: 'Cozinha' }],
				[
					{ brand: 'Oficina Tora' },
					{ brand: null },
					{ brand: 'Tear Alto' },
					{ brand: 'Oficina Tora' },
				],
			),
			['Casa', 'Cozinha', 'Oficina Tora', 'Tear Alto'],
		);
	});
});
