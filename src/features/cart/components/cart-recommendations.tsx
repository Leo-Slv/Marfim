import { PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { Eyebrow } from '@/components/eyebrow';
import { ProductArt } from '@/features/catalog/components/product-art';
import { ListingProductCard } from '@/features/catalog/components/listing-product-card';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import type { ProductSummary } from '@/features/catalog/model/product';
import { appRoutes } from '@/lib/routes/app-routes';

/** "Combina com a sua sacola" — chosen client-side (cart pendency #5). */
function CartRecommendations({
	products,
	onAdd,
}: {
	products: ProductSummary[];
	onAdd: (product: ProductSummary) => void;
}) {
	if (products.length === 0) {
		return null;
	}

	return (
		<>
			{/* Below 980 px: "Da mesma categoria", a scrolling row (MobileSacola). */}
			<section className="flex flex-col gap-2.5 px-4 pb-6 min-[980px]:hidden">
				<h2 className="text-xl font-light">Da mesma categoria</h2>
				<ul className="-mx-4 flex [scrollbar-width:none] gap-2.5 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
					{products.map((product) => {
						const visual = getProductVisual(product.slug);
						return (
							<li
								key={product.id}
								className="flex w-[150px] shrink-0 flex-col gap-1.5 rounded-[14px] border bg-card p-1.5"
							>
								<Link
									href={appRoutes.products.detail(product.slug)}
									aria-label={product.name}
									className="flex h-[110px] items-center justify-center rounded-[10px]"
									style={{ background: visual.tint }}
								>
									<ProductArt kind={visual.kind} size={58} />
								</Link>
								<span className="px-1 text-[13px] font-medium">
									{product.name}
								</span>
								<span className="flex items-center justify-between px-1 pb-1">
									<span className="font-mono text-xs">
										{formatCurrencyBrl(product.currentPrice)}
									</span>
									<button
										type="button"
										onClick={() => onAdd(product)}
										aria-label={`Adicionar ${product.name}`}
										className="flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"
									>
										<PlusIcon size={16} weight="bold" />
									</button>
								</span>
							</li>
						);
					})}
				</ul>
			</section>
			<section className="hidden pt-4 pb-[72px] min-[980px]:block">
				<div className="mx-auto flex max-w-[1280px] flex-col gap-[22px] px-5 sm:px-10">
					<div className="flex flex-col gap-2">
						<Eyebrow>DAS MESMAS CATEGORIAS</Eyebrow>
						<h2 className="text-[34px] font-light tracking-[-0.025em]">
							Combina com a sua sacola
						</h2>
					</div>
					<ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 min-[980px]:grid-cols-3 min-[1180px]:grid-cols-4">
						{products.map((product, index) => (
							<li key={product.id}>
								<ListingProductCard
									product={product}
									index={index}
									onAdd={() => onAdd(product)}
								/>
							</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}

export { CartRecommendations };
