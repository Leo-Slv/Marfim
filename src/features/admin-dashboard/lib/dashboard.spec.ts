import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
	AdminOrderSummary,
	Dashboard,
} from '../schemas/admin-dashboard.schema';
import {
	averageTicket,
	chartGeometry,
	countDelta,
	funnelStages,
	paidOrdersOf,
	percentDelta,
	revenueByDay,
	timeAgo,
} from './dashboard-metrics';
import {
	formatDayLabel,
	parsePeriod,
	periodRange,
	saoPauloDayKey,
} from './dashboard-period';

describe('periodRange', () => {
	it('covers the last N store days, today included', () => {
		// 01:30 UTC on the 2nd is still the 1st in São Paulo.
		const range = periodRange(7, new Date('2026-10-02T01:30:00Z'));
		assert.equal(range.days.length, 7);
		assert.equal(range.days[0], '2026-09-25');
		assert.equal(range.days[6], '2026-10-01');
		assert.equal(range.from, '2026-09-25T03:00:00.000Z');
		assert.equal(range.to, '2026-10-02T03:00:00.000Z');
		assert.equal(range.previousFrom, '2026-09-18T03:00:00.000Z');
		assert.equal(range.previousTo, range.from);
	});

	it('parses ?periodo= with 30 days by default', () => {
		assert.equal(parsePeriod('7'), 7);
		assert.equal(parsePeriod('30'), 30);
		assert.equal(parsePeriod('90'), 30);
		assert.equal(parsePeriod(null), 30);
	});

	it('labels days like the mockup', () => {
		assert.equal(formatDayLabel('2026-10-02'), '02 OUT');
		assert.equal(
			saoPauloDayKey(new Date('2026-10-02T02:59:00Z')),
			'2026-10-01',
		);
	});
});

const dashboard = (
	ordersByStatus: Record<string, number>,
	revenue: number,
): Dashboard => ({
	from: '',
	to: '',
	ordersByStatus,
	revenueByCurrency: { BRL: revenue },
	newCustomers: 0,
	stock: { lowStock: 0, outOfStock: 0 },
	expiringAuthorizations: 0,
	recentOrders: [],
});

describe('KPIs', () => {
	it('counts paid orders and the average ticket', () => {
		const current = dashboard(
			{ PendingPayment: 2, Confirmed: 1, Shipped: 2, Cancelled: 4 },
			900,
		);
		assert.equal(paidOrdersOf(current), 3);
		assert.equal(averageTicket(900, 3), 300);
		assert.equal(averageTicket(0, 0), 0);
	});

	it('formats changes vs the previous period', () => {
		assert.deepEqual(percentDelta(1124, 1000), { text: '+12,4%', tone: 'up' });
		assert.deepEqual(percentDelta(979, 1000), { text: '−2,1%', tone: 'down' });
		assert.deepEqual(percentDelta(500, 0), { text: 'novo', tone: 'up' });
		assert.deepEqual(percentDelta(0, 0), { text: '0%', tone: 'flat' });
		assert.deepEqual(countDelta(8, 5), { text: '+3', tone: 'up' });
		assert.deepEqual(countDelta(2, 4), { text: '−2', tone: 'down' });
	});

	it('groups the funnel stages', () => {
		const stages = funnelStages({
			Created: 1,
			PendingPayment: 2,
			Confirmed: 8,
			Delivered: 37,
		});
		assert.deepEqual(
			stages.map((stage) => [stage.label, stage.count]),
			[
				['Aguardando pagamento', 3],
				['Confirmado', 8],
				['Em preparo', 0],
				['Enviado', 0],
				['Entregue', 37],
			],
		);
	});
});

const order = (
	status: AdminOrderSummary['status'],
	createdAt: string,
	totalAmount: number,
): AdminOrderSummary => ({
	id: createdAt,
	orderNumber: 'ORD',
	status,
	createdAt,
	totalAmount,
	currency: 'BRL',
	itemCount: 1,
	customer: null,
	paymentStatus: null,
	authorizationExpiringSoon: false,
});

describe('revenueByDay', () => {
	it('sums revenue orders per São Paulo day', () => {
		const series = revenueByDay(
			[
				order('Confirmed', '2026-10-01T15:00:00Z', 100),
				order('Delivered', '2026-10-01T23:00:00Z', 50),
				// 01:00 UTC on the 2nd is the 1st in São Paulo.
				order('Shipped', '2026-10-02T01:00:00Z', 25),
				order('Cancelled', '2026-10-01T15:00:00Z', 999),
				order('Confirmed', '2026-09-01T15:00:00Z', 999),
			],
			['2026-09-30', '2026-10-01'],
		);
		assert.deepEqual(series, [0, 175]);
	});
});

describe('timeAgo', () => {
	const now = new Date('2026-10-02T12:00:00Z');
	it('uses minutes, hours, then days', () => {
		assert.equal(timeAgo('2026-10-02T11:56:00Z', now), '4 MIN');
		assert.equal(timeAgo('2026-10-02T12:00:00Z', now), '1 MIN');
		assert.equal(timeAgo('2026-10-02T09:00:00Z', now), '3 H');
		assert.equal(timeAgo('2026-09-30T09:00:00Z', now), '2 D');
	});
});

describe('chartGeometry', () => {
	it('scales the line to a rounded ceiling', () => {
		const chart = chartGeometry([0, 500, 1000], {
			width: 720,
			height: 200,
			top: 10,
		});
		assert.equal(chart.max, 1100);
		assert.equal(chart.points[2].x, 720);
		assert.ok(chart.linePath.startsWith('M0.0 200.0 L360.0'));
		assert.ok(chart.areaPath.endsWith('L720 200 L0 200 Z'));
	});

	it('draws a flat line when there is no revenue', () => {
		const chart = chartGeometry([0, 0], { width: 720, height: 200, top: 10 });
		assert.equal(chart.max, 100);
		assert.equal(chart.points[1].y, 200);
	});
});
