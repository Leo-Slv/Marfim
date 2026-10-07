import type { FaqCategory, FaqEntry } from '../model/content';

/** Lowercase without accents, so "devolucao" finds "devolução". */
function normalizeSearch(value: string) {
	return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

/** FAQ entries of a category whose question or answer contains the term. */
function filterFaqs(
	entries: readonly FaqEntry[],
	category: FaqCategory,
	term: string,
) {
	const needle = normalizeSearch(term.trim());
	return entries.filter(
		(entry) =>
			(category === 'Todas' || entry.category === category) &&
			(!needle ||
				normalizeSearch(`${entry.question} ${entry.answer}`).includes(needle)),
	);
}

export { filterFaqs, normalizeSearch };
