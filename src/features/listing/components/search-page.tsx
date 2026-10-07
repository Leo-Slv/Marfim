'use client';

import { Suspense } from 'react';

import { useMediaQuery } from '@/lib/hooks/use-media-query';

import { ListingPage } from './listing-page';
import { MobileSearch } from './mobile-search';

/**
 * `/search`: MobileBusca.dc.html below 980 px, the listing's search mode
 * (Listagem.dc.html) above. Both own a field that writes `?q=`, so only the
 * one for the current width is mounted; before the width is known (SSR and
 * hydration) both render and CSS shows the right one.
 */
function SearchPage() {
	const desktop = useMediaQuery('(min-width: 980px)');

	return (
		<>
			{desktop !== true ? (
				<div className="min-[980px]:hidden">
					<Suspense>
						<MobileSearch />
					</Suspense>
				</div>
			) : null}
			{desktop !== false ? (
				<div className="hidden min-[980px]:block">
					<ListingPage mode="search" />
				</div>
			) : null}
		</>
	);
}

export { SearchPage };
