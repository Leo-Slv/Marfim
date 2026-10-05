const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
	timeZone: 'America/Sao_Paulo',
	day: '2-digit',
	month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
	timeZone: 'America/Sao_Paulo',
	hour: '2-digit',
	minute: '2-digit',
});

/** "01 out · 10:42" (store time) — the list and the detail header. */
function formatOrderMoment(iso: string) {
	const date = new Date(iso);
	const day = dayFormatter.format(date).replace('.', '').replace(' de ', ' ');
	return `${day} · ${timeFormatter.format(date)}`;
}

export { formatOrderMoment };
