'use client';

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	countPayments,
	getOrderNumber,
	getPayment,
	listPayments,
	reconcilePayment,
	requestRefund,
} from '../api/admin-payments';
import { paymentTabs, type PaymentTab } from '../lib/payments';

const LIVE_MS = 30_000;
const PAGE_SIZE = 20;

/** The page of payments, each with its order number (pendency #1). */
function usePayments(tab: PaymentTab, page: number) {
	return useQuery({
		queryKey: queryKeys.admin.payments(tab.status, page),
		queryFn: async () => {
			const result = await listPayments(tab.status, page, PAGE_SIZE);
			const numbers = await Promise.all(
				result.items.map((payment) =>
					getOrderNumber(payment.orderId).catch(() => null),
				),
			);
			return {
				...result,
				items: result.items.map((payment, index) => ({
					...payment,
					orderNumber: numbers[index],
				})),
			};
		},
		refetchInterval: LIVE_MS,
		placeholderData: keepPreviousData,
	});
}

function usePaymentCounts() {
	return useQuery({
		queryKey: queryKeys.admin.paymentCounts,
		queryFn: async () => {
			const counts = await Promise.all(
				paymentTabs.map((tab) => countPayments(tab.status)),
			);
			return Object.fromEntries(
				paymentTabs.map((tab, index) => [tab.id, counts[index]]),
			) as Record<string, number>;
		},
		refetchInterval: LIVE_MS,
	});
}

function usePayment(paymentId: string) {
	return useQuery({
		queryKey: queryKeys.admin.payment(paymentId),
		queryFn: async () => {
			const payment = await getPayment(paymentId);
			const orderNumber = await getOrderNumber(payment.orderId).catch(
				() => null,
			);
			return { ...payment, orderNumber };
		},
		refetchInterval: LIVE_MS,
	});
}

/** A refund or a check can change payments, orders and the dashboard. */
function useRefreshPayments() {
	const queryClient = useQueryClient();
	return () =>
		Promise.all([
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.paymentsRoot }),
			queryClient.invalidateQueries({ queryKey: queryKeys.admin.ordersRoot }),
			queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
		]);
}

function usePaymentActions(paymentId: string) {
	const refresh = useRefreshPayments();
	return {
		refund: useMutation({
			mutationFn: ({ amount, reason }: { amount: number; reason: string }) =>
				requestRefund(paymentId, amount, reason),
			onSettled: refresh,
		}),
		reconcile: useMutation({
			mutationFn: () => reconcilePayment(paymentId),
			onSettled: refresh,
		}),
	};
}

export { usePayment, usePaymentActions, usePaymentCounts, usePayments };
