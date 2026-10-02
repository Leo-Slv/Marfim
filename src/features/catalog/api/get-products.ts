import { apiFetch } from '@/lib/http/api-client';

import type { ProductSortOrder, ProductSummaryPage } from '../model/product';
import { productSummaryPageSchema } from '../schemas/product.schema';

/** Mirrors OrderCore's `ListProductsFilter`. */
type GetProductsParams = {
	page: number;
	pageSize: number;
	categoryId?: string;
	sort?: ProductSortOrder;
	searchTerm?: string;
	/** Only products whose compare-at price is above the current price. */
	onSale?: boolean;
};

async function getProducts({
	page,
	pageSize,
	categoryId,
	sort,
	searchTerm,
	onSale,
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
	if (searchTerm) {
		query.set('searchTerm', searchTerm);
	}
	if (onSale) {
		query.set('onSale', 'true');
	}
	const payload = await apiFetch<unknown>(`/api/catalog/products?${query}`);

	return productSummaryPageSchema.parse(payload);
}

export type { GetProductsParams };
export { getProducts };
