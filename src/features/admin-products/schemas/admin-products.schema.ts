import { z } from 'zod';

const productStatusSchema = z.enum(['Draft', 'Active', 'Discontinued']);

/** OrderCore's `ProductResponse` (`GET /api/catalog/products/{id}`). */
const adminProductSchema = z.object({
	id: z.string(),
	sku: z.string(),
	slug: z.string(),
	name: z.string(),
	shortDescription: z.string().nullable(),
	description: z.string().nullable(),
	brand: z.string().nullable(),
	categoryId: z.string(),
	currentPrice: z.number(),
	compareAtPrice: z.number().nullable(),
	currency: z.string(),
	status: productStatusSchema,
	variants: z.array(
		z.object({
			id: z.string(),
			sku: z.string(),
			name: z.string(),
			additionalPrice: z.number(),
		}),
	),
});

/** One row of `GET /api/admin/catalog/products`. */
const adminProductRowSchema = z.object({
	id: z.string(),
	sku: z.string(),
	slug: z.string(),
	name: z.string(),
	currentPrice: z.number(),
	compareAtPrice: z.number().nullable(),
	status: productStatusSchema,
});

const adminProductRowsSchema = z.object({
	items: z.array(adminProductRowSchema),
	page: z.number(),
	totalItems: z.number(),
	totalPages: z.number(),
});

type ProductStatus = z.infer<typeof productStatusSchema>;
type AdminProduct = z.infer<typeof adminProductSchema>;
type AdminProductRow = z.infer<typeof adminProductRowSchema>;

export type { AdminProduct, AdminProductRow, ProductStatus };
export { adminProductRowsSchema, adminProductSchema, productStatusSchema };
