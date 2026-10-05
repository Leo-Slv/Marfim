import { z } from 'zod';

import { orderStatusSchema } from '@/features/checkout/schemas/order.schema';

/** OrderCore's `CustomerResponse`. */
const adminCustomerSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	phone: z.string().nullable(),
	active: z.boolean(),
	createdAt: z.string(),
});

const adminCustomerPageSchema = z.object({
	items: z.array(adminCustomerSchema),
	page: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

/** OrderCore's `OrderSummaryResponse` (a customer's orders). */
const customerOrderSchema = z.object({
	id: z.string(),
	orderNumber: z.string(),
	status: orderStatusSchema,
	createdAt: z.string(),
	totalAmount: z.number(),
});

const customerOrderPageSchema = z.object({
	items: z.array(customerOrderSchema),
	totalItems: z.number(),
});

type AdminCustomer = z.infer<typeof adminCustomerSchema>;
type CustomerOrder = z.infer<typeof customerOrderSchema>;

export type { AdminCustomer, CustomerOrder };
export {
	adminCustomerPageSchema,
	adminCustomerSchema,
	customerOrderPageSchema,
};
