/** Lowercase without accents, so "devolucao" finds "devolução". */
function normalizeSearch(value: string) {
	return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export { normalizeSearch };
