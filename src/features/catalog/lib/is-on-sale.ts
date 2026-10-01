import type { ProductSummary } from '../model/product';

/** Same rule as OrderCore's `onSale` filter: compare-at above current. */
function isOnSale(
	product: Pick<ProductSummary, 'currentPrice' | 'compareAtPrice'>,
) {
	return (
		product.compareAtPrice !== null &&
		product.compareAtPrice > product.currentPrice
	);
}

export { isOnSale };
