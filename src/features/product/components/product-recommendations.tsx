'use client';

import { ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { Eyebrow } from '@/components/eyebrow';
import { ListingProductCard } from '@/features/catalog/components/listing-product-card';
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
		<section className="px-5 pt-2 pb-[72px] min-[980px]:px-10">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-[22px]">
				<div className="flex flex-col gap-2">
					<Eyebrow>
						MAIS EM {category ? category.name.toUpperCase() : 'NA LOJA'}
					</Eyebrow>
					<h2 className="text-[34px] font-light tracking-[-0.025em]">
						Combina com {product.name}
					</h2>
				</div>
				<div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[980px]:grid-cols-4">
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
