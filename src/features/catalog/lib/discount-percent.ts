/** `-13%`-style label for a price below its compare-at price. */
function formatDiscountPercent(currentPrice: number, compareAtPrice: number) {
	const percent = Math.round((1 - currentPrice / compareAtPrice) * 100);
	return `-${percent}%`;
}

export { formatDiscountPercent };
