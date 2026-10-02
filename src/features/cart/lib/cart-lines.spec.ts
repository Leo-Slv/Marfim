import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	addCartLine,
	cartSubtotal,
	countCartItems,
	formatItemCount,
	parseCartLines,
	removeCartLine,
	repriceCartLine,
	setCartLineQuantity,
} from './cart-lines';

const arco = {
	productId: 'p-arco',
	slug: 'luminaria-arco',
	name: 'Luminária Arco',
	unitPrice: 489,
};
const grao = {
	productId: 'p-grao',
	slug: 'par-de-canecas-grao',
	name: 'Par de canecas Grão',
	unitPrice: 89,
};

describe('addCartLine', () => {
	it('adds a new line with quantity 1', () => {
		assert.deepEqual(addCartLine([], arco), [{ ...arco, quantity: 1 }]);
	});

	it('bumps the quantity of an existing line instead of duplicating it', () => {
		const lines = addCartLine(addCartLine([], arco), arco);
		assert.equal(lines.length, 1);
		assert.equal(lines[0].quantity, 2);
	});
});

describe('cart totals', () => {
	const lines = addCartLine(addCartLine(addCartLine([], arco), grao), grao);

	it('counts every unit', () => {
		assert.equal(countCartItems(lines), 3);
	});

	it('sums unit price × quantity', () => {
		assert.equal(cartSubtotal(lines), 489 + 2 * 89);
	});
});

describe('parseCartLines', () => {
	it('returns an empty cart for missing or invalid JSON', () => {
		assert.deepEqual(parseCartLines(null), []);
		assert.deepEqual(parseCartLines('{not json'), []);
		assert.deepEqual(parseCartLines('{"a":1}'), []);
	});

	it('drops malformed lines and keeps valid ones', () => {
		const raw = JSON.stringify([
			{ ...arco, quantity: 1 },
			{ productId: 'x' },
			{ ...grao, quantity: 0 },
		]);
		assert.deepEqual(parseCartLines(raw), [{ ...arco, quantity: 1 }]);
	});
});

describe('formatItemCount', () => {
	it('uses the singular only for one item', () => {
		assert.equal(formatItemCount(1), '1 item');
		assert.equal(formatItemCount(0), '0 itens');
		assert.equal(formatItemCount(3), '3 itens');
	});
});

describe('setCartLineQuantity', () => {
	const lines = addCartLine(addCartLine([], arco), grao);

	it('sets the quantity, capped at 9', () => {
		assert.equal(setCartLineQuantity(lines, 'p-arco', 3)[0].quantity, 3);
		assert.equal(setCartLineQuantity(lines, 'p-arco', 42)[0].quantity, 9);
	});

	it('removes the line at 0', () => {
		assert.deepEqual(
			setCartLineQuantity(lines, 'p-arco', 0).map((line) => line.productId),
			['p-grao'],
		);
	});

	it('caps additions too', () => {
		assert.equal(addCartLine([], arco, 20)[0].quantity, 9);
		assert.equal(
			addCartLine(setCartLineQuantity(lines, 'p-arco', 9), arco)[0].quantity,
			9,
		);
	});
});

describe('removeCartLine / repriceCartLine', () => {
	const lines = addCartLine(addCartLine([], arco), grao);

	it('removes only the given product', () => {
		assert.deepEqual(
			removeCartLine(lines, 'p-grao').map((line) => line.productId),
			['p-arco'],
		);
	});

	it('updates the stored unit price', () => {
		assert.equal(repriceCartLine(lines, 'p-grao', 95)[1].unitPrice, 95);
		assert.equal(repriceCartLine(lines, 'p-grao', 95)[0].unitPrice, 489);
	});
});
