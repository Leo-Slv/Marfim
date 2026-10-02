/**
 * Drawings from Docs/design/mockups/Art.dc.html. Product photos are
 * deliberately not stored in OrderCore, so each product's drawing, tint and
 * editorial tag are chosen here by slug (backend pendencies #1 and #2 in
 * Docs/backend-pendencies/storefront/home.md).
 */
const productArtKinds = [
	'lamp',
	'sconce',
	'pendant',
	'vase',
	'jar',
	'chair',
	'bench',
	'mug',
	'bowl',
	'throw',
	'towel',
] as const;

type ProductArtKind = (typeof productArtKinds)[number];

type ProductVisual = {
	kind: ProductArtKind;
	/** Background behind the drawing. */
	tint: string;
	tag?: string;
};

const productTints = {
	indigo: '#ECECFD',
	sand: '#F1F0EC',
	sage: '#E8F5EC',
	clay: '#FCEEE4',
} as const;

const productVisualsBySlug: Record<string, ProductVisual> = {
	'luminaria-arco': {
		kind: 'lamp',
		tint: productTints.indigo,
		tag: 'Mais vendido',
	},
	'vaso-duna': { kind: 'vase', tint: productTints.sand, tag: 'Novo' },
	'cadeira-lina': { kind: 'chair', tint: productTints.sage },
	'par-de-canecas-grao': { kind: 'mug', tint: productTints.clay },
	'pendente-orbe': { kind: 'pendant', tint: productTints.sand },
	'manta-trama': { kind: 'throw', tint: productTints.indigo, tag: 'Novo' },
	'jarra-seixo': { kind: 'vase', tint: productTints.sage },
	'almofada-linho': { kind: 'throw', tint: productTints.clay },
};

const defaultProductVisual: ProductVisual = {
	kind: 'vase',
	tint: productTints.sand,
};

function getProductVisual(slug: string): ProductVisual {
	return productVisualsBySlug[slug] ?? defaultProductVisual;
}

export type { ProductArtKind, ProductVisual };
export { getProductVisual, productArtKinds, productTints };
