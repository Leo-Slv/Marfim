import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { freeShippingProgress } from './free-shipping';

describe('freeShippingProgress', () => {
	it('shows how much is missing for an empty cart', () => {
		assert.deepEqual(freeShippingProgress(0), {
			percent: 0,
			label: 'Faltam R$ 299 para frete grátis',
		});
	});

	it('reports partial progress', () => {
		const progress = freeShippingProgress(89);
		assert.equal(progress.label, 'Faltam R$ 210 para frete grátis');
		assert.ok(progress.percent > 29 && progress.percent < 30);
	});

	it('caps at 100% once the goal is reached', () => {
		assert.deepEqual(freeShippingProgress(489), {
			percent: 100,
			label: 'Frete grátis liberado',
		});
	});
});
