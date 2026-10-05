import { adminOrderPageSchema } from '@/features/admin-dashboard/schemas/admin-dashboard.schema';
import type { OrderStatus } from '@/features/checkout/model/order';
import { apiFetch } from '@/lib/http/api-client';

import {
	adminOrderDetailsSchema,
	adminOrderSchema,
	cancelOrderResponseSchema,
	customerPageSchema,
	timelineSchema,
} from '../schemas/admin-orders.schema';

/** Internal, never shown to shoppers (OrderCore keeps it in the event). */
const STORE_CANCEL_REASON = 'Cancelled by the store';

type AdminOrderListFilter = {
	status: OrderStatus | null;
	customerId: string | null;
	page: number;
	pageSize: number;
};

function listQuery(filter: Partial<AdminOrderListFilter>) {
	const params = new URLSearchParams();
	if (filter.status) {
		params.set('Status', filter.status);
	}
	if (filter.customerId) {
		params.set('CustomerId', filter.customerId);
	}
	params.set('Page', String(filter.page ?? 1));
	params.set('PageSize', String(filter.pageSize ?? 1));
	return params.toString();
}

async function listAdminOrders(filter: AdminOrderListFilter) {
	return adminOrderPageSchema.parse(
		await apiFetch(`/api/admin/orders?${listQuery(filter)}`),
	);
}

/** How many orders match a status (`totalItems` of a one-item page). */
async function countAdminOrders(
	status: OrderStatus | null,
	customerId: string | null,
) {
	const page = adminOrderPageSchema.parse(
		await apiFetch(`/api/admin/orders?${listQuery({ status, customerId })}`),
	);
	return page.totalItems;
}

function orderPath(orderId: string, action = '') {
	return `/api/orders/${encodeURIComponent(orderId)}${action}`;
}

async function getAdminOrder(orderId: string) {
	return adminOrderDetailsSchema.parse(
		await apiFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`),
	);
}

async function getOrderTimeline(orderId: string) {
	return timelineSchema.parse(
		await apiFetch(`/api/admin/orders/${encodeURIComponent(orderId)}/timeline`),
	);
}

async function startProcessing(orderId: string) {
	return adminOrderSchema.parse(
		await apiFetch(orderPath(orderId, '/start-processing'), {
			method: 'POST',
		}),
	);
}

type ShipInput = {
	carrier: string;
	trackingCode: string;
	trackingUrl: string | null;
};

/** Captures the payment, then marks the order shipped. */
async function shipOrder(orderId: string, shipment: ShipInput) {
	return adminOrderSchema.parse(
		await apiFetch(orderPath(orderId, '/ship'), {
			method: 'POST',
			body: shipment,
		}),
	);
}

async function deliverOrder(orderId: string) {
	return adminOrderSchema.parse(
		await apiFetch(orderPath(orderId, '/deliver'), { method: 'POST' }),
	);
}

/** Cancels, voiding or refunding the payment and releasing the stock. */
async function cancelOrder(orderId: string) {
	return cancelOrderResponseSchema.parse(
		await apiFetch(orderPath(orderId, '/cancel'), {
			method: 'POST',
			body: { reason: STORE_CANCEL_REASON },
		}),
	);
}

/** Replaces the order's notes text (null clears it). */
async function setInternalNotes(orderId: string, notes: string | null) {
	await apiFetch(orderPath(orderId, '/internal-notes'), {
		method: 'PUT',
		body: { notes },
	});
}

async function getCustomer(customerId: string) {
	return customerPageSchema.shape.items.element.parse(
		await apiFetch(`/api/customers/${encodeURIComponent(customerId)}`),
	);
}

async function searchCustomers(term: string) {
	const params = new URLSearchParams({
		SearchTerm: term,
		Page: '1',
		PageSize: '6',
	});
	return customerPageSchema.parse(
		await apiFetch(`/api/customers?${params.toString()}`),
	).items;
}

export type { AdminOrderListFilter, ShipInput };
export {
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
};
