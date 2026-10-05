import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ProductSummary } from '@/features/catalog/model/product';

import {
	atelierLine,
	careText,
	clampQuantity,
	galleryViews,
	recommendations,
	remainingInBag,
	stockLine,
} from './product-content';

const product = (
	id: string,
	categoryId: string,
	availability: ProductSummary['availability'] = 'InStock',
): ProductSummary => ({
	id,
	sku: id,
	slug: id,
	name: id,
	shortDescription: null,
	brand: null,
	categoryId,
	currentPrice: 100,
	compareAtPrice: null,
	currency: 'BRL',
	status: 'Active',
	primaryImageUrl: null,
	availability,
});

describe('product content', () => {
	it('adds the lit view only to lighting', () => {
		assert.deepEqual(
			galleryViews({ kind: 'pendant', tint: '#F1F0EC' }).map((view) => view.id),
			['frente', 'acesa', 'detalhe', 'ambiente'],
		);
		assert.deepEqual(
			galleryViews({ kind: 'vase', tint: '#F1F0EC' }).map((view) => view.id),
			['frente', 'detalhe', 'ambiente'],
		);
	});

	it('describes the stock and the atelier', () => {
		assert.equal(stockLine('LowStock').label, 'Últimas unidades');
		assert.equal(stockLine('OutOfStock').tone, 'out');
		assert.equal(
			atelierLine('Oficina Faísca'),
			'OFICINA FAÍSCA · SÃO PAULO · SP',
		);
		assert.equal(atelierLine('Ateliê Novo'), 'ATELIÊ NOVO');
		assert.equal(atelierLine(null), null);
	});

	it('picks the care text by category', () => {
		assert.match(careText('texteis'), /ciclo delicado/);
		assert.match(careText(null), /pano macio/);
	});

	it('keeps the quantity within what fits in the bag', () => {
		assert.equal(remainingInBag(7), 2);
		assert.equal(remainingInBag(12), 0);
		assert.equal(clampQuantity(5, 2), 2);
		assert.equal(clampQuantity(0, 9), 1);
		assert.equal(clampQuantity(3, 0), 1);
	});

	it('recommends the same category, available first', () => {
		const picks = recommendations(
			[
				product('this', 'luz'),
				product('a', 'luz', 'OutOfStock'),
				product('b', 'casa'),
				product('c', 'luz'),
				product('d', 'luz', 'LowStock'),
			],
			{ id: 'this', categoryId: 'luz' },
		);
		assert.deepEqual(
			picks.map((item) => item.id),
			['c', 'd', 'a'],
		);
	});
});
