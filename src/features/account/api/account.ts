import type { CustomerAddressRequest } from '@/features/checkout/model/address';
import { customerAddressSchema } from '@/features/checkout/schemas/address.schema';
import { orderSchema } from '@/features/checkout/schemas/order.schema';
import { apiFetch } from '@/lib/http/api-client';

import {
	orderShipmentSchema,
	orderSummaryPageSchema,
	profileSchema,
	statusHistorySchema,
} from '../schemas/account.schema';

async function getProfile() {
	return profileSchema.parse(await apiFetch<unknown>('/api/customers/me'));
}

async function updateProfile(name: string, phone: string | null) {
	return profileSchema.parse(
		await apiFetch<unknown>('/api/customers/me', {
			method: 'PUT',
			body: { name, phone },
		}),
	);
}

async function getMyOrders(page: number, pageSize: number) {
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	return orderSummaryPageSchema.parse(
		await apiFetch<unknown>(`/api/orders/me?${query}`),
	);
}

/** Order details + shipment (the account pages also show tracking). */
const accountOrderSchema = orderSchema.extend({
	shipment: orderShipmentSchema,
});

async function getAccountOrder(orderId: string) {
	return accountOrderSchema.parse(
		await apiFetch<unknown>(`/api/orders/${encodeURIComponent(orderId)}`),
	);
}

async function getOrderHistory(orderId: string) {
	return statusHistorySchema.parse(
		await apiFetch<unknown>(
			`/api/orders/${encodeURIComponent(orderId)}/status-history`,
		),
	);
}

/** Until the store starts preparing (`order_in_fulfilment` after). */
async function cancelMyOrder(orderId: string) {
	return (await apiFetch<{ paymentSettlement: string }>(
		`/api/orders/me/${encodeURIComponent(orderId)}/cancel`,
		{ method: 'POST', body: {} },
	)) as { paymentSettlement: string };
}

async function updateAddress(
	addressId: string,
	request: CustomerAddressRequest,
) {
	return customerAddressSchema.parse(
		await apiFetch<unknown>(
			`/api/customers/me/addresses/${encodeURIComponent(addressId)}`,
			{ method: 'PUT', body: request },
		),
	);
}

async function deleteAddress(addressId: string) {
	await apiFetch<null>(
		`/api/customers/me/addresses/${encodeURIComponent(addressId)}`,
		{ method: 'DELETE' },
	);
}

export {
	cancelMyOrder,
	deleteAddress,
	getAccountOrder,
	getMyOrders,
	getOrderHistory,
	getProfile,
	updateAddress,
	updateProfile,
};
