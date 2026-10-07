'use client';

import { ArrowRightIcon, CheckIcon, XIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { ProductArt } from '@/features/catalog/components/product-art';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { appRoutes } from '@/lib/routes/app-routes';

import { useCart } from '../hooks/use-cart';
import { formatItemCount } from '../lib/cart-lines';

type AddedItem = {
	slug: string;
	name: string;
	brand: string | null;
	unitPrice: number;
	/** Units just added (1 from a card; the product page can add more). */
	quantity?: number;
};

type AddedToCartDrawerProps = {
	/** The piece just added; null keeps the panel closed. */
	item: AddedItem | null;
	onClose: () => void;
};

/** "06 · Mini-sacola" panel from Listagem.dc.html. */
function AddedToCartDrawer({ item, onClose }: AddedToCartDrawerProps) {
	const { count, subtotal } = useCart();

	return (
		<DialogPrimitive.Root
			open={item !== null}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 animate-fade-in bg-foreground/30" />
				{/* Below 980 px a bottom sheet (MobileListagem / MobileProduto). */}
				<DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-41 flex animate-sheet-up flex-col rounded-t-[20px] bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_30px_60px_-20px_rgba(24,24,27,.35)] outline-none min-[980px]:inset-x-auto min-[980px]:top-4 min-[980px]:right-4 min-[980px]:bottom-auto min-[980px]:w-[380px] min-[980px]:max-w-[calc(100%-32px)] min-[980px]:animate-slide-in min-[980px]:rounded-[20px] min-[980px]:pb-0">
					<span
						aria-hidden="true"
						className="mt-2.5 h-1 w-10 self-center rounded-full bg-border min-[980px]:hidden"
					/>
					{item ? (
						<>
							<div className="flex items-center gap-2.5 border-b px-5 py-[18px]">
								<span className="flex size-7 animate-pop items-center justify-center rounded-full bg-success-soft text-success">
									<CheckIcon size={14} weight="bold" />
								</span>
								<DialogPrimitive.Title className="grow text-base font-medium">
									Adicionado à sacola
								</DialogPrimitive.Title>
								<DialogPrimitive.Close
									aria-label="Fechar"
									className="flex size-10 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-surface-2"
								>
									<XIcon size={16} />
								</DialogPrimitive.Close>
							</div>
							<DialogPrimitive.Description asChild>
								<div className="flex items-center gap-3.5 px-5 py-[18px]">
									<AddedItemArt slug={item.slug} />
									<div className="flex grow flex-col gap-0.5">
										<span className="text-xs text-muted-foreground">
											{item.brand}
										</span>
										<span className="text-[15px] font-medium">{item.name}</span>
										<span className="text-[13px] text-muted-foreground">
											Quantidade: {item.quantity ?? 1}
										</span>
									</div>
									<span className="font-mono text-sm font-medium">
										{formatCurrencyBrl(item.unitPrice * (item.quantity ?? 1))}
									</span>
								</div>
							</DialogPrimitive.Description>
							<div className="mx-5 flex justify-between border-t py-3.5 text-sm">
								<span className="text-ink-soft">
									Sacola · {formatItemCount(count)}
								</span>
								<span className="font-mono">{formatCurrencyBrl(subtotal)}</span>
							</div>
							<div className="flex flex-col gap-2 px-5 pt-1 pb-5">
								<Link
									href={appRoutes.cart.index}
									className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
								>
									Ir para a sacola
									<span className="min-[980px]:hidden">
										· {formatItemCount(count)}
									</span>
									<ArrowRightIcon
										size={16}
										className="hidden min-[980px]:block"
									/>
								</Link>
								<DialogPrimitive.Close className="h-12 rounded-xl border bg-card text-[15px] font-medium text-foreground transition-colors hover:bg-surface-2">
									Continuar comprando
								</DialogPrimitive.Close>
							</div>
						</>
					) : null}
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

function AddedItemArt({ slug }: { slug: string }) {
	const visual = getProductVisual(slug);

	return (
		<div
			className="flex size-[72px] shrink-0 items-center justify-center rounded-xl"
			style={{ background: visual.tint }}
		>
			<ProductArt kind={visual.kind} size={44} />
		</div>
	);
}

export type { AddedItem };
export { AddedToCartDrawer };
