import { z } from 'zod';

import { apiFetch } from '@/lib/http/api-client';

import {
	reservationPageSchema,
	stockItemSchema,
	stockMovementPageSchema,
	stockRowsSchema,
} from '../schemas/admin-inventory.schema';

type StockFilterValue = 'LowStock' | 'OutOfStock' | null;

/** Products with their stock (the inventory list has no names — pendency #1). */
async function listStock(filter: {
	stock: StockFilterValue;
	page: number;
	pageSize: number;
}) {
	const params = new URLSearchParams({
		Page: String(filter.page),
		PageSize: String(filter.pageSize),
	});
	if (filter.stock) {
		params.set('Stock', filter.stock);
	}
	return stockRowsSchema.parse(
		await apiFetch(`/api/admin/catalog/products?${params.toString()}`),
	);
}

function itemPath(productId: string, action = '') {
	return `/api/inventory/stock-items/${encodeURIComponent(productId)}${action}`;
}

async function getStockItem(productId: string) {
	return stockItemSchema.parse(await apiFetch(itemPath(productId)));
}

async function receiveStock(productId: string, quantity: number) {
	return stockItemSchema.parse(
		await apiFetch(itemPath(productId, '/receive'), {
			method: 'POST',
			body: { quantity, reason: 'Recebimento do ateliê' },
		}),
	);
}

/** `quantity` is signed: + adds to the units on hand, − takes away. */
async function adjustStock(
	productId: string,
	quantity: number,
	reason: string,
) {
	return stockItemSchema.parse(
		await apiFetch(itemPath(productId, '/adjust'), {
			method: 'POST',
			body: { quantity, reason },
		}),
	);
}

async function setReorderLevel(productId: string, reorderLevel: number) {
	return stockItemSchema.parse(
		await apiFetch(itemPath(productId, '/reorder-level'), {
			method: 'PUT',
			body: { reorderLevel },
		}),
	);
}

async function getMovements(productId: string, page: number, pageSize: number) {
	return stockMovementPageSchema.parse(
		await apiFetch(
			`${itemPath(productId, '/movements')}?page=${page}&pageSize=${pageSize}`,
		),
	);
}

async function getReservations(productId: string) {
	return reservationPageSchema.parse(
		await apiFetch(
			`${itemPath(productId, '/reservations')}?page=1&pageSize=100`,
		),
	).items;
}

const orderNumberSchema = z.object({
	order: z.object({ orderNumber: z.string() }),
});

/** The reservation has the order id only (pendency #3). */
async function getOrderNumber(orderId: string) {
	return orderNumberSchema.parse(
		await apiFetch(`/api/admin/orders/${encodeURIComponent(orderId)}`),
	).order.orderNumber;
}

export type { StockFilterValue };
export {
	adjustStock,
	getMovements,
	getOrderNumber,
	getReservations,
	getStockItem,
	listStock,
	receiveStock,
	setReorderLevel,
};
