'use client';

import { CaretDownIcon, TruckIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { Eyebrow } from '@/components/eyebrow';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import {
	AddedToCartDrawer,
	type AddedItem,
} from '@/features/cart/components/added-to-cart-drawer';
import { useCart } from '@/features/cart/hooks/use-cart';
import { ProductArt } from '@/features/catalog/components/product-art';
import {
	useCategories,
	useProductBySlug,
} from '@/features/catalog/hooks/catalog.queries';
import { formatDiscountPercent } from '@/features/catalog/lib/discount-percent';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { isOnSale } from '@/features/catalog/lib/is-on-sale';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import type {
	ProductDetail,
	ProductSummary,
} from '@/features/catalog/model/product';
import { QueryErrorState } from '@/features/errors/components/query-error-state';
import { isApiError } from '@/lib/http/api-error';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import {
	atelierLine,
	careText,
	RETURNS_TEXT,
	stockLine,
} from '../lib/product-content';
import { ProductBuyBox, ProductVariants } from './product-buy-box';
import { ProductGallery } from './product-gallery';
import { ProductRecommendations } from './product-recommendations';

/** Produto (Produto.dc.html). */
function ProductPage({ slug }: { slug: string }) {
	const product = useProductBySlug(slug);
	const categories = useCategories();
	const notFound = isApiError(product.error) && product.error.status === 404;
	const category = product.data
		? (categories.data?.find((item) => item.id === product.data.categoryId) ??
			null)
		: null;

	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader
				mobileBack={
					category
						? {
								href: appRoutes.products.category(category.slug),
								title: category.name,
							}
						: { href: appRoutes.products.list }
				}
			/>
			<main className="flex grow flex-col">
				{product.isPending ? (
					<ProductSkeleton />
				) : notFound ? (
					<ProductNotFound />
				) : product.isError ? (
					<QueryErrorState
						key={product.errorUpdatedAt}
						error={product.error}
						onRetry={() => void product.refetch()}
					/>
				) : (
					<ProductContent key={product.data.id} product={product.data} />
				)}
			</main>
			<StoreFooter />
		</div>
	);
}

