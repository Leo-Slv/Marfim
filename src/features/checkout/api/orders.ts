import { apiFetch } from '@/lib/http/api-client';

import type {
	CheckoutRequest,
	CustomerProfile,
	Order,
	PaymentMethods,
} from '../model/order';
import {
	customerProfileSchema,
	orderSchema,
	paymentMethodsSchema,
} from '../schemas/order.schema';

/** Methods checkout accepts now + Stripe's publishable key (anonymous). */
async function getPaymentMethods(): Promise<PaymentMethods> {
	return paymentMethodsSchema.parse(
		await apiFetch<unknown>('/api/payments/methods'),
	);
}

/**
 * Places the order (stock is reserved) and starts its payment. Replaying
 * the same `idempotencyKey` returns the same order and next action.
 */
async function placeOrder(
	request: CheckoutRequest,
	idempotencyKey: string,
): Promise<Order> {
	const payload = await apiFetch<unknown>('/api/orders/checkout', {
		method: 'POST',
		headers: { 'Idempotency-Key': idempotencyKey },
		body: request,
	});
	return orderSchema.parse(payload);
}

async function getOrder(orderId: string): Promise<Order> {
	return orderSchema.parse(
		await apiFetch<unknown>(`/api/orders/${encodeURIComponent(orderId)}`),
	);
}

async function getCustomerProfile(): Promise<CustomerProfile> {
	return customerProfileSchema.parse(
		await apiFetch<unknown>('/api/customers/me'),
	);
}

export { getCustomerProfile, getOrder, getPaymentMethods, placeOrder };
