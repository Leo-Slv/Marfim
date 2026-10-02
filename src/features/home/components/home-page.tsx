'use client';

import { useState } from 'react';

import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import { useProducts } from '@/features/catalog/hooks/catalog.queries';

import { atelierProductNames } from '../lib/atelier-products';
import { ateliers } from '../lib/ateliers';
import { AteliersSection } from './ateliers-section';
import { FeaturedProductsSection } from './featured-products-section';
import { HomeHero } from './home-hero';
import { PromoBanner } from './promo-banner';
import { ShippingSection } from './shipping-section';

/** OrderCore's maximum page size — enough to group the catalog by atelier. */
const ALL_PRODUCTS_PAGE_SIZE = 100;

/** Storefront home (Docs/specs/storefront/home.md). */
function HomePage() {
	const [atelierIndex, setAtelierIndex] = useState(0);
	const allProducts = useProducts({
		page: 1,
		pageSize: ALL_PRODUCTS_PAGE_SIZE,
	});

	const atelier = ateliers[atelierIndex];
	const productNames = allProducts.data
		? atelierProductNames(allProducts.data.items, atelier.name)
		: null;

	return (
		<div className="flex min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main>
				<HomeHero />
				<FeaturedProductsSection />
				<PromoBanner />
				<AteliersSection
					selectedIndex={atelierIndex}
					onSelect={setAtelierIndex}
					productNames={productNames}
				/>
				<ShippingSection
					atelier={atelier}
					firstProductName={productNames?.[0] ?? null}
				/>
			</main>
			<StoreFooter />
		</div>
	);
}

export { HomePage };
