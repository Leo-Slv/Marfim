import { z } from 'zod';

/** Mirrors OrderCore's `OrderAddressResponse`. */
const orderAddressSchema = z.object({
	street: z.string(),
	number: z.string(),
	complement: z.string().nullable(),
	neighborhood: z.string(),
	city: z.string(),
	state: z.string(),
	postalCode: z.string(),
	country: z.string(),
});

/** Mirrors OrderCore's `OrderItemResponse` (snapshots at checkout). */
const orderItemSchema = z.object({
	productId: z.string(),
	productSku: z.string(),
	productName: z.string(),
	productImageUrl: z.string().nullable(),
	unitPrice: z.number(),
	quantity: z.number(),
	total: z.number(),
});

/** Mirrors OrderCore's `OrderPaymentResponse` (+ next action on checkout). */
const orderPaymentSchema = z.object({
	paymentId: z.string(),
	status: z.string(),
	method: z.string(),
	failureReason: z.string().nullable(),
	nextAction: z
		.object({ type: z.string(), clientSecret: z.string() })
		.nullable()
		.optional(),
});

/** OrderCore's `OrderStatus`. */
const orderStatusSchema = z.enum([
	'Created',
	'PendingPayment',
	'Confirmed',
	'Processing',
	'Shipped',
	'Delivered',
	'PaymentFailed',
	'Cancelled',
]);

/** Mirrors OrderCore's `OrderResponse` (fields this app reads). */
const orderSchema = z.object({
	id: z.string(),
	orderNumber: z.string(),
	status: orderStatusSchema,
	createdAt: z.string(),
	subtotalAmount: z.number(),
	discountAmount: z.number(),
	shippingAmount: z.number(),
	totalAmount: z.number(),
	currency: z.string(),
	shippingAddress: orderAddressSchema.nullable(),
	billingAddress: orderAddressSchema.nullable(),
	items: z.array(orderItemSchema),
	payment: orderPaymentSchema.nullable(),
});

/** Mirrors OrderCore's `PaymentMethodsResponse` (GET /api/payments/methods). */
const paymentMethodsSchema = z.object({
	provider: z.string(),
	methods: z.array(z.string()),
	publishableKey: z.string().nullable(),
});

/** Mirrors OrderCore's `CustomerResponse` (GET /api/customers/me). */
const customerProfileSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
});

export {
	customerProfileSchema,
	orderSchema,
	orderStatusSchema,
	paymentMethodsSchema,
};
