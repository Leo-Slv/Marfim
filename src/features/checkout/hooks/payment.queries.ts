'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import { useSession } from '@/lib/auth/use-session';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	getCustomerProfile,
	getOrder,
	getPaymentMethods,
	placeOrder,
} from '../api/orders';
import type { CheckoutRequest } from '../model/order';

/** How often the processing screen asks for the order's outcome. */
const ORDER_POLL_MS = 2000;

function usePaymentMethods() {
	return useQuery({
		queryKey: queryKeys.checkout.paymentMethods,
		queryFn: getPaymentMethods,
		staleTime: 5 * 60_000,
	});
}

function usePlaceOrder() {
	return useMutation({
		mutationFn: ({
			request,
			idempotencyKey,
		}: {
			request: CheckoutRequest;
			idempotencyKey: string;
		}) => placeOrder(request, idempotencyKey),
	});
}

/**
 * The order. Once the card was sent (`cardSent`) and while it still awaits
 * payment, it's polled every 2 s until the outcome arrives (decision 2:
 * polling, not SignalR).
 */
function useOrder(orderId: string | null, cardSent: boolean) {
	return useQuery({
		queryKey: queryKeys.checkout.order(orderId ?? 'none'),
		queryFn: () => getOrder(orderId as string),
		enabled: orderId !== null,
		refetchInterval: (query) =>
			cardSent && query.state.data?.status === 'PendingPayment'
				? ORDER_POLL_MS
				: false,
		staleTime: 0,
	});
}

function useCustomerProfile() {
	const session = useSession();
	return useQuery({
		queryKey: queryKeys.checkout.profile(session?.userId ?? 'anonymous'),
		queryFn: getCustomerProfile,
		enabled: session?.role === 'Customer',
		staleTime: 5 * 60_000,
	});
}

export { useCustomerProfile, useOrder, usePaymentMethods, usePlaceOrder };
