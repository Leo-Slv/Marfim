import { apiFetch } from '@/lib/http/api-client';

import type { ProductSummaryPage } from '../model/product';
import { productSummaryPageSchema } from '../schemas/product.schema';

type GetProductsParams = {
	page: number;
	pageSize: number;
};

async function getProducts({
	page,
	pageSize,
}: GetProductsParams): Promise<ProductSummaryPage> {
	const query = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	const payload = await apiFetch<unknown>(`/catalog/products?${query}`);

	return productSummaryPageSchema.parse(payload);
}

export type { GetProductsParams };
export { getProducts };
