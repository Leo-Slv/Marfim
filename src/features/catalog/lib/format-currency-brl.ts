const wholeFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	minimumFractionDigits: 0,
	maximumFractionDigits: 0,
});

const centsFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

/**
 * Matches the mockups' price style: whole amounts drop the cents
 * (`R$ 1.290`), anything else shows two decimals (`R$ 189,90`).
 */
function formatCurrencyBrl(amount: number) {
	const formatter = Number.isInteger(amount) ? wholeFormatter : centsFormatter;
	// Intl separates the symbol with a non-breaking space; keep a plain one.
	return formatter.format(amount).replace(/\s/g, ' ');
}

export { formatCurrencyBrl };
