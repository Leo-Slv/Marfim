'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback } from 'react';

import { parsePage } from '@/features/admin-orders/lib/order-tabs';
import { cn } from '@/lib/utils';

import { NewProductFormCard } from './new-product-form';
import { ProductEditor } from './product-editor';
import { ProductsList } from './products-list';

/** Admin · Produtos (AdminProdutos.dc.html). */
function ProductsPage() {
	return (
		// Search, page and the open product live in the URL (Suspense).
		<Suspense fallback={null}>
			<ProductsContent />
		</Suspense>
	);
}

function ProductsContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchTerm = searchParams.get('q') ?? '';
	const page = parsePage(searchParams.get('pagina'));
	const productId = searchParams.get('produto');
	const creating = searchParams.get('novo') === '1';
	const editing = creating || productId !== null;

	const update = useCallback(
		(changes: Record<string, string | null>) => {
			const params = new URLSearchParams(searchParams);
			for (const [key, value] of Object.entries(changes)) {
				if (value === null) {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}
			const query = params.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		},
		[pathname, router, searchParams],
	);

	const onSearch = useCallback(
		(term: string) => update({ q: term || null, pagina: null }),
		[update],
	);

	return (
		<div className="flex min-h-full grow">
			<section
				className={cn(
					'w-full shrink-0 flex-col px-4 py-3 min-[980px]:py-7 min-[980px]:pr-5 min-[980px]:pl-8 min-[1280px]:w-[400px]',
					editing ? 'hidden min-[1280px]:flex' : 'flex',
				)}
			>
				<ProductsList
					searchTerm={searchTerm}
					page={page}
					selectedId={creating ? null : productId}
					creating={creating}
					onSearch={onSearch}
					onPage={(next) => update({ pagina: next > 1 ? String(next) : null })}
					onOpen={(id) => update({ produto: id, novo: null })}
					onNew={() => update({ novo: '1', produto: null })}
				/>
			</section>
			<section
				className={cn(
					'min-w-0 grow flex-col px-4 py-3 min-[980px]:px-5 min-[980px]:py-7 min-[1280px]:pr-8 min-[1280px]:pl-3',
					editing ? 'flex' : 'hidden min-[1280px]:flex',
				)}
			>
				{creating ? (
					<NewProductFormCard
						onCreated={(id) => update({ produto: id, novo: null })}
						onCancel={() => update({ novo: null })}
					/>
				) : productId ? (
					<ProductEditor
						key={productId}
						productId={productId}
						onClose={() => update({ produto: null })}
					/>
				) : (
					<div className="flex grow items-center justify-center rounded-2xl border border-dashed px-10 text-center text-sm text-muted-foreground">
						Escolha um produto na lista para editar, ou crie um em “+ Novo”.
					</div>
				)}
			</section>
		</div>
	);
}

export { ProductsPage };
