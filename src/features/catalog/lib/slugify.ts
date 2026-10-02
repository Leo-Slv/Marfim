/**
 * "Par de canecas Grão" → "par-de-canecas-grao". Order items are snapshots
 * with a name but no slug; the catalog's slugs are the slugified names, so
 * this finds a product's drawing (`getProductVisual`) from an order line.
 */
function slugify(text: string) {
	return text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

export { slugify };
