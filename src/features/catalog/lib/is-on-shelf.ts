import type { ProductSummary } from '../model/product';

/**
 * Whether the storefront may show the product. OrderCore lists drafts and
 * discontinued products too when the caller is an admin, but only published
 * products open at `by-slug` — so the store keeps `Active` ones only.
 */
function isOnShelf(product: Pick<ProductSummary, 'status'>) {
	return product.status === 'Active';
}

export { isOnShelf };
