import { apiFetch } from '@/lib/http/api-client';

import type { ProductDetail } from '../model/product';
import { productDetailSchema } from '../schemas/product.schema';

async function getProductBySlug(slug: string): Promise<ProductDetail> {
	const payload = await apiFetch<unknown>(
		`/api/catalog/products/by-slug/${encodeURIComponent(slug)}`,
	);

	return productDetailSchema.parse(payload);
}

export { getProductBySlug };
