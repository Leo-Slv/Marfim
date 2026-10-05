'use client';

import { HandbagIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import type { ProductDetail } from '@/features/catalog/model/product';
import { useCart } from '@/features/cart/hooks/use-cart';
import { cn } from '@/lib/utils';

import { clampQuantity, remainingInBag } from '../lib/product-content';

/** Quantity + "Adicionar à sacola" (or the sold-out state). */
function ProductBuyBox({
	product,
	categoryName,
	onAdded,
}: {
	product: ProductDetail;
	categoryName: string | null;
	onAdded: (quantity: number) => void;
}) {
	const { lines, addItem } = useCart();
	const [quantity, setQuantity] = useState(1);
	const [capped, setCapped] = useState(false);
	const inBag =
		lines.find((line) => line.productId === product.id)?.quantity ?? 0;
	const room = remainingInBag(inBag);
	const amount = clampQuantity(quantity, room);
	const soldOut = product.availability === 'OutOfStock';

	if (soldOut) {
		return (
			<div className="flex flex-col gap-2.5">
				<button
					type="button"
					disabled
					className="h-[52px] rounded-xl border bg-surface text-base font-medium text-muted-foreground"
				>
					Esgotado
				</button>
				<p className="text-[13px] leading-normal text-muted-foreground">
					{product.brand ?? 'O ateliê'} produz em lotes pequenos. Veja abaixo
					outras peças
					{categoryName ? ` de ${categoryName}` : ''} disponíveis agora.
				</p>
			</div>
		);
	}

	function change(delta: number) {
		const next = amount + delta;
		setCapped(next > room);
		setQuantity(clampQuantity(next, room));
	}

	function add() {
		addItem(
			{
				productId: product.id,
				slug: product.slug,
				name: product.name,
				unitPrice: product.currentPrice,
			},
			amount,
		);
		onAdded(amount);
		setQuantity(1);
		setCapped(false);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2.5">
				<div className="flex h-[52px] items-center overflow-hidden rounded-xl border bg-card">
					<button
						type="button"
						onClick={() => change(-1)}
						disabled={room === 0 || amount <= 1}
						aria-label="Diminuir quantidade"
						className="flex h-full w-12 items-center justify-center hover:bg-surface disabled:opacity-40"
					>
						<MinusIcon size={14} weight="bold" />
					</button>
					<span
						aria-live="polite"
						className="w-8 text-center font-mono text-[15px]"
					>
						{room === 0 ? 0 : amount}
					</span>
					<button
						type="button"
						onClick={() => change(1)}
						disabled={room === 0}
						aria-label="Aumentar quantidade"
						className="flex h-full w-12 items-center justify-center hover:bg-surface disabled:opacity-40"
					>
						<PlusIcon size={14} weight="bold" />
					</button>
				</div>
				<button
					type="button"
					onClick={add}
					disabled={room === 0}
					className="flex h-[52px] grow items-center justify-center gap-2.5 rounded-xl bg-primary text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:opacity-55"
				>
					<HandbagIcon size={18} />
					Adicionar à sacola
				</button>
			</div>
			{room === 0 ? (
				<span className="text-[13px] text-clay">
					Você já tem 9 desta peça na sacola, o máximo por peça.
				</span>
			) : capped ? (
				<span className="animate-up text-[13px] text-clay">
					{inBag > 0
						? `Você já tem ${inBag} na sacola; cabem mais ${room} desta peça.`
						: `O máximo é ${room} por peça.`}
				</span>
			) : inBag > 0 ? (
				<span className="text-[13px] text-muted-foreground">
					{inBag === 1 ? '1 já está' : `${inBag} já estão`} na sua sacola.
				</span>
			) : null}
		</div>
	);
}

/** Variant chips; the bag and the order don't carry variants yet. */
function ProductVariants({ product }: { product: ProductDetail }) {
	const [selected, setSelected] = useState(product.variants[0]?.id ?? null);
	if (product.variants.length === 0) {
		return null;
	}
	const current = product.variants.find((variant) => variant.id === selected);

	return (
		<div className="flex flex-col gap-2.5">
			<div className="text-[13px] text-ink-soft">
				Variante: <b className="font-medium text-foreground">{current?.name}</b>
			</div>
			<div
				role="radiogroup"
				aria-label="Variante"
				className="flex flex-wrap gap-2"
			>
				{product.variants.map((variant) => (
					<button
						key={variant.id}
						type="button"
						role="radio"
						aria-checked={variant.id === selected}
						onClick={() => setSelected(variant.id)}
						className={cn(
							'flex h-11 items-center gap-2.5 rounded-xl border px-3.5 text-sm transition-colors',
							variant.id === selected
								? 'border-primary bg-primary-soft'
								: 'bg-card hover:bg-surface',
						)}
					>
						{variant.name}
					</button>
				))}
			</div>
			<span className="flex items-center gap-2 text-xs text-muted-foreground">
				<ComingSoonBadge />A variante escolhida ainda não segue para o pedido.
			</span>
		</div>
	);
}

export { ProductBuyBox, ProductVariants };
