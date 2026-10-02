import type { ProductAvailability } from '../model/product';

type ProductBadgeTone = 'muted' | 'warning' | 'new' | 'editorial';

type ProductBadge = { label: string; tone: ProductBadgeTone };

/**
 * The status badge a listing card shows (Listagem.dc.html): stock state
 * wins over the editorial tag from the slug map.
 */
function getProductBadge(
	availability: ProductAvailability,
	editorialTag: string | undefined,
): ProductBadge | null {
	if (availability === 'OutOfStock') {
		return { label: 'Esgotado', tone: 'muted' };
	}
	if (availability === 'LowStock') {
		return { label: 'Últimas unidades', tone: 'warning' };
	}
	if (!editorialTag) {
		return null;
	}
	return {
		label: editorialTag,
		tone: editorialTag === 'Novo' ? 'new' : 'editorial',
	};
}

export type { ProductBadge, ProductBadgeTone };
export { getProductBadge };
