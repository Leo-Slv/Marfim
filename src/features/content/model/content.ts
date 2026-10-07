import type { ProductArtKind } from '@/features/catalog/lib/product-visuals';

const contentSlugs = [
	'nossa-historia',
	'ateliers',
	'venda',
	'lookbook',
	'perguntas-frequentes',
	'trocas-e-devolucoes',
	'prazos',
	'cuidados',
	'rastrear',
	'privacidade',
	'termos',
] as const;

type ContentSlug = (typeof contentSlugs)[number];

type ContentPageMeta = {
	slug: ContentSlug;
	label: string;
};

type ContentGroup = {
	title: string;
	pages: readonly ContentPageMeta[];
};

const faqCategories = [
	'Todas',
	'Pedidos',
	'Pagamento',
	'Entrega',
	'Trocas',
	'Conta',
] as const;

type FaqCategory = (typeof faqCategories)[number];

type FaqEntry = {
	category: Exclude<FaqCategory, 'Todas'>;
	question: string;
	answer: string;
	/** The answer talks about something the store doesn't have yet. */
	soon?: boolean;
};

type ContentSection = {
	id: string;
	heading: string;
	text: string;
};

/** "Modelo B" pages: eyebrow, title, intro and plain sections. */
type SectionsPage = {
	eyebrow: string;
	title: string;
	intro: string;
	/** EM BREVE note under the intro. */
	soon?: string;
	sections: readonly ContentSection[];
};

type LookbookScene = {
	title: string;
	background: string;
	ink: string;
	/** Desktop height in px. */
	height: number;
	pieces: readonly { kind: ProductArtKind; size: number }[];
	/** Product slugs tagged in the scene. */
	productSlugs: readonly string[];
};

export type {
	ContentGroup,
	ContentPageMeta,
	ContentSection,
	ContentSlug,
	FaqCategory,
	FaqEntry,
	LookbookScene,
	SectionsPage,
};
export { contentSlugs, faqCategories };
