import { z } from 'zod';

import { orderSchema } from '@/features/checkout/schemas/order.schema';

/** OrderCore's `OrderResponse` with the fulfilment fields the admin reads. */
const adminOrderSchema = orderSchema.extend({
	confirmedAt: z.string().nullable(),
	cancelledAt: z.string().nullable(),
	shippedAt: z.string().nullable(),
	deliveredAt: z.string().nullable(),
	shipment: z
		.object({
			carrier: z.string().nullable(),
			trackingCode: z.string().nullable(),
			trackingUrl: z.string().nullable(),
		})
		.nullable(),
});

/** OrderCore's `AdminOrderDetailsResponse` (`GET /api/admin/orders/{id}`). */
const adminOrderDetailsSchema = z.object({
	order: adminOrderSchema,
	internalNotes: z.string().nullable(),
	customer: z
		.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
			active: z.boolean(),
		})
		.nullable(),
	payment: z
		.object({
			paymentId: z.string(),
			status: z.string(),
			method: z.string(),
			amount: z.number(),
			provider: z.string(),
			authorizationExpiresAt: z.string().nullable(),
			authorizationExpiringSoon: z.boolean(),
		})
		.nullable(),
});

/** OrderCore's `OrderTimelineEntryResponse`. */
const timelineEntrySchema = z.object({
	eventId: z.string(),
	type: z.string(),
	source: z.string(),
	occurredAt: z.string(),
	details: z.record(z.string(), z.string().nullable()),
});

const timelineSchema = z.array(timelineEntrySchema);

/** OrderCore's `CustomerResponse` page (`GET /api/customers`). */
const customerPageSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
		}),
	),
	totalItems: z.number(),
});

const cancelOrderResponseSchema = z.object({
	paymentSettlement: z.string(),
});

type AdminOrder = z.infer<typeof adminOrderSchema>;
type AdminOrderDetails = z.infer<typeof adminOrderDetailsSchema>;
type TimelineEntry = z.infer<typeof timelineEntrySchema>;
type CustomerMatch = z.infer<typeof customerPageSchema>['items'][number];

export type { AdminOrder, AdminOrderDetails, CustomerMatch, TimelineEntry };
export {
	adminOrderDetailsSchema,
	adminOrderSchema,
	cancelOrderResponseSchema,
	customerPageSchema,
	timelineSchema,
};
