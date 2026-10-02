import { Eyebrow } from '@/components/eyebrow';
import { ListingProductCard } from '@/features/catalog/components/listing-product-card';
import type { ProductSummary } from '@/features/catalog/model/product';

/** "Combina com a sua sacola" — chosen client-side (cart pendency #5). */
function CartRecommendations({
	products,
	onAdd,
}: {
	products: ProductSummary[];
	onAdd: (product: ProductSummary) => void;
}) {
	if (products.length === 0) {
		return null;
	}

	return (
		<section className="pt-4 pb-[72px]">
			<div className="mx-auto flex max-w-[1280px] flex-col gap-[22px] px-5 sm:px-10">
				<div className="flex flex-col gap-2">
					<Eyebrow>DAS MESMAS CATEGORIAS</Eyebrow>
					<h2 className="text-[34px] font-light tracking-[-0.025em]">
						Combina com a sua sacola
					</h2>
				</div>
				<ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 min-[980px]:grid-cols-3 min-[1180px]:grid-cols-4">
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
			</div>
		</section>
	);
}

export { CartRecommendations };
