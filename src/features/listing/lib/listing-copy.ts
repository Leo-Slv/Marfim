import type { ListingMode } from '../model/listing';

/** Special `?categoria=` value: every product, newest first. */
const NEWEST_SLUG = 'novidades';
const MIN_SEARCH_LENGTH = 2;

const ALL_BLURB = 'Todas as peças dos quatro ateliês, em um lugar só.';
const NEWEST_BLURB = 'O que acabou de sair das bancadas nesta estação.';

/** Editorial one-liners per category slug (Listagem.dc.html). */
const categoryBlurbs: Record<string, string> = {
	casa: 'Vasos, assentos e objetos que deixam a casa mais calma.',
	cozinha: 'Cerâmica de alta temperatura para usar todo dia.',
	iluminacao: 'Luminárias em latão e vidro soprado, montadas uma a uma.',
	texteis: 'Mantas, almofadas e toalhas tecidas em tear manual.',
};

const DEFAULT_CATEGORY_BLURB = 'Peças feitas à mão pelos nossos ateliês.';

/** `null` = Tudo. */
function categoryBlurb(slug: string | null) {
	if (slug === null) {
		return ALL_BLURB;
	}
	if (slug === NEWEST_SLUG) {
		return NEWEST_BLURB;
	}
	return categoryBlurbs[slug] ?? DEFAULT_CATEGORY_BLURB;
}

/** "1 peça" / "8 peças". */
function formatPieceCount(count: number) {
	return `${count} ${count === 1 ? 'peça' : 'peças'}`;
}

/** `3 resultados para “lumin”`. */
function formatResultCount(count: number, term: string) {
	const noun = count === 1 ? 'resultado' : 'resultados';
	return `${count} ${noun} para “${term}”`;
}

function isSearchable(term: string) {
	return term.trim().length >= MIN_SEARCH_LENGTH;
}

function emptyStateCopy(mode: ListingMode, term: string) {
	switch (mode) {
		case 'search':
			return {
				title: `Nada encontrado para “${term.trim()}”`,
				text: 'Confira a grafia ou tente um termo mais geral, como o tipo da peça ou o nome do ateliê.',
			};
		case 'promotions':
			return {
				title: 'Nenhuma promoção no momento',
				text: 'A próxima Semana do Design ainda não começou. Veja as peças da coleção.',
			};
		case 'category':
			return {
				title: 'Nenhuma peça nesta categoria ainda',
				text: 'Os ateliês estão produzindo novas peças. Enquanto isso, veja as outras categorias.',
			};
	}
}

export {
	categoryBlurb,
	emptyStateCopy,
	formatPieceCount,
	formatResultCount,
	isSearchable,
	MIN_SEARCH_LENGTH,
	NEWEST_SLUG,
};
