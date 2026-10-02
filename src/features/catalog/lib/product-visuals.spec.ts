import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getProductVisual, productTints } from './product-visuals';

describe('getProductVisual', () => {
	it('returns the mockup drawing, tint and tag for a known slug', () => {
		assert.deepEqual(getProductVisual('luminaria-arco'), {
			kind: 'lamp',
			tint: productTints.indigo,
			tag: 'Mais vendido',
		});
	});

	it('falls back to a default drawing without a tag', () => {
		const visual = getProductVisual('produto-desconhecido');
		assert.equal(visual.kind, 'vase');
		assert.equal(visual.tag, undefined);
	});
});
