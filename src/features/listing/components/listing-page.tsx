'use client';

import { Suspense } from 'react';

import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';

import type { ListingMode } from '../model/listing';
import { ListingContent } from './listing-content';
import { ListingGridSkeleton } from './listing-grid';

/** Product listing — category, search or promotions (Listagem.dc.html). */
function ListingPage({ mode }: { mode: ListingMode }) {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main className="flex grow flex-col">
				{/* Filters, sort and page live in the URL; Next 16 needs a Suspense
				    boundary around useSearchParams for the route to prerender. */}
				<Suspense fallback={<ListingFallback />}>
					<ListingContent mode={mode} />
				</Suspense>
			</main>
			<StoreFooter />
		</div>
	);
}

function ListingFallback() {
	return (
		<section className="pt-8 pb-16">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-10">
				<ListingGridSkeleton />
			</div>
		</section>
	);
}

export { ListingPage };
