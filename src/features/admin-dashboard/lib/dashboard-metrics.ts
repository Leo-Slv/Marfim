import type { OrderStatus } from '@/features/checkout/model/order';

import type {
	AdminOrderSummary,
	Dashboard,
} from '../schemas/admin-dashboard.schema';
import { saoPauloDayKey } from './dashboard-period';

/** Orders whose money counts — OrderCore's `GetDashboardUseCase`. */
const REVENUE_STATUSES: readonly OrderStatus[] = [
	'Confirmed',
	'Processing',
	'Shipped',
	'Delivered',
];

type DeltaTone = 'up' | 'down' | 'flat';
type Delta = { text: string; tone: DeltaTone };

function revenueOf(dashboard: Dashboard) {
	return dashboard.revenueByCurrency.BRL ?? 0;
}

function paidOrdersOf(dashboard: Dashboard) {
	return REVENUE_STATUSES.reduce(
		(sum, status) => sum + (dashboard.ordersByStatus[status] ?? 0),
		0,
	);
}

function averageTicket(revenue: number, paidOrders: number) {
	return paidOrders > 0 ? revenue / paidOrders : 0;
}

const percentFormatter = new Intl.NumberFormat('pt-BR', {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1,
});

/** "+12,4%" vs the previous period; "novo" when there was nothing before. */
function percentDelta(current: number, previous: number): Delta {
	if (previous === 0) {
		return current === 0
			? { text: '0%', tone: 'flat' }
			: { text: 'novo', tone: 'up' };
	}
	const change = (current / previous - 1) * 100;
	if (Math.abs(change) < 0.05) {
		return { text: '0%', tone: 'flat' };
	}
	return {
		text: `${change > 0 ? '+' : '−'}${percentFormatter.format(Math.abs(change))}%`,
		tone: change > 0 ? 'up' : 'down',
	};
}

/** "+3" / "−2" / "0". */
function countDelta(current: number, previous: number): Delta {
	const change = current - previous;
	if (change === 0) {
		return { text: '0', tone: 'flat' };
	}
	return {
		text: `${change > 0 ? '+' : '−'}${Math.abs(change)}`,
		tone: change > 0 ? 'up' : 'down',
	};
}

type FunnelStage = { label: string; count: number; done: boolean };

/** "Pedidos por etapa": the order flow, waiting payment to delivered. */
function funnelStages(ordersByStatus: Dashboard['ordersByStatus']) {
	const count = (status: OrderStatus) => ordersByStatus[status] ?? 0;
	const stages: FunnelStage[] = [
		{
			label: 'Aguardando pagamento',
			count: count('Created') + count('PendingPayment'),
			done: false,
		},
		{ label: 'Confirmado', count: count('Confirmed'), done: false },
		{ label: 'Em preparo', count: count('Processing'), done: false },
		{ label: 'Enviado', count: count('Shipped'), done: false },
		{ label: 'Entregue', count: count('Delivered'), done: true },
	];
	return stages;
}

/**
 * Revenue per store day from the period's orders, by day of creation
 * (the list has no `confirmedAt` — admin dashboard pendency #1).
 */
function revenueByDay(
	orders: readonly AdminOrderSummary[],
	days: readonly string[],
) {
	const totals = new Map(days.map((day) => [day, 0]));
	for (const order of orders) {
		if (!REVENUE_STATUSES.includes(order.status)) {
			continue;
		}
		const day = saoPauloDayKey(new Date(order.createdAt));
		const current = totals.get(day);
		if (current !== undefined) {
			totals.set(day, current + order.totalAmount);
		}
	}
	return days.map((day) => totals.get(day) ?? 0);
}

/** "4 MIN", "3 H", "2 D" — the "HÁ" column. */
function timeAgo(iso: string, now: Date) {
	const minutes = Math.max(
		0,
		Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000),
	);
	if (minutes < 60) {
		return `${Math.max(1, minutes)} MIN`;
	}
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours} H`;
	}
	return `${Math.floor(hours / 24)} D`;
}

type ChartGeometry = {
	linePath: string;
	areaPath: string;
	points: { x: number; y: number }[];
	max: number;
};

/** Line and area paths in a `width × height` box (top margin `top`). */
function chartGeometry(
	values: readonly number[],
	{ width, height, top }: { width: number; height: number; top: number },
): ChartGeometry {
	const peak = Math.max(0, ...values);
	// A rounded ceiling a bit above the peak; 100 when there's no revenue.
	const max = peak > 0 ? Math.ceil((peak * 1.1) / 100) * 100 : 100;
	const step = values.length > 1 ? width / (values.length - 1) : 0;
	const points = values.map((value, index) => ({
		x: index * step,
		y: height - (value / max) * (height - top),
	}));
	const linePath = points
		.map(
			(point, index) =>
				`${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
		)
		.join(' ');
	return {
		linePath,
		areaPath: `${linePath} L${width} ${height} L0 ${height} Z`,
		points,
		max,
	};
}

export type { ChartGeometry, Delta, DeltaTone, FunnelStage };
export {
	averageTicket,
	chartGeometry,
	countDelta,
	funnelStages,
	paidOrdersOf,
	percentDelta,
	revenueByDay,
	revenueOf,
	REVENUE_STATUSES,
	timeAgo,
};
