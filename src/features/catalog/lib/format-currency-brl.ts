const brlFormatter = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
});

function formatCurrencyBrl(amount: number) {
	return brlFormatter.format(amount);
}

export { formatCurrencyBrl };
