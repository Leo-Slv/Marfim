'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ProductCard } from '@/features/catalog/components/product-card';
import {
	useCategories,
	useProducts,
} from '@/features/catalog/hooks/catalog.queries';
import type { Category } from '@/features/catalog/model/category';
import type { ProductSummary } from '@/features/catalog/model/product';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { toastAddedToBag } from '../lib/added-toast';
import { FreeShippingMeter } from './free-shipping-meter';

const GRID_SIZE = 8;
/** Below 980 px the home shows four pieces (MobileInicio). */
const MOBILE_GRID_SIZE = 4;
const JUST_ADDED_MS = 1400;

/** "Escolhidos da semana": category chips + live products grid. */
function FeaturedProductsSection() {
	return (
		<section id="produtos" className="scroll-mt-6 pt-7 pb-4 min-[980px]:pt-8">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-3.5 px-4 min-[980px]:gap-[22px] sm:px-10">
				<div className="flex flex-wrap items-end gap-6">
					<div className="flex grow flex-col gap-2">
						<Eyebrow className="hidden min-[980px]:block">
							ESCOLHIDOS DA SEMANA
						</Eyebrow>
						<div className="flex items-baseline justify-between">
							<h2 className="text-[26px] font-light tracking-[-0.02em] min-[980px]:text-[34px] min-[980px]:tracking-[-0.025em]">
								Feito para ficar
							</h2>
							<Link
								href={appRoutes.products.list}
								className="text-sm font-medium text-primary min-[980px]:hidden"
							>
								Ver tudo
							</Link>
						</div>
					</div>
					<div className="hidden min-[980px]:block">
						<FreeShippingMeter />
					</div>
				</div>
				{/* `?categoria=` drives the filter; Next 16 needs a Suspense boundary
				    around useSearchParams for the page to prerender. */}
				<Suspense fallback={<ProductsGridSkeleton />}>
					<FilteredProducts />
				</Suspense>
			</div>
		</section>
	);
}

function FilteredProducts() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const categories = useCategories();

	const requestedSlug = searchParams.get('categoria');
	const activeCategory =
		categories.data?.find((category) => category.slug === requestedSlug) ??
		null;

	const products = useProducts({
		page: 1,
		pageSize: GRID_SIZE,
		categoryId: activeCategory?.id,
	});

	function selectCategory(category: Category | null) {
		const params = new URLSearchParams(searchParams);
		if (category) {
			params.set('categoria', category.slug);
		} else {
			params.delete('categoria');
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	return (
		<>
			<div
				className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 min-[980px]:mx-0 min-[980px]:flex-wrap min-[980px]:overflow-visible min-[980px]:px-0 [&::-webkit-scrollbar]:hidden"
				role="group"
				aria-label="Filtrar por categoria"
			>
				<CategoryChip
					label="Tudo"
					active={activeCategory === null}
					onClick={() => selectCategory(null)}
				/>
				{categories.data?.map((category) => (
					<CategoryChip
						key={category.id}
						label={category.name}
						active={activeCategory?.id === category.id}
						onClick={() => selectCategory(category)}
					/>
				))}
			</div>
			{products.isPending ? (
				<ProductsGridSkeleton withChips={false} />
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
			) : products.data.items.length === 0 ? (
				<p className="rounded-2xl border bg-card p-6 text-ink-soft">
					Nenhuma peça nesta categoria por enquanto.
				</p>
			) : (
				<ProductsGrid
					products={products.data.items}
					categories={categories.data ?? []}
					dimmed={products.isPlaceholderData}
				/>
			)}
		</>
	);
}

function ProductsGrid({
	products,
	categories,
	dimmed,
}: {
	products: ProductSummary[];
	categories: Category[];
	dimmed: boolean;
}) {
	const router = useRouter();
	const { addItem } = useCart();
	// Favorites are per-visit only: OrderCore has no wishlist (pendency #4).
	const [favorites, setFavorites] = useState<Record<string, boolean>>({});
	const [justAddedId, setJustAddedId] = useState<string | null>(null);
	const justAddedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(justAddedTimer.current), []);

	const categoryNames = new Map(
		categories.map((category) => [category.id, category.name]),
	);

	function add(product: ProductSummary) {
		addItem({
			productId: product.id,
			slug: product.slug,
			name: product.name,
			unitPrice: product.currentPrice,
		});
		toastAddedToBag(product.name, router.push);
		clearTimeout(justAddedTimer.current);
		setJustAddedId(product.id);
		justAddedTimer.current = setTimeout(
			() => setJustAddedId(null),
			JUST_ADDED_MS,
		);
	}

	return (
		<ul
			// A new product set remounts the cards so their enter animation replays.
			key={products.map((product) => product.id).join()}
			className={cn(
				'grid grid-cols-2 gap-2.5 transition-opacity min-[980px]:grid-cols-3 min-[980px]:gap-4 min-[1180px]:grid-cols-4',
				dimmed && 'opacity-60',
			)}
		>
			{products.map((product, index) => (
				<li
					key={product.id}
					className={cn(index >= MOBILE_GRID_SIZE && 'max-[979px]:hidden')}
				>
					<ProductCard
						product={product}
						categoryName={categoryNames.get(product.categoryId) ?? null}
						index={index}
						isFavorite={!!favorites[product.id]}
						onToggleFavorite={() =>
							setFavorites((current) => ({
								...current,
								[product.id]: !current[product.id],
							}))
						}
						justAdded={justAddedId === product.id}
						onAdd={() => add(product)}
					/>
				</li>
			))}
		</ul>
	);
}

function CategoryChip({
	label,
	active,
	onClick,
}: {
	label: string;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				'h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors duration-200 min-[980px]:px-[18px]',
				active
					? 'bg-primary text-primary-foreground'
					: 'bg-surface text-ink-soft hover:bg-surface-2',
			)}
		>
			{label}
		</button>
	);
}

function ProductsGridSkeleton({ withChips = true }: { withChips?: boolean }) {
	return (
		<>
			{withChips ? (
				<div className="flex gap-2">
					{Array.from({ length: 5 }, (_, index) => (
						<div
							key={index}
							className="h-10 w-24 animate-pulse rounded-full bg-surface"
						/>
					))}
				</div>
			) : null}
			<div
				aria-busy="true"
				aria-label="Carregando peças"
				className="grid grid-cols-2 gap-2.5 min-[980px]:grid-cols-3 min-[980px]:gap-4 min-[1180px]:grid-cols-4"
			>
				{Array.from({ length: GRID_SIZE }, (_, index) => (
					<div
						key={index}
						className="h-[230px] animate-pulse rounded-2xl border bg-card min-[980px]:h-[300px]"
					/>
				))}
			</div>
		</>
	);
}

export { FeaturedProductsSection };
