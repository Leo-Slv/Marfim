import {
	contentSlugs,
	type ContentGroup,
	type ContentPageMeta,
	type ContentSlug,
} from '../model/content';

/** The pages of Conteudo.dc.html, grouped as in its index. */
const contentGroups: readonly ContentGroup[] = [
	{
		title: 'A MARFIM',
		pages: [
			{ slug: 'nossa-historia', label: 'Nossa história' },
			{ slug: 'ateliers', label: 'Ateliês parceiros' },
			{ slug: 'venda', label: 'Venda com a gente' },
			{ slug: 'lookbook', label: 'Lookbook' },
		],
	},
	{
		title: 'AJUDA',
		pages: [
			{ slug: 'perguntas-frequentes', label: 'Perguntas frequentes' },
			{ slug: 'trocas-e-devolucoes', label: 'Trocas e devoluções' },
			{ slug: 'prazos', label: 'Prazos e frete' },
			{ slug: 'cuidados', label: 'Cuidados com as peças' },
			{ slug: 'rastrear', label: 'Rastrear pedido' },
		],
	},
	{
		title: 'LEGAL',
		pages: [
			{ slug: 'privacidade', label: 'Privacidade' },
			{ slug: 'termos', label: 'Termos de uso' },
		],
	},
];

function isContentSlug(value: string): value is ContentSlug {
	return (contentSlugs as readonly string[]).includes(value);
}

function getContentPage(slug: ContentSlug): ContentPageMeta {
	const page = contentGroups
		.flatMap((group) => group.pages)
		.find((item) => item.slug === slug);
	if (!page) {
		throw new Error(`Unknown content page: ${slug}`);
	}
	return page;
}

export { contentGroups, getContentPage, isContentSlug };
