import { z } from 'zod';

import { categorySchema } from '@/features/catalog/schemas/category.schema';
import { apiFetch } from '@/lib/http/api-client';

/** Creates a category; OrderCore makes the slug from the name. */
async function createCategory(name: string) {
	return categorySchema.parse(
		await apiFetch('/api/catalog/categories', {
			method: 'POST',
			body: { name, parentCategoryId: null, description: null },
		}),
	);
}

const totalSchema = z.object({ totalItems: z.number() });

/** Products in a category, any status (admin categories pendency #5). */
async function countCategoryProducts(categoryId: string) {
	const params = new URLSearchParams({
		CategoryId: categoryId,
		Page: '1',
		PageSize: '1',
	});
	return totalSchema.parse(
		await apiFetch(`/api/admin/catalog/products?${params.toString()}`),
	).totalItems;
}

export { countCategoryProducts, createCategory };
