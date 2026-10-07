import { normalizeSearch } from '@/lib/text/normalize-search';

import type { Category } from '../model/category';
import type { ProductSummary } from '../model/product';

type Searchable = Pick<
	ProductSummary,
	'name' | 'brand' | 'categoryId' | 'shortDescription'
>;

/**
 * Name, atelier, category and short description, ignoring case and accents
 * (OrderCore only matches the name, accent-sensitively — mobile navigation
 * pendency #1).
 */
function matchesSearch(
	product: Searchable,
	categories: readonly Pick<Category, 'id' | 'name'>[],
	term: string,
) {
	const needle = normalizeSearch(term.trim());
	if (!needle) {
		return false;
	}
	const category = categories.find((item) => item.id === product.categoryId);
	const haystack = [
		product.name,
		product.brand,
		category?.name,
		product.shortDescription,
	]
		.filter(Boolean)
		.join(' ');
	return normalizeSearch(haystack).includes(needle);
}

/** The products matching the term, in the given order. */
function searchProducts<T extends Searchable>(
	products: readonly T[],
	categories: readonly Pick<Category, 'id' | 'name'>[],
	term: string,
): T[] {
	return products.filter((product) => matchesSearch(product, categories, term));
}

export { matchesSearch, searchProducts };
