'use client';

import {
	keepPreviousData,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	adjustStock,
	getMovements,
	getOrderNumber,
	getReservations,
	getStockItem,
	listStock,
	receiveStock,
	setReorderLevel,
} from '../api/admin-inventory';
import type { StockFilter } from '../lib/stock';

const LIVE_MS = 30_000;
const PAGE_SIZE = 20;
const MOVEMENTS_PAGE = 10;
/** One page at the API's maximum feeds the tiles (pendency #2). */
const SUMMARY_SIZE = 100;

function useStockList(filter: StockFilter, page: number) {
	return useQuery({
		queryKey: queryKeys.admin.inventory(filter.id, page),
		queryFn: () =>
			listStock({ stock: filter.stock, page, pageSize: PAGE_SIZE }),
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
}

/** Every product's level: the tiles and the tab counts. */
function useStockSummary() {
	return useQuery({
		queryKey: queryKeys.admin.inventorySummary,
		queryFn: () => listStock({ stock: null, page: 1, pageSize: SUMMARY_SIZE }),
		refetchInterval: LIVE_MS,
	});
}

function useStockItem(productId: string) {
	return useQuery({
		queryKey: queryKeys.admin.stockItem(productId),
		queryFn: () => getStockItem(productId),
		refetchInterval: LIVE_MS,
	});
}

function useStockMovements(productId: string) {
	return useInfiniteQuery({
		queryKey: queryKeys.admin.stockMovements(productId),
		queryFn: ({ pageParam }) =>
			getMovements(productId, pageParam, MOVEMENTS_PAGE),
		initialPageParam: 1,
		getNextPageParam: (last) =>
			last.page < last.totalPages ? last.page + 1 : undefined,
		refetchInterval: LIVE_MS,
	});
}

/** Units held for orders right now, with each order's number. */
function useActiveReservations(productId: string) {
	return useQuery({
		queryKey: queryKeys.admin.stockReservations(productId),
		queryFn: async () => {
			const active = (await getReservations(productId)).filter(
				(reservation) => reservation.status === 'Reserved',
			);
			const numbers = await Promise.all(
				active.map((reservation) =>
					getOrderNumber(reservation.orderId).catch(() => null),
				),
			);
			return active.map((reservation, index) => ({
				...reservation,
				orderNumber: numbers[index],
			}));
		},
		refetchInterval: LIVE_MS,
	});
}

/** A stock change shows on this screen, the menu, dashboard and products. */
function useRefreshStock() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.inventoryRoot,
			}),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.counts }),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.lowStock }),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.productsRoot }),
		]);
}

function useStockActions(productId: string) {
	const refresh = useRefreshStock();
	const settle = { onSettled: refresh };
	return {
		receive: useMutation({
			mutationFn: (quantity: number) => receiveStock(productId, quantity),
			...settle,
		}),
		adjust: useMutation({
			mutationFn: ({
				quantity,
				reason,
			}: {
				quantity: number;
				reason: string;
			}) => adjustStock(productId, quantity, reason),
			...settle,
		}),
		reorder: useMutation({
			mutationFn: (reorderLevel: number) =>
				setReorderLevel(productId, reorderLevel),
			...settle,
		}),
	};
}

export {
	useActiveReservations,
	useStockActions,
	useStockItem,
	useStockList,
	useStockMovements,
	useStockSummary,
};
