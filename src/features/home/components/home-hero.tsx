'use client';

import {
	ArrowCounterClockwiseIcon,
	ArrowRightIcon,
	CreditCardIcon,
	PlusIcon,
	TruckIcon,
} from '@phosphor-icons/react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { Eyebrow } from '@/components/eyebrow';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ProductArt } from '@/features/catalog/components/product-art';
import { useProductBySlug } from '@/features/catalog/hooks/catalog.queries';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import type { ProductAvailability } from '@/features/catalog/model/product';
import { cn } from '@/lib/utils';

/** Fixed editorial pick (backend pendency #3). */
const HERO_PRODUCT_SLUG = 'luminaria-arco';

function HomeHero() {
	const product = useProductBySlug(HERO_PRODUCT_SLUG);
	const { addItem } = useCart();
	const visual = getProductVisual(HERO_PRODUCT_SLUG);
	const soldOut = product.data?.availability === 'OutOfStock';

	return (
		<section id="inicio" className="pt-10 pb-8">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-x-10 gap-y-10 px-5 min-[980px]:grid-cols-2 sm:px-10">
				<div className="flex flex-col gap-[22px] min-[980px]:pr-4">
					<Eyebrow className="animate-up">COLEÇÃO OUTONO · 2026</Eyebrow>
					<h1 className="animate-up text-[40px] leading-[1.04] font-light tracking-[-0.03em] [animation-delay:.08s] sm:text-[56px]">
						Objetos simples para uma casa{' '}
						<span className="font-medium text-primary">mais calma</span>.
					</h1>
					<p className="max-w-[460px] animate-up text-[17px] leading-[1.55] text-muted-foreground [animation-delay:.16s]">
						Peças feitas à mão por pequenos estúdios, com materiais naturais e
						acabamento que dura. Escolha, receba e viva com menos ruído.
					</p>
					<div className="flex animate-up flex-wrap items-center gap-2.5 [animation-delay:.24s]">
						<a
							href="#produtos"
							className="flex h-12 items-center gap-2 rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
						>
							Explorar coleção
							<ArrowRightIcon size={16} />
						</a>
						<a
							href="#produtos"
							className="flex h-12 items-center rounded-xl border bg-card px-5 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-surface-2"
						>
							Ver lookbook
						</a>
					</div>
					<div className="flex animate-up flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-[13px] text-ink-soft [animation-delay:.32s]">
						<div className="flex items-center gap-2">
							<TruckIcon size={16} className="text-primary" />
							Frete grátis acima de R$ 299 <ComingSoonBadge />
						</div>
						<div className="flex items-center gap-2">
							<ArrowCounterClockwiseIcon size={16} className="text-primary" />
							Troca em 30 dias
						</div>
						<div className="flex items-center gap-2">
							<CreditCardIcon size={16} className="text-primary" />
							6× sem juros <ComingSoonBadge />
						</div>
					</div>
				</div>

				<div className="h-[460px] animate-up rounded-[20px] border bg-card p-3 [animation-delay:.16s]">
					<div
						className="relative h-full overflow-hidden rounded-[14px]"
						style={{ background: visual.tint }}
					>
						<svg
							className="absolute top-[45%] left-1/2 -mt-[210px] -ml-[210px] animate-spin-slow"
							width="420"
							height="420"
							viewBox="0 0 520 520"
							fill="none"
							aria-hidden="true"
						>
							<circle
								cx="260"
								cy="260"
								r="240"
								stroke="#3B3FD9"
								strokeOpacity=".25"
								strokeDasharray="3 9"
							/>
							<circle
								cx="260"
								cy="260"
								r="170"
								stroke="#3B3FD9"
								strokeOpacity=".18"
							/>
							<circle cx="260" cy="20" r="7" fill="#E8793A" />
						</svg>
						<div className="absolute inset-x-0 top-0 bottom-20 flex animate-floaty items-center justify-center">
							<ProductArt
								kind={visual.kind}
								size={220}
								strokeWidth={1.6}
								detailed
								className="line-draw"
							/>
						</div>
						{visual.tag ? (
							<div className="absolute top-4 left-4 flex h-7 items-center rounded-full bg-white px-3 text-[13px] font-medium text-clay">
								{visual.tag}
							</div>
						) : null}
						{product.data ? (
							<AvailabilityPill availability={product.data.availability} />
						) : null}
						<div className="absolute inset-x-3.5 bottom-3.5 flex items-center gap-3.5 rounded-[14px] border bg-card py-3 pr-3 pl-4">
							<div className="min-w-0 grow">
								<div className="text-base font-medium">
									{product.data?.name ??
										(product.isError ? 'Indisponível' : '—')}
								</div>
								<div className="truncate text-[13px] text-muted-foreground">
									{product.data?.shortDescription ??
										(product.isError
											? 'Não foi possível carregar a peça.'
											: ' ')}
								</div>
							</div>
							{product.data ? (
								<div className="font-mono text-[15px] font-medium">
									{formatCurrencyBrl(product.data.currentPrice)}
								</div>
							) : null}
							<button
								type="button"
								disabled={!product.data || soldOut}
								onClick={() => {
									if (product.data) {
										addItem({
											productId: product.data.id,
											slug: product.data.slug,
											name: product.data.name,
											unitPrice: product.data.currentPrice,
										});
									}
								}}
								className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong disabled:pointer-events-none disabled:bg-surface-2 disabled:text-muted-foreground"
							>
								<PlusIcon size={14} weight="bold" />
								Adicionar
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

const availabilityStyles: Record<
	ProductAvailability,
	{ label: string; className: string; dot: string }
> = {
	InStock: {
		label: 'Em estoque',
		className: 'bg-success-soft text-success',
		dot: 'bg-success animate-pulse-dot',
	},
	LowStock: {
		label: 'Últimas unidades',
		className: 'bg-clay-soft text-clay',
		dot: 'bg-clay',
	},
	OutOfStock: {
		label: 'Esgotado',
		className: 'bg-surface text-muted-foreground',
		dot: 'bg-muted-foreground',
	},
};

function AvailabilityPill({
	availability,
}: {
	availability: ProductAvailability;
}) {
	const style = availabilityStyles[availability];

	return (
		<div
			className={cn(
				'absolute top-4 right-4 flex h-7 items-center gap-2 rounded-full px-3 text-[13px]',
				style.className,
			)}
		>
			<span className={cn('size-[7px] rounded-full', style.dot)} />
			{style.label}
		</div>
	);
}

export { HomeHero };
