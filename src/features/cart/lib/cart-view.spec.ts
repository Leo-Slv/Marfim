import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ProductSummary } from '@/features/catalog/model/product';

import type { CartQuote } from '../model/cart-quote';
import { buildCartView, checkoutGate, pickRecommendations } from './cart-view';

function product(
	id: string,
	overrides: Partial<ProductSummary> = {},
): ProductSummary {
	return {
		id,
		sku: id,
		slug: id,
		name: id,
		shortDescription: null,
		brand: 'Ateliê',
		categoryId: 'cat-casa',
		currentPrice: 100,
		compareAtPrice: null,
		currency: 'BRL',
		status: 'Active',
		primaryImageUrl: null,
		availability: 'InStock',
		...overrides,
	};
}

const categories = [
	{ id: 'cat-casa', name: 'Casa', slug: 'casa' },
	{ id: 'cat-luz', name: 'Iluminação', slug: 'iluminacao' },
];

const line = (productId: string, unitPrice: number, quantity = 1) => ({
	productId,
	slug: productId,
	name: productId,
	unitPrice,
	quantity,
});

function quoteLine(
	productId: string,
	unitPrice: number | null,
	quantity: number,
	issue: CartQuote['lines'][number]['issue'] = null,
	previousUnitPrice: number | null = null,
) {
	return {
		productId,
		productName: unitPrice === null ? null : `${productId} (API)`,
		slug: unitPrice === null ? null : productId,
		imageUrl: null,
		unitPrice,
		quantity,
		lineTotal: (unitPrice ?? 0) * quantity,
		issue,
		previousUnitPrice,
	};
}

describe('buildCartView', () => {
	it('uses the quoted price and the catalog compare-at price for savings', () => {
		const view = buildCartView({
			lines: [line('orbe', 339), line('duna', 129, 2)],
			quote: {
				currency: 'BRL',
				total: 359 + 258,
				isValid: false,
				lines: [
					quoteLine('orbe', 359, 1, 'PriceChanged', 339),
					quoteLine('duna', 129, 2),
				],
			},
			products: [
				product('orbe', { compareAtPrice: 449, categoryId: 'cat-luz' }),
				product('duna'),
			],
			categories,
		});

		assert.equal(view.lines[0].unitPrice, 359);
		assert.equal(view.lines[0].name, 'orbe (API)');
		assert.equal(view.lines[0].oldLineTotal, 449);
		assert.equal(view.lines[0].categoryName, 'Iluminação');
		assert.equal(view.lines[0].issue, 'PriceChanged');
		assert.equal(view.lines[0].previousUnitPrice, 339);
		assert.equal(view.pieceCount, 3);
		assert.equal(view.total, 359 + 258);
		assert.equal(view.listSubtotal, 449 + 258);
		assert.equal(view.savings, 90);
	});

	it('moves not-found and unavailable lines out of the totals', () => {
		const view = buildCartView({
			lines: [line('gone', 50), line('off', 70), line('ok', 100)],
			quote: {
				currency: 'BRL',
				total: 100,
				isValid: false,
				lines: [
					quoteLine('gone', null, 1, 'NotFound'),
					quoteLine('off', 70, 1, 'Unavailable'),
					quoteLine('ok', 100, 1),
				],
			},
			products: [],
			categories,
		});

		assert.deepEqual(
			view.unavailable.map((item) => [item.name, item.issue]),
			[
				['gone', 'NotFound'],
				['off (API)', 'Unavailable'],
			],
		);
		assert.equal(view.lines.length, 1);
		assert.equal(view.total, 100);
	});

	it('falls back to the stored line before the quote arrives', () => {
		const view = buildCartView({
			lines: [line('duna', 129)],
			quote: undefined,
			products: [],
			categories,
		});
		assert.equal(view.lines[0].unitPrice, 129);
		assert.equal(view.lines[0].brand, null);
		assert.equal(view.savings, 0);
	});

	it('shows a line without enough stock but leaves it out of the totals', () => {
		const view = buildCartView({
			lines: [line('seixo', 149), line('duna', 129)],
			quote: {
				currency: 'BRL',
				total: 129,
				isValid: false,
				lines: [
					quoteLine('seixo', 149, 1, 'InsufficientStock'),
					quoteLine('duna', 129, 1),
				],
			},
			products: [],
			categories,
		});
		assert.equal(view.lines.length, 2);
		assert.equal(view.lines[0].issue, 'InsufficientStock');
		assert.equal(view.pieceCount, 1);
		assert.equal(view.total, 129);
	});
});

describe('checkoutGate', () => {
	it('allows checkout only with a valid, current quote', () => {
		assert.deepEqual(
			checkoutGate({
				hasLines: true,
				quoteStatus: 'ready',
				quoteIsValid: true,
			}),
			{ canCheckout: true, reason: null },
		);
	});

	it('explains why it is blocked', () => {
		assert.match(
			checkoutGate({
				hasLines: true,
				quoteStatus: 'ready',
				quoteIsValid: false,
			}).reason ?? '',
			/avisos/,
		);
		assert.match(
			checkoutGate({
				hasLines: true,
				quoteStatus: 'checking',
				quoteIsValid: true,
			}).reason ?? '',
			/Conferindo/,
		);
		assert.match(
			checkoutGate({ hasLines: true, quoteStatus: 'error', quoteIsValid: true })
				.reason ?? '',
			/Tente novamente/,
		);
	});

	it('has no reason to show for an empty bag', () => {
		assert.deepEqual(
			checkoutGate({
				hasLines: false,
				quoteStatus: 'ready',
				quoteIsValid: true,
			}),
			{ canCheckout: false, reason: null },
		);
	});
});

describe('pickRecommendations', () => {
	const catalog = [
		product('a', { categoryId: 'cat-luz' }),
		product('b', { categoryId: 'cat-casa' }),
		product('c', { categoryId: 'cat-luz', availability: 'OutOfStock' }),
		product('d', { categoryId: 'cat-luz' }),
		product('e', { categoryId: 'cat-casa' }),
	];

	it('prefers the bag categories, skips sold-out and bagged products', () => {
		assert.deepEqual(
			pickRecommendations(catalog, [line('a', 100)]).map((p) => p.id),
			['d', 'b', 'e'],
		);
	});

	it('respects the limit', () => {
		assert.equal(pickRecommendations(catalog, [], 2).length, 2);
	});
});
