import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';

import { sectionsPages } from '../lib/content-copy';
import type { ContentSlug } from '../model/content';
import { ContentChipNav, ContentSideNav } from './content-nav';
import { HelpCard } from './content-ui';
import { AteliersPage } from './pages/ateliers-page';
import { FaqPage } from './pages/faq-page';
import { LookbookPage } from './pages/lookbook-page';
import { ReturnsPage } from './pages/returns-page';
import { SellPage } from './pages/sell-page';
import { StoryPage } from './pages/story-page';
import { TrackingPage } from './pages/tracking-page';
import { SectionsPageBody } from './sections-page';

/** Institucional e ajuda (Conteudo.dc.html / MobileConteudo.dc.html). */
function ContentPage({ slug }: { slug: ContentSlug }) {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<ContentChipNav current={slug} />
			<main className="grow px-4 pt-[22px] pb-6 min-[980px]:px-10 min-[980px]:pt-10 min-[980px]:pb-[72px]">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-8 min-[980px]:grid-cols-12">
					<ContentSideNav current={slug} />
					<div className="flex flex-col min-[980px]:col-span-9">
						<ContentBody slug={slug} />
						<HelpCard />
					</div>
				</div>
			</main>
			<StoreFooter />
		</div>
	);
}

function ContentBody({ slug }: { slug: ContentSlug }) {
	switch (slug) {
		case 'nossa-historia':
			return <StoryPage />;
		case 'ateliers':
			return <AteliersPage />;
		case 'venda':
			return <SellPage />;
		case 'lookbook':
			return <LookbookPage />;
		case 'perguntas-frequentes':
			return <FaqPage />;
		case 'trocas-e-devolucoes':
			return <ReturnsPage />;
		case 'rastrear':
			return <TrackingPage />;
		case 'prazos':
		case 'cuidados':
		case 'privacidade':
		case 'termos': {
			const page = sectionsPages[slug];
			return page ? <SectionsPageBody page={page} /> : null;
		}
	}
}

export { ContentPage };
