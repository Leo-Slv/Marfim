import { customerAddressListSchema } from '@/features/checkout/schemas/address.schema';
import { apiFetch } from '@/lib/http/api-client';

import {
	adminCustomerPageSchema,
	adminCustomerSchema,
	customerOrderPageSchema,
} from '../schemas/admin-customers.schema';

function customerPath(customerId: string, action = '') {
	return `/api/customers/${encodeURIComponent(customerId)}${action}`;
}

async function listCustomers(filter: {
	searchTerm: string;
	page: number;
	pageSize: number;
}) {
	const params = new URLSearchParams({
		Page: String(filter.page),
		PageSize: String(filter.pageSize),
	});
	if (filter.searchTerm) {
		params.set('SearchTerm', filter.searchTerm);
	}
	return adminCustomerPageSchema.parse(
		await apiFetch(`/api/customers?${params.toString()}`),
	);
}

async function getCustomer(customerId: string) {
	return adminCustomerSchema.parse(await apiFetch(customerPath(customerId)));
}

async function getCustomerAddresses(customerId: string) {
	return customerAddressListSchema.parse(
		await apiFetch(customerPath(customerId, '/addresses')),
	);
}

/** Newest first; up to 100 (the API's maximum page). */
async function getCustomerOrders(customerId: string, pageSize = 100) {
	return customerOrderPageSchema.parse(
		await apiFetch(
			`/api/orders/customers/${encodeURIComponent(customerId)}?page=1&pageSize=${pageSize}`,
		),
	);
}

/** Blocks sign-in and checkout; orders and data stay. */
async function setCustomerActive(customerId: string, active: boolean) {
	return adminCustomerSchema.parse(
		await apiFetch(
			customerPath(customerId, active ? '/reactivate' : '/deactivate'),
			{ method: 'POST' },
		),
	);
}

export {
	getCustomer,
	getCustomerAddresses,
	getCustomerOrders,
	listCustomers,
	setCustomerActive,
};
