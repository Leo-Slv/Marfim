import { formatCurrencyBrl } from '../lib/format-currency-brl';
import { isOnSale } from '../lib/is-on-sale';
import type { ProductSummary } from '../model/product';

function ProductCard({ product }: { product: ProductSummary }) {
	const onSale = isOnSale(product);

	return (
		<article className="flex flex-col gap-3 rounded-xl border bg-card p-4">
			<div className="aspect-square overflow-hidden rounded-lg bg-surface">
				{product.primaryImageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={product.primaryImageUrl}
						alt={product.name}
						className="size-full object-cover"
					/>
				) : null}
			</div>
			{product.brand ? (
				<span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
					{product.brand}
				</span>
			) : null}
			<h2 className="text-base font-medium">{product.name}</h2>
			<div className="flex items-baseline gap-2">
				<span className="font-medium">
					{formatCurrencyBrl(product.currentPrice)}
				</span>
				{onSale && product.compareAtPrice !== null ? (
					<span className="text-sm text-muted-foreground line-through">
						{formatCurrencyBrl(product.compareAtPrice)}
					</span>
				) : null}
			</div>
		</article>
	);
}

export { ProductCard };
