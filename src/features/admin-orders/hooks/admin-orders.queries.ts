'use client';

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	cancelOrder,
	countAdminOrders,
	deliverOrder,
	getAdminOrder,
	getCustomer,
	getOrderTimeline,
	listAdminOrders,
	searchCustomers,
	setInternalNotes,
	shipOrder,
	startProcessing,
	type ShipInput,
} from '../api/admin-orders';
import { appendNote, MAX_NOTES_LENGTH } from '../lib/internal-notes';
import { orderTabs, type OrderTab } from '../lib/order-tabs';

/** The notes text would pass OrderCore's 2000 characters. */
class NotesFullError extends Error {}

const LIVE_MS = 30_000;
const PAGE_SIZE = 20;

function useAdminOrders(
	tab: OrderTab,
	customerId: string | null,
	page: number,
) {
	return useQuery({
		queryKey: queryKeys.admin.orders(tab.status, customerId, page),
		queryFn: () =>
			listAdminOrders({
				status: tab.status,
				customerId,
				page,
				pageSize: PAGE_SIZE,
			}),
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
}

/** Count per tab (one small call each — admin orders pendency #3). */
function useOrderCounts(customerId: string | null) {
	return useQuery({
		queryKey: queryKeys.admin.orderCounts(customerId),
		queryFn: async () => {
			const counts = await Promise.all(
				orderTabs.map((tab) => countAdminOrders(tab.status, customerId)),
			);
			return Object.fromEntries(
				orderTabs.map((tab, index) => [tab.id, counts[index]]),
			) as Record<string, number>;
		},
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
}

function useAdminOrder(orderId: string | null) {
	return useQuery({
		queryKey: queryKeys.admin.order(orderId ?? ''),
		queryFn: () => getAdminOrder(orderId ?? ''),
		enabled: orderId !== null,
		refetchInterval: LIVE_MS,
	});
}

function useOrderTimeline(orderId: string | null) {
	return useQuery({
		queryKey: queryKeys.admin.orderTimeline(orderId ?? ''),
		queryFn: () => getOrderTimeline(orderId ?? ''),
		enabled: orderId !== null,
		refetchInterval: LIVE_MS,
	});
}

/** Customers matching a name or e-mail (2+ characters). */
function useCustomerSearch(term: string) {
	const trimmed = term.trim();
	return useQuery({
		queryKey: queryKeys.admin.customerSearch(trimmed.toLowerCase()),
		queryFn: () => searchCustomers(trimmed),
		enabled: trimmed.length >= 2,
		staleTime: 60_000,
	});
}

/** The customer the list is filtered by (for its chip). */
function useFilterCustomer(customerId: string | null) {
	return useQuery({
		queryKey: queryKeys.admin.customer(customerId ?? ''),
		queryFn: () => getCustomer(customerId ?? ''),
		enabled: customerId !== null,
		staleTime: 5 * 60_000,
	});
}

/**
 * Every fulfilment action changes the list, the counts, the detail, the
 * timeline, the menu counters and the dashboard — all refreshed after it.
 */
function useRefreshOrders() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.ordersRoot }),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.counts }),
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.preparation,
			}),
			queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
			queryClient.invalidateQueries({ queryKey: ['admin', 'revenue'] }),
		]);
}

function useOrderActions(orderId: string) {
	const refresh = useRefreshOrders();
	const settle = { onSettled: refresh };
	return {
		start: useMutation({
			mutationFn: () => startProcessing(orderId),
			...settle,
		}),
		ship: useMutation({
			mutationFn: (shipment: ShipInput) => shipOrder(orderId, shipment),
			...settle,
		}),
		deliver: useMutation({
			mutationFn: () => deliverOrder(orderId),
			...settle,
		}),
		cancel: useMutation({
			mutationFn: () => cancelOrder(orderId),
			...settle,
		}),
		/**
		 * Appends a note to the latest notes text (re-read right before, so a
		 * colleague's note saved meanwhile isn't lost — pendency #4).
		 */
		addNote: useMutation({
			mutationFn: async ({
				note,
				author,
			}: {
				note: string;
				author: string;
			}) => {
				const fresh = await getAdminOrder(orderId);
				const notes = appendNote(fresh.internalNotes, note, author, new Date());
				if (notes.length > MAX_NOTES_LENGTH) {
					throw new NotesFullError();
				}
				await setInternalNotes(orderId, notes);
			},
			...settle,
		}),
	};
}

export {
	NotesFullError,
	PAGE_SIZE,
	useAdminOrder,
	useAdminOrders,
	useCustomerSearch,
	useFilterCustomer,
	useOrderActions,
	useOrderCounts,
	useOrderTimeline,
};
