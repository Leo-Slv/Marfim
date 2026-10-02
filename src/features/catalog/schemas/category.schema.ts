import { z } from 'zod';

/** Mirrors OrderCore's `CategoryResponse` (GET /api/catalog/categories). */
const categorySchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
});

const categoryListSchema = z.array(categorySchema);

export { categoryListSchema, categorySchema };
