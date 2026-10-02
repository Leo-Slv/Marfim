import { PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { formatDiscountPercent } from '../lib/discount-percent';
import { formatCurrencyBrl } from '../lib/format-currency-brl';
import { isOnSale } from '../lib/is-on-sale';
import { getProductBadge, type ProductBadgeTone } from '../lib/product-badge';
import { getProductVisual, productTints } from '../lib/product-visuals';
import type { ProductSummary } from '../model/product';
import { ProductArt } from './product-art';

const badgeToneClass: Record<ProductBadgeTone, string> = {
	muted: 'text-ink-soft',
	warning: 'text-clay',
	new: 'text-primary',
	editorial: 'text-clay',
};

type ListingProductCardProps = {
	product: ProductSummary;
	onAdd: () => void;
	/** Position in the grid, for the staggered enter animation. */
	index: number;
};

/** Product card of the listing screen (Listagem.dc.html). */
function ListingProductCard({
	product,
	onAdd,
	index,
}: ListingProductCardProps) {
	const visual = getProductVisual(product.slug);
	const soldOut = product.availability === 'OutOfStock';
	const badge = getProductBadge(product.availability, visual.tag);
	const compareAtPrice = isOnSale(product) ? product.compareAtPrice : null;
	const href = appRoutes.products.detail(product.slug);

	return (
		<article
			className="group flex animate-up flex-col gap-3 rounded-2xl border bg-card p-2 transition-[transform,box-shadow] duration-350 ease-[cubic-bezier(.2,.7,.2,1)] [animation-duration:.7s] hover:-translate-y-[5px] hover:shadow-[0_16px_36px_-18px_rgba(24,24,27,.22)]"
			style={{ animationDelay: `${(index * 0.05).toFixed(2)}s` }}
		>
			<Link
				href={href}
				aria-label={product.name}
				className="relative flex h-[210px] items-center justify-center overflow-hidden rounded-xl"
				style={{ background: soldOut ? productTints.sand : visual.tint }}
			>
				<div
					className={cn(
						'flex transition-transform duration-600 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06] group-hover:-rotate-2',
						soldOut && 'opacity-40',
					)}
				>
					<ProductArt kind={visual.kind} size={112} />
				</div>
				{badge ? (
					<span
						className={cn(
							'absolute top-2.5 left-2.5 flex h-6 items-center rounded-full bg-white px-2.5 text-xs font-medium',
							badgeToneClass[badge.tone],
						)}
					>
						{badge.label}
					</span>
				) : null}
				{compareAtPrice !== null ? (
					<span className="absolute top-2.5 right-2.5 flex h-6 items-center rounded-full bg-success-soft px-2 font-mono text-[11px] text-success">
						{formatDiscountPercent(product.currentPrice, compareAtPrice)}
					</span>
				) : null}
			</Link>
			<div className="flex items-end gap-2.5 px-1.5 pb-1.5">
				<div className="flex min-w-0 grow flex-col gap-[3px]">
					<div className="text-xs text-muted-foreground">
						{product.brand ?? ' '}
					</div>
					<Link
						href={href}
						className="text-base font-medium text-foreground transition-colors hover:text-primary"
					>
						{product.name}
					</Link>
					<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
						<span
							className={cn(
								'font-mono text-sm font-medium',
								soldOut && 'text-muted-foreground',
							)}
						>
							{formatCurrencyBrl(product.currentPrice)}
						</span>
						{compareAtPrice !== null ? (
							<span className="font-mono text-xs text-muted-foreground line-through">
								{formatCurrencyBrl(compareAtPrice)}
							</span>
						) : null}
					</div>
				</div>
				{soldOut ? (
					<button
						type="button"
						disabled
						aria-label={`${product.name} esgotado`}
						className="h-11 shrink-0 cursor-not-allowed rounded-xl border bg-surface px-3 text-[13px] text-muted-foreground"
					>
						Esgotado
					</button>
				) : (
					<button
						type="button"
						onClick={onAdd}
						aria-label={`Adicionar ${product.name} à sacola`}
						className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
					>
						<PlusIcon size={16} weight="bold" />
					</button>
				)}
			</div>
		</article>
	);
}

export { ListingProductCard };
