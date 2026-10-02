import { z } from 'zod';

/** `CartLineIssue` in OrderCore's Orders module, most serious first. */
const cartLineIssueSchema = z.enum([
	'NotFound',
	'Unavailable',
	'InsufficientStock',
	'PriceChanged',
]);

/** Mirrors OrderCore's `CartQuoteLineResponse`. */
const cartQuoteLineSchema = z.object({
	productId: z.string(),
	productName: z.string().nullable(),
	slug: z.string().nullable(),
	imageUrl: z.string().nullable(),
	unitPrice: z.number().nullable(),
	quantity: z.number(),
	lineTotal: z.number(),
	issue: cartLineIssueSchema.nullable(),
	previousUnitPrice: z.number().nullable(),
});

/** Mirrors OrderCore's `CartQuoteResponse` (POST /api/orders/cart/quote). */
const cartQuoteSchema = z.object({
	currency: z.string().nullable(),
	/** Sum of the buyable lines (no issue, or only a price change). */
	total: z.number(),
	/** Every line has no issue at all. */
	isValid: z.boolean(),
	lines: z.array(cartQuoteLineSchema),
});

export { cartLineIssueSchema, cartQuoteLineSchema, cartQuoteSchema };
