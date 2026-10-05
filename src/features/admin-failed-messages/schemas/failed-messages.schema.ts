import { z } from 'zod';

const failedMessageStatusSchema = z.enum(['Pending', 'Replayed', 'Discarded']);

/** OrderCore's `FailedMessageSummaryResponse`. */
const failedMessageSchema = z.object({
	id: z.string(),
	messageId: z.string(),
	type: z.string(),
	contractVersion: z.number(),
	consumer: z.string(),
	status: failedMessageStatusSchema,
	attempts: z.number(),
	lastError: z.string(),
	firstFailedAt: z.string(),
	lastFailedAt: z.string(),
	resolvedAt: z.string().nullable(),
});

const failedMessagePageSchema = z.object({
	items: z.array(failedMessageSchema),
	page: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

/** OrderCore's `FailedMessageDetailsResponse`: + the envelope as received. */
const failedMessageDetailsSchema = failedMessageSchema.extend({
	traceParent: z.string().nullable(),
	body: z.string(),
});

type FailedMessageStatus = z.infer<typeof failedMessageStatusSchema>;
type FailedMessage = z.infer<typeof failedMessageSchema>;
type FailedMessageDetails = z.infer<typeof failedMessageDetailsSchema>;

export type { FailedMessage, FailedMessageDetails, FailedMessageStatus };
export { failedMessageDetailsSchema, failedMessagePageSchema };
