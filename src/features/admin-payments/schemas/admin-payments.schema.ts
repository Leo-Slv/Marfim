import { z } from 'zod';

/** OrderCore's `PaymentStatus`. */
const paymentStatusSchema = z.enum([
	'Pending',
	'Processing',
	'Authorized',
	'Captured',
	'Failed',
	'Refunded',
	'Voided',
]);

/** OrderCore's `PaymentSummaryResponse`. */
const paymentSummarySchema = z.object({
	id: z.string(),
	orderId: z.string(),
	amount: z.number(),
	refundedAmount: z.number(),
	method: z.string(),
	status: paymentStatusSchema,
	createdAt: z.string(),
});

const paymentPageSchema = z.object({
	items: z.array(paymentSummarySchema),
	page: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

/** OrderCore's `RefundResponse`. */
const refundSchema = z.object({
	id: z.string(),
	amount: z.number(),
	reason: z.string(),
	status: z.string(),
	requestedAt: z.string(),
	processedAt: z.string().nullable(),
});

/** OrderCore's `PaymentResponse`. */
const paymentSchema = z.object({
	id: z.string(),
	orderId: z.string(),
	amount: z.number(),
	method: z.string(),
	status: paymentStatusSchema,
	provider: z.string(),
	providerReference: z.string().nullable(),
	failureReason: z.string().nullable(),
	createdAt: z.string(),
	authorizedAt: z.string().nullable(),
	capturedAt: z.string().nullable(),
	voidedAt: z.string().nullable(),
	lastDeclineReason: z.string().nullable(),
	lastDeclinedAt: z.string().nullable(),
	disputedAt: z.string().nullable(),
	refunds: z.array(refundSchema),
});

/** OrderCore's `PaymentReconciliationResponse`. */
const reconciliationSchema = z.object({
	statusBefore: z.string(),
	statusAfter: z.string(),
	providerStatus: z.string().nullable(),
	changed: z.boolean(),
});

type PaymentStatus = z.infer<typeof paymentStatusSchema>;
type PaymentSummary = z.infer<typeof paymentSummarySchema>;
type Payment = z.infer<typeof paymentSchema>;
type Reconciliation = z.infer<typeof reconciliationSchema>;

export type { Payment, PaymentStatus, PaymentSummary, Reconciliation };
export { paymentPageSchema, paymentSchema, reconciliationSchema, refundSchema };
