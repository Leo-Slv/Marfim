import type { Category } from '@/features/catalog/model/category';
import type { ProductSummary } from '@/features/catalog/model/product';

/**
 * EXPLORE chips of the mobile search: the catalog's categories, then its
 * ateliers (brands) in the order they first appear. OrderCore records no
 * searches, so there is no "most searched" (mobile navigation pendency #2).
 */
function exploreTerms(
	categories: readonly Pick<Category, 'name'>[],
	products: readonly Pick<ProductSummary, 'brand'>[],
): string[] {
	const ateliers = products
		.map((product) => product.brand)
		.filter((brand): brand is string => Boolean(brand));
	return [...new Set([...categories.map((item) => item.name), ...ateliers])];
}

export { exploreTerms };
