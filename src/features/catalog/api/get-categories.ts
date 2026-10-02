import { apiFetch } from '@/lib/http/api-client';

import type { Category } from '../model/category';
import { categoryListSchema } from '../schemas/category.schema';

async function getCategories(): Promise<Category[]> {
	const payload = await apiFetch<unknown>('/api/catalog/categories');

	return categoryListSchema.parse(payload);
}

export { getCategories };
