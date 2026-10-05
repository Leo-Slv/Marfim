import type {
	ProductArtKind,
	ProductVisual,
} from '@/features/catalog/lib/product-visuals';
import { productTints } from '@/features/catalog/lib/product-visuals';
import type {
	ProductAvailability,
	ProductSummary,
} from '@/features/catalog/model/product';
import { MAX_LINE_QUANTITY } from '@/features/cart/lib/cart-lines';
import { ateliers } from '@/features/home/lib/ateliers';

type GalleryView = {
	id: string;
	label: string;
	caption: string;
	background: string;
	/** Drawing width in the big view (the detail one is cropped). */
	size: number;
	thumbSize: number;
	lit: boolean;
};

const LIGHTING: readonly ProductArtKind[] = ['lamp', 'sconce', 'pendant'];

/** Frente, Acesa (lighting only), Detalhe, Ambiente — Produto.dc.html. */
function galleryViews(visual: ProductVisual): GalleryView[] {
	const views: GalleryView[] = [
		{
			id: 'frente',
			label: 'Frente',
			caption: 'FRENTE',
			background: visual.tint,
			size: 300,
			thumbSize: 48,
			lit: false,
		},
	];
	if (LIGHTING.includes(visual.kind)) {
		views.push({
			id: 'acesa',
			label: 'Acesa',
			caption: 'ACESA · LUZ QUENTE',
			background: '#232327',
			size: 300,
			thumbSize: 48,
			lit: true,
		});
	}
	views.push(
		{
			id: 'detalhe',
			label: 'Detalhe',
			caption: 'DETALHE',
			background: productTints.indigo,
			size: 560,
			thumbSize: 96,
			lit: false,
		},
		{
			id: 'ambiente',
			label: 'No ambiente',
			caption: 'NO AMBIENTE',
			background: productTints.clay,
			size: 200,
			thumbSize: 36,
			lit: false,
		},
	);
	return views;
}

type StockLine = {
	label: string;
	note: string | null;
	tone: 'ok' | 'low' | 'out';
};

/** OrderCore only says in stock / low / out (product pendency #2). */
function stockLine(availability: ProductAvailability): StockLine {
	switch (availability) {
		case 'LowStock':
			return {
				label: 'Últimas unidades',
				note: 'o ateliê produz em lotes pequenos',
				tone: 'low',
			};
		case 'OutOfStock':
			return { label: 'Esgotado', note: null, tone: 'out' };
		default:
			return { label: 'Em estoque', note: null, tone: 'ok' };
	}
}

/** "OFICINA FAÍSCA · SÃO PAULO · SP" (city from the editorial ateliers). */
function atelierLine(brand: string | null) {
	if (!brand) {
		return null;
	}
	const atelier = ateliers.find((item) => item.name === brand);
	return atelier
		? `${brand.toUpperCase()} · ${atelier.city}`
		: brand.toUpperCase();
}

/** Care text per category slug (decided: editorial, product pendency #1). */
const careByCategory: Record<string, string> = {
	iluminacao:
		'Limpe com pano macio e seco, com a peça desligada e fria. O latão ganha pátina com o tempo; para manter o brilho, use cera neutra a cada seis meses.',
	cozinha:
		'Cerâmica feita à mão: lave à mão, com detergente neutro e esponja macia. Evite choques térmicos, como ir do congelador direto ao forno. Pequenas variações de cor e textura fazem parte da peça.',
	casa: 'Tire o pó com pano seco ou levemente úmido e seque em seguida. Evite sol direto e fontes de calor; na madeira, cera de abelha a cada seis meses mantém o acabamento.',
	texteis:
		'Lave à mão ou na máquina em ciclo delicado, com água fria e sabão neutro. Seque à sombra, na horizontal. Fibras naturais podem encolher levemente na primeira lavagem.',
};

function careText(categorySlug: string | null) {
	return (
		(categorySlug ? careByCategory[categorySlug] : undefined) ??
		'Limpe com pano macio e seco. Evite sol direto, umidade e produtos abrasivos.'
	);
}

const RETURNS_TEXT =
	'Você tem 30 dias a partir do recebimento para trocar ou devolver.';

/** How many more of this piece fit in the bag (9 per piece). */
function remainingInBag(quantityInBag: number) {
	return Math.max(0, MAX_LINE_QUANTITY - quantityInBag);
}

function clampQuantity(quantity: number, max: number) {
	return Math.min(Math.max(1, max), Math.max(1, Math.round(quantity)));
}

/** "Combina com": same category, not this piece, available first, 3. */
function recommendations(
	products: readonly ProductSummary[],
	current: { id: string; categoryId: string },
	limit = 3,
) {
	return products
		.filter(
			(product) =>
				product.id !== current.id && product.categoryId === current.categoryId,
		)
		.sort(
			(a, b) =>
				Number(a.availability === 'OutOfStock') -
				Number(b.availability === 'OutOfStock'),
		)
		.slice(0, limit);
}

export type { GalleryView, StockLine };
export {
	atelierLine,
	careText,
	clampQuantity,
	galleryViews,
	recommendations,
	remainingInBag,
	RETURNS_TEXT,
	stockLine,
};
