import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';

import {
	paymentPageSchema,
	paymentSchema,
	reconciliationSchema,
	refundSchema,
	type PaymentStatus,
} from '../schemas/admin-payments.schema';

function listQuery(
	status: PaymentStatus | null,
	page: number,
	pageSize: number,
) {
	const params = new URLSearchParams({
		Page: String(page),
		PageSize: String(pageSize),
	});
	if (status) {
		params.set('Status', status);
	}
	return params.toString();
}

async function listPayments(
	status: PaymentStatus | null,
	page: number,
	pageSize: number,
) {
	return paymentPageSchema.parse(
		await apiFetch(`/api/payments?${listQuery(status, page, pageSize)}`),
	);
}

/** How many payments have this status (`totalItems` of a one-item page). */
async function countPayments(status: PaymentStatus | null) {
	return (await listPayments(status, 1, 1)).totalItems;
}

function paymentPath(paymentId: string, action = '') {
	return `/api/payments/${encodeURIComponent(paymentId)}${action}`;
}

async function getPayment(paymentId: string) {
	return paymentSchema.parse(await apiFetch(paymentPath(paymentId)));
}

/** Captured payments only; Stripe confirms it later (status Pending). */
async function requestRefund(
	paymentId: string,
	amount: number,
	reason: string,
) {
	return refundSchema.parse(
		await apiFetch(paymentPath(paymentId, '/refunds'), {
			method: 'POST',
			body: { amount, reason },
		}),
	);
}

/** Asks Stripe where the payment stands and applies it. */
async function reconcilePayment(paymentId: string) {
	return reconciliationSchema.parse(
		await apiFetch(paymentPath(paymentId, '/reconcile'), { method: 'POST' }),
	);
}

const orderNumberSchema = z.object({
	order: z.object({ orderNumber: z.string() }),
});

/** The payment list has the order id only (pendency #1). */
async function getOrderNumber(orderId: string) {
	return orderNumberSchema.parse(
		await apiFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`),
	).order.orderNumber;
}

export {
	countPayments,
	getOrderNumber,
	getPayment,
	listPayments,
	reconcilePayment,
	requestRefund,
};
