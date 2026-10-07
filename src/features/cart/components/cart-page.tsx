'use client';

import { ArrowLeftIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { CheckoutSteps } from '@/components/checkout-steps';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import {
	useCategories,
	useProducts,
} from '@/features/catalog/hooks/catalog.queries';
import { formatPieceCount } from '@/features/catalog/lib/format-piece-count';
import type { ProductSummary } from '@/features/catalog/model/product';
import { appRoutes } from '@/lib/routes/app-routes';

import { useCartQuote } from '../hooks/cart.queries';
import { useCart } from '../hooks/use-cart';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import {
	buildCartView,
	checkoutGate,
	pickRecommendations,
} from '../lib/cart-view';
import { FreeShippingCard, GiftWrapOption } from './cart-extras';
import { CartEmptyState } from './cart-empty-state';
import { CartGhostLine } from './cart-ghost-line';
import { CartLineItem } from './cart-line-item';
import { CartSummary } from './cart-summary';
import { CartRecommendations } from './cart-recommendations';

/** OrderCore's maximum page size — the pool joined with the quote. */
const CATALOG_PAGE_SIZE = 100;

/** Sacola (Docs/specs/storefront/cart.md). */
function CartPage() {
	const hydrated = useIsHydrated();
	const { lines, addItem, setQuantity, removeItem, repriceItem } = useCart();
	const quote = useCartQuote(lines);
	const catalog = useProducts({ page: 1, pageSize: CATALOG_PAGE_SIZE });
	const categories = useCategories();

	const products = catalog.data?.items ?? [];
	const view = buildCartView({
		lines,
		quote: quote.data,
		products,
		categories: categories.data ?? [],
	});
	const gate = checkoutGate({
		hasLines: lines.length > 0,
		quoteStatus: quote.isError
			? 'error'
			: quote.isOutdated || !quote.data
				? 'checking'
				: 'ready',
		quoteIsValid: quote.data?.isValid ?? false,
	});
	const recommendations = pickRecommendations(products, lines);
	const isEmpty = hydrated && lines.length === 0;

	function addRecommendation(product: ProductSummary) {
		addItem({
			productId: product.id,
			slug: product.slug,
			name: product.name,
			unitPrice: product.currentPrice,
		});
	}

	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader
				mobileBack={{ href: appRoutes.system.home, title: 'Sacola' }}
			/>
			<main className="flex grow flex-col">
				<section className="pt-4 min-[980px]:pt-8 min-[980px]:pb-2">
					<div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 sm:px-10">
						<CheckoutSteps current="cart" />
						{/* The mobile top bar already says "Sacola". */}
						<div className="sr-only flex-wrap items-baseline gap-4 min-[980px]:not-sr-only min-[980px]:flex">
							<h1 className="animate-up text-[44px] leading-none font-light tracking-[-0.03em] [animation-duration:.7s]">
								Sua <span className="font-medium text-primary">sacola</span>
							</h1>
							{hydrated && view.pieceCount > 0 ? (
								<span className="animate-up font-mono text-[13px] text-muted-foreground [animation-delay:.06s]">
									{formatPieceCount(view.pieceCount)}
								</span>
							) : null}
							<span className="grow" />
							<Link
								href={appRoutes.system.home}
								className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-strong"
							>
								<ArrowLeftIcon size={14} />
								Continuar comprando
							</Link>
						</div>
					</div>
				</section>

				<section className="pt-3 pb-4 min-[980px]:pt-4 min-[980px]:pb-12">
					<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-6 gap-y-3 px-4 min-[980px]:grid-cols-12 min-[980px]:gap-y-7 sm:px-10">
						<div className="flex flex-col gap-3 min-[980px]:col-span-8 min-[980px]:gap-4">
							<div className="hidden min-[980px]:block">
								<FreeShippingCard subtotal={view.total} />
							</div>
							{!hydrated ? (
								<div
									aria-busy="true"
									aria-label="Carregando sacola"
									className="skeleton h-[152px] rounded-[20px]"
								/>
							) : isEmpty ? (
								<CartEmptyState />
							) : (
								<>
									<div className="flex animate-up flex-col gap-3 [animation-delay:.12s] min-[980px]:block min-[980px]:rounded-[20px] min-[980px]:border min-[980px]:bg-card min-[980px]:px-5">
										{view.lines.map((line) => (
											<CartLineItem
												key={line.productId}
												line={line}
												onQuantityChange={(quantity) =>
													setQuantity(line.productId, quantity)
												}
												onRemove={() => removeItem(line.productId)}
												onAcknowledgePrice={() =>
													repriceItem(line.productId, line.unitPrice)
												}
											/>
										))}
										{view.unavailable.map((line) => (
											<CartGhostLine
												key={line.productId}
												line={line}
												onRemove={() => removeItem(line.productId)}
											/>
										))}
									</div>
									<div className="hidden min-[980px]:block">
										<GiftWrapOption />
									</div>
								</>
							)}
						</div>
						{isEmpty ? null : (
							<div className="min-[980px]:col-span-4 min-[980px]:col-start-9">
								<CartSummary
									view={view}
									gate={gate}
									onRetry={quote.isError ? () => quote.refetch() : null}
								/>
							</div>
						)}
					</div>
				</section>

				{hydrated ? (
					<CartRecommendations
						products={recommendations}
						onAdd={addRecommendation}
					/>
				) : null}
			</main>
			<StoreFooter hideOnMobile />
		</div>
	);
}

export { CartPage };
