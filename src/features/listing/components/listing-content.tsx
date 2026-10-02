'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import {
	AddedToCartDrawer,
	type AddedItem,
} from '@/features/cart/components/added-to-cart-drawer';
import { useCart } from '@/features/cart/hooks/use-cart';
import {
	useCategories,
	useProducts,
} from '@/features/catalog/hooks/catalog.queries';
import type { ProductSummary } from '@/features/catalog/model/product';

import {
	categoryBlurb,
	emptyStateCopy,
	formatPieceCount,
	formatResultCount,
	isSearchable,
	NEWEST_SLUG,
} from '../lib/listing-copy';
import { parseSort } from '../lib/listing-sort';
import { buildListingHref } from '../lib/listing-url';
import { parsePage } from '../lib/pagination';
import type { ListingMode } from '../model/listing';
import { KeepTypingHint, ListingEmptyState } from './listing-empty-state';
import { ListingGrid, ListingGridSkeleton } from './listing-grid';
import {
	CategoryHeading,
	PromotionsHeading,
	SearchHeading,
} from './listing-headings';
import { ListingPagination } from './listing-pagination';
import { ListingToolbar, type CategoryChipLink } from './listing-toolbar';

const PAGE_SIZE = 8;

/** Reads the URL (`categoria`, `q`, `ordem`, `pagina`) and renders the listing. */
function ListingContent({ mode }: { mode: ListingMode }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const categories = useCategories();
	const { addItem } = useCart();
	const [addedItem, setAddedItem] = useState<AddedItem | null>(null);

	const sort = parseSort(searchParams.get('ordem'));
	const page = parsePage(searchParams.get('pagina'));
	const term = mode === 'search' ? (searchParams.get('q') ?? '') : '';
	const categoryParam =
		mode === 'category' ? searchParams.get('categoria') : null;
	const isNewest = categoryParam === NEWEST_SLUG;
	const category =
		categoryParam && !isNewest
			? (categories.data?.find((item) => item.slug === categoryParam) ?? null)
			: null;
	// A category slug can only be resolved once the categories have loaded;
	// don't fetch "Tudo" in the meantime.
	const waitingForCategory =
		categoryParam !== null && !isNewest && categories.isPending;
	const searchable = mode !== 'search' || isSearchable(term);

	const products = useProducts(
		{
			page,
			pageSize: PAGE_SIZE,
			categoryId: category?.id,
			// Novidades is every product; its newest-first order is the default
			// sort (pendency #2).
			sort: sort.apiSort,
			searchTerm: mode === 'search' ? term.trim() : undefined,
			onSale: mode === 'promotions' ? true : undefined,
		},
		{ enabled: !waitingForCategory && searchable },
	);

	const navigate = useCallback(
		(changes: Record<string, string | null>, replace = false) => {
			const href = buildListingHref(pathname, searchParams, changes);
			if (replace) {
				router.replace(href, { scroll: false });
			} else {
				router.push(href, { scroll: false });
			}
		},
		[pathname, router, searchParams],
	);

	const handleTermChange = useCallback(
		(value: string) => navigate({ q: value.trim() || null }, true),
		[navigate],
	);

	function handleAdd(product: ProductSummary) {
		addItem({
			productId: product.id,
			slug: product.slug,
			name: product.name,
			unitPrice: product.currentPrice,
		});
		setAddedItem({
			slug: product.slug,
			name: product.name,
			brand: product.brand,
			unitPrice: product.currentPrice,
		});
	}

	const loaded = products.data && !products.isPlaceholderData;
	const totalItems = products.data?.totalItems ?? 0;
	const pieceCount = loaded ? formatPieceCount(totalItems) : null;

	const title = isNewest ? 'Novidades' : (category?.name ?? 'Tudo');
	const chips: CategoryChipLink[] | null =
		mode === 'category'
			? [
					{
						key: 'tudo',
						label: 'Tudo',
						href: buildListingHref(pathname, searchParams, {
							categoria: null,
						}),
						active: !isNewest && category === null,
					},
					{
						key: NEWEST_SLUG,
						label: 'Novidades',
						href: buildListingHref(pathname, searchParams, {
							categoria: NEWEST_SLUG,
						}),
						active: isNewest,
					},
					...(categories.data ?? []).map((item) => ({
						key: item.id,
						label: item.name,
						href: buildListingHref(pathname, searchParams, {
							categoria: item.slug,
						}),
						active: category?.id === item.id,
					})),
				]
			: null;

	const empty = emptyStateCopy(mode, term);

	return (
		<>
			{mode === 'category' ? (
				<CategoryHeading
					title={title}
					countLabel={pieceCount}
					blurb={categoryBlurb(
						isNewest ? NEWEST_SLUG : (category?.slug ?? null),
					)}
				/>
			) : mode === 'search' ? (
				<SearchHeading
					term={term}
					onTermChange={handleTermChange}
					resultLabel={
						searchable && loaded
							? formatResultCount(totalItems, term.trim())
							: null
					}
				/>
			) : (
				<PromotionsHeading countLabel={pieceCount} />
			)}

			<ListingToolbar
				chips={chips}
				countLabel={pieceCount}
				sort={sort}
				onSortChange={(value) => navigate({ ordem: value })}
			/>

			<section className="grow pt-6 pb-16">
				<div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 sm:px-10">
					{!searchable ? (
						<KeepTypingHint />
					) : products.isError ? (
						<div className="flex flex-col items-start gap-3 rounded-2xl border bg-card p-6">
							<p className="text-ink-soft">
								Não foi possível carregar as peças agora.
							</p>
							<button
								type="button"
								onClick={() => products.refetch()}
								className="h-10 rounded-xl border bg-card px-4 text-sm font-medium hover:bg-surface-2"
							>
								Tentar novamente
							</button>
						</div>
					) : !products.data ? (
						<ListingGridSkeleton />
					) : products.data.items.length === 0 ? (
						<ListingEmptyState
							title={empty.title}
							text={empty.text}
							categories={categories.data ?? []}
						/>
					) : (
						<>
							<ListingGrid
								products={products.data.items}
								gridKey={`${mode}-${categoryParam}-${term}-${sort.value}-${page}`}
								dimmed={products.isPlaceholderData}
								onAdd={handleAdd}
							/>
							{products.data.totalPages > 1 ? (
								<ListingPagination
									page={page}
									pageSize={PAGE_SIZE}
									totalPages={products.data.totalPages}
									totalItems={totalItems}
									hrefForPage={(target) =>
										buildListingHref(pathname, searchParams, {
											pagina: String(target),
										})
									}
								/>
							) : null}
						</>
					)}
				</div>
			</section>

			<AddedToCartDrawer item={addedItem} onClose={() => setAddedItem(null)} />
		</>
	);
}

export { ListingContent };
