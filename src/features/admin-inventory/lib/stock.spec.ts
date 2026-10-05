import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ApiError } from '@/lib/http/api-error';

import {
	movementView,
	parseFilter,
	parseQuantity,
	stockErrorCopy,
	stockLevelView,
	stockSummary,
	validateAction,
} from './stock';

const level = (available: number, reorderLevel: number) => ({
	quantityOnHand: available + 1,
	quantityReserved: 1,
	quantityAvailable: available,
	reorderLevel,
	state: '',
});

describe('stock levels', () => {
	it('places the bar and the reorder tick', () => {
		const view = stockLevelView(level(4, 8));
		assert.equal(view.state, 'low');
		assert.equal(view.label, 'Baixo');
		assert.equal(view.barPercent, 25);
		assert.equal(view.tickPercent, 50);
		assert.equal(stockLevelView(level(0, 2)).state, 'out');
		assert.equal(stockLevelView(level(9, 3)).state, 'ok');
		// At the reorder point already counts as low, like OrderCore.
		assert.equal(stockLevelView(level(5, 5)).state, 'low');
		assert.equal(stockLevelView(null).label, 'Zerado');
	});

	it('scales above the default when a product has more', () => {
		assert.equal(stockLevelView(level(40, 5)).barPercent, 100);
	});

	it('sums the tiles', () => {
		assert.deepEqual(
			stockSummary([level(4, 8), level(0, 2), level(9, 3), null]),
			{ units: 13, low: 1, out: 2 },
		);
	});

	it('maps ?nivel= to the API filter', () => {
		assert.equal(parseFilter('abaixo').stock, 'LowStock');
		assert.equal(parseFilter('esgotados').stock, 'OutOfStock');
		assert.equal(parseFilter(null).stock, null);
	});
});

describe('actions', () => {
	const item = { quantityAvailable: 3 };
	it('validates each action', () => {
		assert.equal(parseQuantity('-2'), -2);
		assert.equal(parseQuantity('+6'), 6);
		assert.equal(parseQuantity('2,5'), null);
		assert.equal(parseQuantity('a5'), null);
		assert.equal(parseQuantity('−1'), -1);
		assert.equal(validateAction('receive', '6', item), null);
		assert.match(validateAction('receive', '0', item) ?? '', /maior que zero/);
		assert.match(
			validateAction('adjust', '0', item) ?? '',
			/não pode ser zero/,
		);
		assert.match(validateAction('adjust', '-4', item) ?? '', /negativo/);
		assert.equal(validateAction('adjust', '-3', item), null);
		assert.equal(validateAction('reorder', '0', item), null);
		assert.match(validateAction('reorder', 'x', item) ?? '', /inteiro/);
	});

	it('explains OrderCore refusals', () => {
		assert.match(
			stockErrorCopy(new ApiError('x', 400, { code: 'stock_below_reserved' })),
			/reservadas/,
		);
	});
});

describe('movementView', () => {
	const movement = (
		movementType: string,
		quantity: number,
		reason: string | null = null,
	) => ({
		id: 'm',
		movementType,
		quantity,
		reason,
		createdAt: '2026-10-02T16:15:00Z',
	});

	it('signs by the effect on hand and keeps the reason', () => {
		assert.deepEqual(movementView(movement('Inbound', 20, 'Estoque inicial')), {
			delta: '+20',
			tone: 'in',
			what: 'Recebimento · Estoque inicial',
		});
		assert.equal(
			movementView(movement('Adjustment', -2, 'Peça danificada')).delta,
			'−2',
		);
		assert.equal(
			movementView(movement('ReservationConsumed', 1)).what,
			'Vendido',
		);
		assert.equal(
			movementView(movement('ReservationCreated', 1)).tone,
			'reserve',
		);
	});
});
