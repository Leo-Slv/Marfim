import { apiFetch } from '@/lib/http/api-client';

import type { ProductSortOrder, ProductSummaryPage } from '../model/product';
import { productSummaryPageSchema } from '../schemas/product.schema';

type GetProductsParams = {
	page: number;
	pageSize: number;
	categoryId?: string;
	sort?: ProductSortOrder;
};

async function getProducts({
	page,
	pageSize,
	categoryId,
	sort,
}: GetProductsParams): Promise<ProductSummaryPage> {
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (categoryId) {
		query.set('categoryId', categoryId);
	}
	if (sort) {
		query.set('sort', sort);
	}
	const payload = await apiFetch<unknown>(`/api/catalog/products?${query}`);

	return productSummaryPageSchema.parse(payload);
}

export type { GetProductsParams };
export { getProducts };
