import { z } from 'zod';

/** Mirrors OrderCore's `ProductSummaryResponse` (GET /catalog/products). */
const productSummarySchema = z.object({
	id: z.string(),
	sku: z.string(),
	slug: z.string(),
	name: z.string(),
	shortDescription: z.string().nullable(),
	brand: z.string().nullable(),
	categoryId: z.string(),
	currentPrice: z.number(),
	compareAtPrice: z.number().nullable(),
	currency: z.string(),
	status: z.string(),
	primaryImageUrl: z.string().nullable(),
	availability: z.string(),
});

/** Mirrors OrderCore's `PagedResponse<T>`. */
const productSummaryPageSchema = z.object({
	items: z.array(productSummarySchema),
	page: z.number(),
	pageSize: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

export { productSummarySchema, productSummaryPageSchema };
