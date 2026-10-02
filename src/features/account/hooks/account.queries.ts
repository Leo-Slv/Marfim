'use client';

import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

import { setDefaultAddress } from '@/features/checkout/api/customer-addresses';
import { toAddressRequest } from '@/features/checkout/lib/format-address';
import type { AddressForm } from '@/features/checkout/schemas/address-form.schema';
import { changePassword } from '@/lib/auth/session-client';
import { useSession } from '@/lib/auth/use-session';
import { queryKeys } from '@/lib/constants/query-keys';

import {
	cancelMyOrder,
	deleteAddress,
	getAccountOrder,
	getMyOrders,
	getOrderHistory,
	getProfile,
	updateAddress,
	updateProfile,
} from '../api/account';
import { isActiveOrder } from '../lib/order-status';

/** "Ao vivo": how often an order still in progress is refreshed. */
const LIVE_ORDER_MS = 15_000;

function useUserKey() {
	return useSession()?.userId ?? 'anonymous';
}

function useProfile() {
	const session = useSession();
	return useQuery({
		queryKey: queryKeys.account.profile(session?.userId ?? 'anonymous'),
		queryFn: getProfile,
		enabled: session?.role === 'Customer',
	});
}

function useUpdateProfile() {
	const queryClient = useQueryClient();
	const user = useUserKey();
	return useMutation({
		mutationFn: ({ name, phone }: { name: string; phone: string | null }) =>
			updateProfile(name, phone),
		onSuccess: (profile) =>
			queryClient.setQueryData(queryKeys.account.profile(user), profile),
	});
}

function useMyOrders(page: number, pageSize: number) {
	const session = useSession();
	return useQuery({
		queryKey: queryKeys.account.orders(session?.userId ?? 'anonymous', page),
		queryFn: () => getMyOrders(page, pageSize),
		enabled: session?.role === 'Customer',
	});
}

/**
 * Details of the listed orders, for thumbnails and the items summary — the
 * list endpoint has none (account pendency #1); one request per order.
 */
function useOrdersDetails(orderIds: readonly string[]) {
	return useQueries({
		queries: orderIds.map((orderId) => ({
			queryKey: queryKeys.account.order(orderId),
			queryFn: () => getAccountOrder(orderId),
			staleTime: 60_000,
		})),
	});
}

/** One order, refreshed while it's still in progress ("Ao vivo"). */
function useAccountOrder(orderId: string) {
	return useQuery({
		queryKey: queryKeys.account.order(orderId),
		queryFn: () => getAccountOrder(orderId),
		refetchInterval: (query) =>
			query.state.data && isActiveOrder(query.state.data.status)
				? LIVE_ORDER_MS
				: false,
	});
}

function useOrderHistory(orderId: string, live: boolean) {
	return useQuery({
		queryKey: queryKeys.account.history(orderId),
		queryFn: () => getOrderHistory(orderId),
		refetchInterval: live ? LIVE_ORDER_MS : false,
	});
}

function useCancelOrder(orderId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => cancelMyOrder(orderId),
		onSettled: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.account.order(orderId),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.account.history(orderId),
			});
			void queryClient.invalidateQueries({ queryKey: ['account', 'orders'] });
		},
	});
}

/** Edits, defaults and deletions of the customer's addresses. */
function useAddressMutations() {
	const queryClient = useQueryClient();
	const user = useUserKey();
	const refresh = () =>
		queryClient.invalidateQueries({
			queryKey: queryKeys.checkout.addresses(user),
		});

	return {
		update: useMutation({
			mutationFn: ({
				addressId,
				form,
				position,
			}: {
				addressId: string;
				form: AddressForm;
				position: number;
			}) => updateAddress(addressId, toAddressRequest(form, position)),
			onSettled: refresh,
		}),
		makeDefault: useMutation({
			mutationFn: ({
				addressId,
				kind,
			}: {
				addressId: string;
				kind: 'shipping' | 'billing';
			}) => setDefaultAddress(addressId, kind),
			onSettled: refresh,
		}),
		remove: useMutation({
			mutationFn: (addressId: string) => deleteAddress(addressId),
			onSettled: refresh,
		}),
	};
}

function useChangePassword() {
	return useMutation({
		mutationFn: ({
			currentPassword,
			newPassword,
		}: {
			currentPassword: string;
			newPassword: string;
		}) => changePassword(currentPassword, newPassword),
	});
}

export {
	useAccountOrder,
	useAddressMutations,
	useCancelOrder,
	useChangePassword,
	useMyOrders,
	useOrderHistory,
	useOrdersDetails,
	useProfile,
	useUpdateProfile,
};
