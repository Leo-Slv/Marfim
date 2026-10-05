import { z } from 'zod';

/** `StockAvailability` in OrderCore's Catalog module. */
const availabilitySchema = z.enum(['InStock', 'LowStock', 'OutOfStock']);

/** Mirrors OrderCore's `ProductSummaryResponse` (GET /api/catalog/products). */
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
	availability: availabilitySchema,
});

/** Mirrors OrderCore's `PagedResponse<T>`. */
const productSummaryPageSchema = z.object({
	items: z.array(productSummarySchema),
	page: z.number(),
	pageSize: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

/**
 * Mirrors OrderCore's `ProductResponse`
 * (GET /api/catalog/products/by-slug/{slug}). Images stay loose: the store
 * draws its products instead of showing photos.
 */
const productDetailSchema = productSummarySchema
	.omit({ primaryImageUrl: true })
	.extend({
		description: z.string().nullable(),
		images: z.array(z.unknown()),
		variants: z.array(
			z.object({
				id: z.string(),
				sku: z.string(),
				name: z.string(),
				additionalPrice: z.number(),
			}),
		),
	});

export {
	availabilitySchema,
	productDetailSchema,
	productSummaryPageSchema,
	productSummarySchema,
};
