'use client';

import {
	ArrowCounterClockwiseIcon,
	ArrowRightIcon,
	CreditCardIcon,
	PlusIcon,
	TruckIcon,
} from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { Eyebrow } from '@/components/eyebrow';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ProductArt } from '@/features/catalog/components/product-art';
import { useProductBySlug } from '@/features/catalog/hooks/catalog.queries';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import type { ProductAvailability } from '@/features/catalog/model/product';
import { cn } from '@/lib/utils';

import { toastAddedToBag } from '../lib/added-toast';

/** Fixed editorial pick (backend pendency #3). */
const HERO_PRODUCT_SLUG = 'luminaria-arco';

function HomeHero() {
	const product = useProductBySlug(HERO_PRODUCT_SLUG);
	const router = useRouter();
	const { addItem } = useCart();
	const visual = getProductVisual(HERO_PRODUCT_SLUG);
	const soldOut = product.data?.availability === 'OutOfStock';

	return (
		<section
			id="inicio"
			className="pt-6 pb-2 min-[980px]:pt-10 min-[980px]:pb-8"
		>
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-x-10 gap-y-4 px-4 min-[980px]:grid-cols-2 min-[980px]:gap-y-10 sm:px-10">
				{/* Below 980 px the text block dissolves into the grid so the card can
				    sit between the paragraph and the buttons (MobileInicio). */}
				<div className="contents min-[980px]:flex min-[980px]:flex-col min-[980px]:gap-[22px] min-[980px]:pr-4">
					<Eyebrow className="animate-up max-[979px]:order-1 max-[979px]:text-[10px]">
						COLEÇÃO OUTONO · 2026
					</Eyebrow>
					<h1 className="animate-up text-[38px] leading-[1.05] font-light tracking-[-0.03em] [animation-delay:.08s] max-[979px]:order-2 sm:text-[56px]">
						Objetos simples para uma casa{' '}
						<span className="font-medium text-primary">mais calma</span>.
					</h1>
					<p className="max-w-[460px] animate-up text-[15px] leading-[1.55] text-muted-foreground [animation-delay:.16s] max-[979px]:order-3 min-[980px]:text-[17px]">
						Peças feitas à mão por pequenos estúdios, com materiais naturais e
						acabamento que dura. Escolha, receba e viva com menos ruído.
					</p>
					<div className="flex animate-up flex-wrap items-center gap-2.5 [animation-delay:.24s] max-[979px]:order-5 max-[979px]:flex-col max-[979px]:items-stretch">
						<a
							href="#produtos"
							className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-foreground px-[22px] text-base font-medium text-background transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong min-[980px]:h-12 min-[980px]:bg-primary min-[980px]:text-[15px] min-[980px]:text-primary-foreground"
						>
							Explorar coleção
							<ArrowRightIcon size={16} />
						</a>
						<a
							href="#produtos"
							className="hidden h-12 items-center rounded-xl border bg-card px-5 text-[15px] font-medium text-foreground transition-colors duration-200 hover:bg-surface-2 min-[980px]:flex"
						>
							Ver lookbook
						</a>
					</div>
					<div className="hidden animate-up flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-[13px] text-ink-soft [animation-delay:.32s] min-[980px]:flex">
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

				<div className="h-[320px] animate-up rounded-[20px] border bg-card p-3 [animation-delay:.16s] max-[979px]:order-4 min-[980px]:h-[460px]">
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
								className="line-draw h-auto w-[150px] min-[980px]:w-[220px]"
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
						<div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2.5 rounded-[14px] border bg-card py-2.5 pr-2.5 pl-3.5 min-[980px]:inset-x-3.5 min-[980px]:bottom-3.5 min-[980px]:gap-3.5 min-[980px]:py-3 min-[980px]:pr-3 min-[980px]:pl-4">
							<div className="min-w-0 grow">
								<div className="text-[15px] font-medium whitespace-nowrap min-[980px]:text-base">
									{product.data?.name ??
										(product.isError ? 'Indisponível' : '—')}
								</div>
								<div className="hidden truncate text-[13px] text-muted-foreground min-[980px]:block">
									{product.data?.shortDescription ??
										(product.isError
											? 'Não foi possível carregar a peça.'
											: ' ')}
								</div>
							</div>
							{product.data ? (
								<div className="font-mono text-[13px] font-medium whitespace-nowrap min-[980px]:text-[15px]">
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
										toastAddedToBag(product.data.name, router.push);
									}
								}}
								className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong disabled:pointer-events-none disabled:bg-surface-2 disabled:text-muted-foreground"
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