function ProductContent({ product }: { product: ProductDetail }) {
	const categories = useCategories();
	const { lines, addItem } = useCart();
	const [added, setAdded] = useState<AddedItem | null>(null);
	const category =
		categories.data?.find((item) => item.id === product.categoryId) ?? null;
	const visual = getProductVisual(product.slug);
	const onSale = isOnSale(product);
	const discount =
		onSale && product.compareAtPrice
			? formatDiscountPercent(product.currentPrice, product.compareAtPrice)
			: null;
	const stock = stockLine(product.availability);
	const atelier = atelierLine(product.brand);
	const inBag = lines.some((line) => line.productId === product.id);

	function showAdded(item: ProductSummary | ProductDetail, quantity: number) {
		setAdded({
			slug: item.slug,
			name: item.name,
			brand: item.brand,
			unitPrice: item.currentPrice,
			quantity,
		});
	}

	return (
		<>
			<title>{`${product.name} · Marfim`}</title>
			<nav
				aria-label="Você está em"
				className="px-5 pt-6 pb-2 font-mono text-[11px] tracking-[0.14em] text-muted-foreground min-[980px]:px-10"
			>
				<div className="mx-auto max-w-[1280px]">
					<Link href={appRoutes.system.home} className="hover:text-foreground">
						INÍCIO
					</Link>
					{category ? (
						<>
							{' / '}
							<Link
								href={appRoutes.products.category(category.slug)}
								className="hover:text-foreground"
							>
								{category.name.toUpperCase()}
							</Link>
						</>
					) : null}
					{' / '}
					<span className="text-foreground" aria-current="page">
						{product.name.toUpperCase()}
					</span>
				</div>
			</nav>

			<section className="px-5 pt-3 pb-14 min-[980px]:px-10">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-8 min-[980px]:grid-cols-12">
					<div className="min-[980px]:col-span-7">
						<ProductGallery
							visual={visual}
							name={product.name}
							discount={discount}
						/>
					</div>

					<div className="flex animate-up flex-col gap-[22px] [animation-delay:.08s] min-[980px]:sticky min-[980px]:top-6 min-[980px]:col-span-5">
						<div className="flex flex-col gap-2.5">
							{atelier ? (
								<Eyebrow className="tracking-[0.16em]">{atelier}</Eyebrow>
							) : null}
							<h1 className="text-[40px] leading-[1.05] font-light tracking-[-0.03em]">
								{product.name}
							</h1>
							{product.shortDescription ? (
								<p className="text-sm text-ink-soft">
									{product.shortDescription}
								</p>
							) : null}
							{product.description ? (
								<p className="text-[15px] leading-[1.55] text-muted-foreground">
									{product.description}
								</p>
							) : null}
						</div>

						<div className="flex flex-wrap items-baseline gap-3">
							<span
								className={cn(
									'text-4xl font-light tracking-[-0.03em]',
									stock.tone === 'out' && 'text-muted-foreground',
								)}
							>
								{formatCurrencyBrl(product.currentPrice)}
							</span>
							{onSale && product.compareAtPrice ? (
								<>
									<span className="font-mono text-[15px] text-muted-foreground line-through">
										{formatCurrencyBrl(product.compareAtPrice)}
									</span>
									<span className="flex h-6 items-center rounded-full bg-success-soft px-[9px] font-mono text-xs text-success">
										{discount}
									</span>
								</>
							) : null}
						</div>

						<div
							className={cn(
								'flex items-center gap-2 text-sm',
								stock.tone === 'ok'
									? 'text-success'
									: stock.tone === 'low'
										? 'text-clay'
										: 'text-muted-foreground',
							)}
						>
							<span
								className={cn(
									'size-2 rounded-full bg-current',
									stock.tone === 'ok' && 'animate-pulse-dot',
								)}
							/>
							<span className="font-medium">{stock.label}</span>
							{stock.note ? (
								<span className="text-muted-foreground">· {stock.note}</span>
							) : null}
						</div>

						{product.variants.length > 0 ? (
							<div className="border-t pt-5">
								<ProductVariants product={product} />
							</div>
						) : null}

						<ProductBuyBox
							product={product}
							categoryName={category?.name ?? null}
							onAdded={(quantity) => showAdded(product, quantity)}
						/>
						{inBag ? (
							<Link
								href={appRoutes.cart.index}
								className="-mt-3 self-start text-[13px] font-medium text-primary hover:text-primary-strong"
							>
								Ver a sacola →
							</Link>
						) : null}

						<div className="flex flex-col border-t">
							<div className="flex items-center gap-3 border-b py-3.5 text-sm text-muted-foreground">
								<TruckIcon size={18} />
								<span className="grow">Calcular frete e prazo pelo CEP</span>
								<ComingSoonBadge />
							</div>
							<Accordion title="Medidas e materiais" defaultOpen>
								<div className="grid grid-cols-[120px_minmax(0,1fr)] gap-y-2 text-sm">
									<span className="pt-0.5 font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
										MATERIAIS
									</span>
									<span>{product.shortDescription ?? 'Não informado'}</span>
									<span className="pt-0.5 font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
										MEDIDAS
									</span>
									<span>
										<ComingSoonBadge />
									</span>
								</div>
							</Accordion>
							<Accordion title="Cuidados com a peça">
								<p className="text-sm leading-relaxed text-ink-soft">
									{careText(category?.slug ?? null)}
								</p>
							</Accordion>
							<Accordion title="Trocas e devoluções">
								<p className="text-sm leading-relaxed text-ink-soft">
									{RETURNS_TEXT}
								</p>
							</Accordion>
						</div>
					</div>
				</div>
			</section>

			<ProductRecommendations
				product={product}
				category={category}
				onAdd={(item) => {
					addItem({
						productId: item.id,
						slug: item.slug,
						name: item.name,
						unitPrice: item.currentPrice,
					});
					showAdded(item, 1);
				}}
			/>
			<AddedToCartDrawer item={added} onClose={() => setAdded(null)} />
		</>
	);
}

function Accordion({
	title,
	defaultOpen = false,
	children,
}: {
	title: string;
	defaultOpen?: boolean;
	children: React.ReactNode;
}) {
	return (
		<details open={defaultOpen} className="group border-b">
			<summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
				{title}
				<CaretDownIcon
					size={16}
					className="transition-transform duration-200 group-open:rotate-180"
				/>
			</summary>
			<div className="pb-4">{children}</div>
		</details>
	);
}

function ProductNotFound() {
	return (
		<section className="px-5 py-[72px]">
			<title>Produto não encontrado · Marfim</title>
			<div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 text-center">
				<div className="animate-floaty opacity-35">
					<ProductArt kind="pendant" size={140} />
				</div>
				<Eyebrow>PRODUTO NÃO ENCONTRADO</Eyebrow>
				<h1 className="animate-up text-[40px] font-light tracking-[-0.03em]">
					Essa peça não está mais na loja
				</h1>
				<p className="max-w-[460px] text-[15px] text-muted-foreground">
					O link pode estar errado ou a peça saiu da coleção. As outras peças
					continuam aqui.
				</p>
				<Link
					href={appRoutes.products.list}
					className="mt-2 flex h-12 items-center rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
				>
					Ver a loja
				</Link>
			</div>
		</section>
	);
}

function ProductSkeleton() {
	return (
		<section className="px-5 pt-[52px] pb-14 min-[980px]:px-10">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 min-[980px]:grid-cols-12">
				<div className="skeleton h-[380px] rounded-[20px] min-[980px]:col-span-7 min-[980px]:h-[560px]" />
				<div className="flex flex-col gap-4 min-[980px]:col-span-5">
					<div className="skeleton h-4 w-40 rounded" />
					<div className="skeleton h-12 w-3/4 rounded-lg" />
					<div className="skeleton h-20 rounded-lg" />
					<div className="skeleton h-[52px] rounded-xl" />
				</div>
			</div>
		</section>
	);
}

export { ProductPage };
