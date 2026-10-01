'use client';

import { useProducts } from '../hooks/catalog.queries';
import { ProductCard } from './product-card';

const PAGE_SIZE = 20;

/**
 * Placeholder home content for the scaffold: lists the first page of
 * products so the feature slice (api → schema → hook → component) has a
 * real consumer. Replace it once the home page is specced.
 */
function ProductList() {
	const products = useProducts({ page: 1, pageSize: PAGE_SIZE });

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12">
			<h1 className="text-4xl font-light tracking-tight">Marfim</h1>
			{products.isPending ? (
				<p className="text-muted-foreground">Carregando produtos…</p>
			) : products.isError ? (
				<p className="text-destructive">
					Não foi possível carregar os produtos.
				</p>
			) : products.data.items.length === 0 ? (
				<p className="text-muted-foreground">Nenhum produto disponível.</p>
			) : (
				<ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{products.data.items.map((product) => (
						<li key={product.id}>
							<ProductCard product={product} />
						</li>
					))}
				</ul>
			)}
		</main>
	);
}

export { ProductList };
