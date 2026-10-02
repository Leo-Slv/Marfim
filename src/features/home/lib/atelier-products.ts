type BrandedProduct = { name: string; brand: string | null };

/** Names of the products made by an atelier (matched by `brand`). */
function atelierProductNames(
	products: readonly BrandedProduct[],
	atelierName: string,
) {
	return products
		.filter((product) => product.brand === atelierName)
		.map((product) => product.name);
}

/** "3 peças: Vaso Duna, Jarra Seixo, …" / "1 peça: Cadeira Lina". */
function formatAtelierProductsLine(names: readonly string[]) {
	if (names.length === 0) {
		return 'Peças em breve';
	}
	const noun = names.length > 1 ? 'peças' : 'peça';
	return `${names.length} ${noun}: ${names.join(', ')}`;
}

export { atelierProductNames, formatAtelierProductsLine };
