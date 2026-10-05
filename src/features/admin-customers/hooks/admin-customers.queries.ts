'use client';

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/lib/constants/query-keys';

import {
	getCustomer,
	getCustomerAddresses,
	getCustomerOrders,
	listCustomers,
	setCustomerActive,
} from '../api/admin-customers';
import { orderStats } from '../lib/customers';

const PAGE_SIZE = 20;

function useCustomers(searchTerm: string, page: number) {
	return useQuery({
		queryKey: queryKeys.admin.customers(searchTerm, page),
		queryFn: () => listCustomers({ searchTerm, page, pageSize: PAGE_SIZE }),
		placeholderData: keepPreviousData,
	});
}

/** PEDIDOS and TOTAL GASTO of the listed customers (pendency #2). */
function useCustomerStats(customerIds: readonly string[]) {
	return useQuery({
		queryKey: queryKeys.admin.customerStats(customerIds),
		queryFn: async () => {
			const pages = await Promise.all(
				customerIds.map((id) => getCustomerOrders(id)),
			);
			return Object.fromEntries(
				customerIds.map((id, index) => [
					id,
					orderStats(pages[index].items, pages[index].totalItems),
				]),
			);
		},
		enabled: customerIds.length > 0,
		placeholderData: keepPreviousData,
	});
}

function useCustomer(customerId: string) {
	return useQuery({
		queryKey: queryKeys.admin.customerDetail(customerId),
		queryFn: () => getCustomer(customerId),
	});
}

function useCustomerAddresses(customerId: string) {
	return useQuery({
		queryKey: queryKeys.admin.customerAddresses(customerId),
		queryFn: () => getCustomerAddresses(customerId),
	});
}

function useCustomerOrders(customerId: string) {
	return useQuery({
		queryKey: queryKeys.admin.customerOrders(customerId),
		queryFn: () => getCustomerOrders(customerId),
	});
}

/** Deactivate / reactivate; the list and the panel follow. */
function useSetCustomerActive(customerId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (active: boolean) => setCustomerActive(customerId, active),
		onSettled: () =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.admin.customersRoot,
			}),
	});
}

export {
	useCustomer,
	useCustomerAddresses,
	useCustomerOrders,
	useCustomers,
	useCustomerStats,
	useSetCustomerActive,
};
