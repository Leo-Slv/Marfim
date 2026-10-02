import { z } from 'zod';

import { orderStatusSchema } from '@/features/checkout/schemas/order.schema';

function pagedSchema<TItem extends z.ZodType>(item: TItem) {
	return z.object({
		items: z.array(item),
		page: z.number(),
		pageSize: z.number(),
		totalItems: z.number(),
		totalPages: z.number(),
	});
}

/** OrderCore's `AdminOrderSummaryResponse`. */
const adminOrderSummarySchema = z.object({
	id: z.string(),
	orderNumber: z.string(),
	status: orderStatusSchema,
	createdAt: z.string(),
	totalAmount: z.number(),
	currency: z.string(),
	itemCount: z.number(),
	customer: z
		.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
			active: z.boolean(),
		})
		.nullable(),
	paymentStatus: z.string().nullable(),
	authorizationExpiringSoon: z.boolean(),
});

const adminOrderPageSchema = pagedSchema(adminOrderSummarySchema);

/** OrderCore's `DashboardResponse` (`GET /api/admin/dashboard`). */
const dashboardSchema = z.object({
	from: z.string(),
	to: z.string(),
	ordersByStatus: z.record(z.string(), z.number()),
	revenueByCurrency: z.record(z.string(), z.number()),
	newCustomers: z.number(),
	stock: z.object({ lowStock: z.number(), outOfStock: z.number() }),
	expiringAuthorizations: z.number(),
	recentOrders: z.array(adminOrderSummarySchema),
});

/** OrderCore's `AdminProductSummaryResponse` — the fields used here. */
const adminProductSummarySchema = z.object({
	id: z.string(),
	sku: z.string(),
	slug: z.string(),
	name: z.string(),
	stock: z
		.object({
			quantityAvailable: z.number(),
			reorderLevel: z.number(),
			state: z.string(),
		})
		.nullable(),
});

const adminProductPageSchema = pagedSchema(adminProductSummarySchema);

type AdminOrderSummary = z.infer<typeof adminOrderSummarySchema>;
type Dashboard = z.infer<typeof dashboardSchema>;
type AdminProductSummary = z.infer<typeof adminProductSummarySchema>;

export type { AdminOrderSummary, AdminProductSummary, Dashboard };
export {
	adminOrderPageSchema,
	adminOrderSummarySchema,
	adminProductPageSchema,
	dashboardSchema,
	pagedSchema,
};
