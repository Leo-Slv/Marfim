import type { ProductSummary } from '@/features/catalog/model/product';

type Piece = Pick<ProductSummary, 'slug' | 'name'>;

/** The catalog's pieces made by an atelier (its `brand`). */
function piecesOfAtelier(
	products: readonly Pick<ProductSummary, 'slug' | 'name' | 'brand'>[],
	atelierName: string,
): Piece[] {
	return products
		.filter((product) => product.brand === atelierName)
		.map(({ slug, name }) => ({ slug, name }));
}

/** The tagged slugs that exist in the catalog, in the tags' order. */
function piecesInCatalog(
	products: readonly Piece[],
	slugs: readonly string[],
): Piece[] {
	return slugs.flatMap((slug) => {
		const product = products.find((item) => item.slug === slug);
		return product ? [{ slug: product.slug, name: product.name }] : [];
	});
}

export type { Piece };
export { piecesInCatalog, piecesOfAtelier };
