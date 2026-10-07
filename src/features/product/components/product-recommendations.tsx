'use client';

import { ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { Eyebrow } from '@/components/eyebrow';
import { ProductArt } from '@/features/catalog/components/product-art';
import { ListingProductCard } from '@/features/catalog/components/listing-product-card';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { useProducts } from '@/features/catalog/hooks/catalog.queries';
import type {
	ProductDetail,
	ProductSummary,
} from '@/features/catalog/model/product';
import { appRoutes } from '@/lib/routes/app-routes';

import { recommendations } from '../lib/product-content';

/** "Mais em {categoria} · Combina com {produto}". */
function ProductRecommendations({
	product,
	category,
	onAdd,
}: {
	product: ProductDetail;
	category: { name: string; slug: string } | null;
	onAdd: (product: ProductSummary) => void;
}) {
	const products = useProducts({
		page: 1,
		pageSize: 24,
		categoryId: product.categoryId,
	});
	const picks = products.data
		? recommendations(products.data.items, product)
		: [];

	if (products.isSuccess && picks.length === 0) {
		return null;
	}

	return (
		<section className="px-4 pt-2 pb-6 min-[980px]:px-10 min-[980px]:pb-[72px]">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-3 min-[980px]:gap-[22px]">
				<div className="flex flex-col gap-2">
					<Eyebrow className="hidden min-[980px]:block">
						MAIS EM {category ? category.name.toUpperCase() : 'NA LOJA'}
					</Eyebrow>
					<h2 className="text-xl font-light min-[980px]:text-[34px] min-[980px]:tracking-[-0.025em]">
						Combina com {product.name}
					</h2>
				</div>
				{/* Below 980 px: small cards in a scrolling row (MobileProduto). */}
				<ul className="-mx-4 flex [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 min-[980px]:hidden [&::-webkit-scrollbar]:hidden">
					{picks.map((pick) => {
						const visual = getProductVisual(pick.slug);
						return (
							<li key={pick.id} className="w-[150px] shrink-0">
								<Link
									href={appRoutes.products.detail(pick.slug)}
									className="flex flex-col gap-1.5 rounded-[14px] border bg-card p-1.5 text-foreground"
								>
									<span
										className="flex h-[120px] items-center justify-center rounded-[10px]"
										style={{ background: visual.tint }}
									>
										<ProductArt kind={visual.kind} size={64} />
									</span>
									<span className="px-1 pt-0.5 text-[13px] font-medium">
										{pick.name}
									</span>
									<span className="px-1 pb-1 font-mono text-xs">
										{formatCurrencyBrl(pick.currentPrice)}
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
				<div className="hidden grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[980px]:grid min-[980px]:grid-cols-4">
					{products.isPending
						? [0, 1, 2].map((index) => (
								<div key={index} className="skeleton h-[300px] rounded-2xl" />
							))
						: picks.map((pick, index) => (
								<ListingProductCard
									key={pick.id}
									product={pick}
									index={index}
									onAdd={() => onAdd(pick)}
								/>
							))}
					{category ? (
						<Link
							href={appRoutes.products.category(category.slug)}
							className="flex min-h-[200px] flex-col justify-end gap-1.5 rounded-2xl border border-dashed p-6 text-foreground transition-colors hover:bg-surface-2"
						>
							<span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">
								CATEGORIA
							</span>
							<span className="flex items-center gap-2 text-[22px] font-light tracking-[-0.02em]">
								Ver toda a {category.name}
								<ArrowRightIcon size={18} className="text-primary" />
							</span>
						</Link>
					) : null}
				</div>
			</div>
		</section>
	);
}

export { ProductRecommendations };
