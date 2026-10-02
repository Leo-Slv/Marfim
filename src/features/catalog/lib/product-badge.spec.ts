import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getProductBadge } from './product-badge';

describe('getProductBadge', () => {
	it('shows Esgotado for out-of-stock products, over any tag', () => {
		assert.deepEqual(getProductBadge('OutOfStock', 'Novo'), {
			label: 'Esgotado',
			tone: 'muted',
		});
	});

	it('shows Últimas unidades for low stock', () => {
		assert.deepEqual(getProductBadge('LowStock', undefined), {
			label: 'Últimas unidades',
			tone: 'warning',
		});
	});

	it('falls back to the editorial tag, with Novo in its own tone', () => {
		assert.deepEqual(getProductBadge('InStock', 'Novo'), {
			label: 'Novo',
			tone: 'new',
		});
		assert.deepEqual(getProductBadge('InStock', 'Mais vendido'), {
			label: 'Mais vendido',
			tone: 'editorial',
		});
	});

	it('has no badge for an in-stock product without a tag', () => {
		assert.equal(getProductBadge('InStock', undefined), null);
	});
});
