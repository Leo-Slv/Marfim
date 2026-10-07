import { ListingProductCard } from '@/features/catalog/components/listing-product-card';
import type { ProductSummary } from '@/features/catalog/model/product';
import { cn } from '@/lib/utils';

const gridClassName =
	'grid grid-cols-2 gap-2.5 min-[980px]:grid-cols-3 min-[980px]:gap-4 min-[1180px]:grid-cols-4';

const SKELETON_CARDS = 8;

function ListingGrid({
	products,
	gridKey,
	dimmed,
	onAdd,
}: {
	products: ProductSummary[];
	/** Changes with filter/sort/page so the cards' enter animation replays. */
	gridKey: string;
	dimmed: boolean;
	onAdd: (product: ProductSummary) => void;
}) {
	return (
		<ul
			key={gridKey}
			className={cn(
				gridClassName,
				'transition-opacity',
				dimmed && 'opacity-60',
			)}
		>
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
	);
}

function ListingGridSkeleton() {
	return (
		<div
			aria-busy="true"
			aria-label="Carregando peças"
			className={gridClassName}
		>
			{Array.from({ length: SKELETON_CARDS }, (_, index) => (
				<div
					key={index}
					className="flex flex-col gap-3 rounded-2xl border bg-card p-2"
				>
					<div className="skeleton h-[150px] rounded-[10px] min-[980px]:h-[210px] min-[980px]:rounded-xl" />
					<div className="flex flex-col gap-2 px-1.5 pb-2">
						<div className="skeleton h-2.5 w-2/5 rounded-md" />
						<div className="skeleton h-3.5 w-3/4 rounded-md" />
						<div className="skeleton h-3 w-[30%] rounded-md" />
					</div>
				</div>
			))}
		</div>
	);
}

export { ListingGrid, ListingGridSkeleton };
