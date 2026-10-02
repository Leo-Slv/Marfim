'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	getAdminOrders,
	getAdminProducts,
	getDashboard,
} from '../api/admin-dashboard';
import type { PeriodRange } from '../lib/dashboard-period';
import type { AdminOrderSummary } from '../schemas/admin-dashboard.schema';

/** "Ao vivo": every figure refreshes this often. */
const LIVE_MS = 30_000;
const ORDERS_PAGE_SIZE = 100;
/** Safety cap for the revenue series (admin dashboard pendency #1). */
const MAX_ORDER_PAGES = 20;
const LOW_STOCK_SHOWN = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The period's dashboard and the previous one, for the comparisons. */
function useDashboard(range: PeriodRange) {
	const current = useQuery({
		queryKey: queryKeys.admin.dashboard(range.from, range.to),
		queryFn: () => getDashboard(range.from, range.to),
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
	const previous = useQuery({
		queryKey: queryKeys.admin.dashboard(range.previousFrom, range.previousTo),
		queryFn: () => getDashboard(range.previousFrom, range.previousTo),
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
	return { current, previous };
}

/** Every order created in the period (for "Receita por dia"). */
function useRevenueOrders(range: PeriodRange) {
	return useQuery({
		queryKey: queryKeys.admin.revenue(range.from, range.to),
		queryFn: async () => {
			const orders: AdminOrderSummary[] = [];
			for (let page = 1; page <= MAX_ORDER_PAGES; page++) {
				const result = await getAdminOrders({
					createdFrom: range.from,
					createdTo: range.to,
					page,
					pageSize: ORDERS_PAGE_SIZE,
				});
				orders.push(...result.items);
				if (page >= result.totalPages) {
					break;
				}
			}
			return orders;
		},
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
}

/** Confirmed orders waiting to be prepared, and those waiting over 24 h. */
function usePreparationQueue() {
	return useQuery({
		queryKey: queryKeys.admin.preparation,
		queryFn: async () => {
			const dayAgo = new Date(Date.now() - DAY_MS).toISOString();
			const [all, late] = await Promise.all([
				getAdminOrders({ status: 'Confirmed', pageSize: 1 }),
				getAdminOrders({
					status: 'Confirmed',
					createdTo: dayAgo,
					pageSize: 1,
				}),
			]);
			return { waiting: all.totalItems, late: late.totalItems };
		},
		refetchInterval: LIVE_MS,
	});
}

/** Products out of stock (first) and below their reorder level. */
function useLowStock() {
	return useQuery({
		queryKey: queryKeys.admin.lowStock,
		queryFn: async () => {
			const [out, low] = await Promise.all([
				getAdminProducts({ stock: 'OutOfStock', pageSize: LOW_STOCK_SHOWN }),
				getAdminProducts({ stock: 'LowStock', pageSize: LOW_STOCK_SHOWN }),
			]);
			return {
				total: out.totalItems + low.totalItems,
				items: [...out.items, ...low.items].slice(0, LOW_STOCK_SHOWN),
			};
		},
		refetchInterval: LIVE_MS,
	});
}

export { useDashboard, useLowStock, usePreparationQueue, useRevenueOrders };
