import { CheckIcon, HeartIcon, PlusIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { formatDiscountPercent } from '../lib/discount-percent';
import { formatCurrencyBrl } from '../lib/format-currency-brl';
import { isOnSale } from '../lib/is-on-sale';
import { getProductVisual } from '../lib/product-visuals';
import type { ProductSummary } from '../model/product';
import { ProductArt } from './product-art';

type ProductCardProps = {
	product: ProductSummary;
	categoryName: string | null;
	isFavorite: boolean;
	onToggleFavorite: () => void;
	justAdded: boolean;
	onAdd: () => void;
	/** Position in the grid, for the staggered enter animation. */
	index: number;
};

function ProductCard({
	product,
	categoryName,
	isFavorite,
	onToggleFavorite,
	justAdded,
	onAdd,
	index,
}: ProductCardProps) {
	const visual = getProductVisual(product.slug);
	const soldOut = product.availability === 'OutOfStock';
	const tag = soldOut ? 'Esgotado' : visual.tag;
	const compareAtPrice = isOnSale(product) ? product.compareAtPrice : null;
	const href = appRoutes.products.detail(product.slug);

	return (
		<article
			className="group flex animate-up flex-col gap-3 rounded-2xl border bg-card p-2 transition-[transform,box-shadow] duration-350 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-[5px] hover:shadow-[0_16px_36px_-18px_rgba(24,24,27,.22)]"
			style={{ animationDelay: `${(index * 0.06).toFixed(2)}s` }}
		>
			<div
				className="relative h-[210px] overflow-hidden rounded-xl"
				style={{ background: visual.tint }}
			>
				<Link
					href={href}
					aria-label={product.name}
					className="absolute inset-0 flex items-center justify-center"
				>
					<div
						className={cn(
							'flex transition-transform duration-600 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06] group-hover:-rotate-2',
							soldOut && 'opacity-60',
						)}
					>
						<ProductArt kind={visual.kind} size={112} />
					</div>
					{tag ? (
						<span className="absolute top-2.5 left-2.5 flex h-6 items-center rounded-full bg-white px-2.5 text-xs font-medium text-clay">
							{tag}
						</span>
					) : null}
				</Link>
				<button
					type="button"
					onClick={onToggleFavorite}
					aria-label={`Favoritar ${product.name}`}
					aria-pressed={isFavorite}
					className="absolute top-1 right-1 flex size-11 items-center justify-center rounded-full text-foreground"
				>
					<span className="flex size-8 items-center justify-center rounded-full bg-white transition-colors hover:bg-surface-2">
						<HeartIcon
							key={String(isFavorite)}
							size={16}
							weight={isFavorite ? 'fill' : 'regular'}
							className={cn(isFavorite && 'animate-pop text-primary')}
						/>
					</span>
				</button>
			</div>
			<div className="flex items-end gap-2.5 px-1.5 pb-1.5">
				<div className="flex min-w-0 grow flex-col gap-[3px]">
					<div className="text-xs text-muted-foreground">
						{categoryName ?? ' '}
					</div>
					<Link
						href={href}
						className="text-base font-medium text-foreground transition-colors hover:text-primary"
					>
						{product.name}
					</Link>
					<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
						<span className="font-mono text-sm font-medium">
							{formatCurrencyBrl(product.currentPrice)}
						</span>
						{compareAtPrice !== null ? (
							<>
								<span className="font-mono text-xs text-muted-foreground line-through">
									{formatCurrencyBrl(compareAtPrice)}
								</span>
								<span className="flex h-5 items-center rounded-full bg-success-soft px-[7px] font-mono text-[11px] text-success">
									{formatDiscountPercent(product.currentPrice, compareAtPrice)}
								</span>
							</>
						) : null}
					</div>
				</div>
				{justAdded ? (
					<span
						role="status"
						aria-label="Adicionado"
						className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success text-white"
					>
						<CheckIcon size={16} weight="bold" className="animate-pop" />
					</span>
				) : (
					<button
						type="button"
						onClick={onAdd}
						disabled={soldOut}
						aria-label={`Adicionar ${product.name} à sacola`}
						className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong disabled:pointer-events-none disabled:bg-surface-2 disabled:text-muted-foreground"
					>
						<PlusIcon size={16} weight="bold" />
					</button>
				)}
			</div>
		</article>
	);
}

export { ProductCard };
