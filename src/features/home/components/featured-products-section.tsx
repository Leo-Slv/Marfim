'use client';

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
import { cn } from '@/lib/utils';

import { FreeShippingMeter } from './free-shipping-meter';

const GRID_SIZE = 8;
const JUST_ADDED_MS = 1400;

/** "Escolhidos da semana": category chips + live products grid. */
function FeaturedProductsSection() {
	return (
		<section id="produtos" className="scroll-mt-6 pt-8 pb-4">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-[22px] px-5 sm:px-10">
				<div className="flex flex-wrap items-end gap-6">
					<div className="flex grow flex-col gap-2">
						<Eyebrow>ESCOLHIDOS DA SEMANA</Eyebrow>
						<h2 className="text-[34px] font-light tracking-[-0.025em]">
							Feito para ficar
						</h2>
					</div>
					<FreeShippingMeter />
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
				className="flex flex-wrap gap-2"
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
				'grid grid-cols-1 gap-4 transition-opacity min-[420px]:grid-cols-2 min-[980px]:grid-cols-3 min-[1180px]:grid-cols-4',
				dimmed && 'opacity-60',
			)}
		>
			{products.map((product, index) => (
				<li key={product.id}>
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
				'h-10 rounded-full px-[18px] text-sm font-medium transition-colors duration-200',
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
				className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 min-[980px]:grid-cols-3 min-[1180px]:grid-cols-4"
			>
				{Array.from({ length: GRID_SIZE }, (_, index) => (
					<div
						key={index}
						className="h-[300px] animate-pulse rounded-2xl border bg-card"
					/>
				))}
			</div>
		</>
	);
}

export { FeaturedProductsSection };
