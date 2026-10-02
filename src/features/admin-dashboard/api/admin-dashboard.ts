import type { OrderStatus } from '@/features/checkout/model/order';
import { apiFetch } from '@/lib/http/api-client';

import {
	adminOrderPageSchema,
	adminProductPageSchema,
	dashboardSchema,
} from '../schemas/admin-dashboard.schema';

function query(params: Record<string, string | number | undefined>) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			search.set(key, String(value));
		}
	}
	return search.toString();
}

async function getDashboard(from: string, to: string) {
	return dashboardSchema.parse(
		await apiFetch(`/api/admin/dashboard?${query({ from, to })}`),
	);
}

type AdminOrdersFilter = {
	status?: OrderStatus;
	createdFrom?: string;
	createdTo?: string;
	page?: number;
	pageSize?: number;
};

async function getAdminOrders(filter: AdminOrdersFilter) {
	return adminOrderPageSchema.parse(
		await apiFetch(
			`/api/admin/orders?${query({
				Status: filter.status,
				CreatedFrom: filter.createdFrom,
				CreatedTo: filter.createdTo,
				Page: filter.page,
				PageSize: filter.pageSize,
			})}`,
		),
	);
}

async function getAdminProducts(filter: {
	stock?: 'InStock' | 'LowStock' | 'OutOfStock';
	page?: number;
	pageSize?: number;
}) {
	return adminProductPageSchema.parse(
		await apiFetch(
			`/api/admin/catalog/products?${query({
				Stock: filter.stock,
				Page: filter.page,
				PageSize: filter.pageSize,
			})}`,
		),
	);
}

export type { AdminOrdersFilter };
export { getAdminOrders, getAdminProducts, getDashboard };
