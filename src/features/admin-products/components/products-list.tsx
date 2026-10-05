'use client';

import {
	CaretLeftIcon,
	CaretRightIcon,
	MagnifyingGlassIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { ProductArt } from '@/features/catalog/components/product-art';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

import { useAdminProducts } from '../hooks/admin-products.queries';
import { productStatusClass, productStatusLabel } from '../lib/product-form';

/** "CATÁLOGO · Produtos": search, + Novo and the product rows. */
function ProductsList({
	searchTerm,
	page,
	selectedId,
	creating,
	onSearch,
	onPage,
	onOpen,
	onNew,
}: {
	searchTerm: string;
	page: number;
	selectedId: string | null;
	creating: boolean;
	onSearch: (term: string) => void;
	onPage: (page: number) => void;
	onOpen: (productId: string) => void;
	onNew: () => void;
}) {
	const [term, setTerm] = useState(searchTerm);
	const debounced = useDebouncedValue(term, 300);
	const products = useAdminProducts(searchTerm, page);

	useEffect(() => {
		if (debounced.trim() !== searchTerm) {
			onSearch(debounced.trim());
		}
	}, [debounced, searchTerm, onSearch]);

	const totalPages = products.data?.totalPages ?? 1;

	return (
		<div className="flex flex-col gap-3.5">
			<div className="flex items-end gap-3">
				<div className="flex grow flex-col gap-1">
					<Eyebrow className="tracking-[0.16em]">CATÁLOGO</Eyebrow>
					<h1 className="text-[34px] font-light tracking-[-0.025em]">
						Produtos
					</h1>
				</div>
				<button
					type="button"
					onClick={onNew}
					aria-pressed={creating}
					className="h-10 rounded-xl bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
				>
					+ Novo
				</button>
			</div>
			<label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 text-muted-foreground focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
				<MagnifyingGlassIcon size={16} />
				<input
					type="search"
					aria-label="Buscar produto"
					placeholder="Buscar por nome ou SKU"
					value={term}
					onChange={(event) => setTerm(event.target.value)}
					className="w-full bg-transparent text-sm text-foreground outline-none"
				/>
			</label>
			<div className="overflow-hidden rounded-2xl border bg-card">
				{products.isError && !products.data ? (
					<div
						role="alert"
						className="flex flex-col items-center gap-2 p-8 text-sm text-ink-soft"
					>
						Não foi possível carregar os produtos.
						<button
							type="button"
							onClick={() => void products.refetch()}
							className="font-medium text-primary hover:text-primary-strong"
						>
							Tentar de novo
						</button>
					</div>
				) : !products.data ? (
					<div className="flex flex-col gap-2 p-3.5">
						{[0, 1, 2, 3, 4, 5].map((index) => (
							<div key={index} className="skeleton h-11 rounded-lg" />
						))}
					</div>
				) : products.data.items.length === 0 ? (
					<p className="p-8 text-center text-sm text-muted-foreground">
						{searchTerm
							? 'Nenhum produto com esse nome ou SKU.'
							: 'Nenhum produto ainda.'}
					</p>
				) : (
					<div
						className={cn(
							products.isPlaceholderData && 'opacity-60 transition-opacity',
						)}
					>
						{products.data.items.map((product, index) => {
							const visual = getProductVisual(product.slug);
							const selected = product.id === selectedId;
							return (
								<button
									key={product.id}
									type="button"
									onClick={() => onOpen(product.id)}
									aria-pressed={selected}
									className={cn(
										'flex w-full items-center gap-3 border-l-[3px] px-3.5 py-2.5 text-left transition-colors',
										index > 0 && 'border-t',
										selected
											? 'border-l-primary bg-primary-soft'
											: 'border-l-transparent hover:bg-[#FAFAF8]',
									)}
								>
									<span
										className="flex size-10 shrink-0 items-center justify-center rounded-[10px]"
										style={{ background: visual.tint }}
									>
										<ProductArt kind={visual.kind} size={24} />
									</span>
									<span className="flex min-w-0 grow flex-col">
										<span className="truncate text-sm">{product.name}</span>
										<span className="font-mono text-[11px] text-muted-foreground">
											{formatCurrencyBrlCents(product.currentPrice)} ·{' '}
											{product.sku}
										</span>
									</span>
									<span
										className={cn(
											'inline-flex h-[22px] shrink-0 items-center rounded-full px-2 text-[11px] font-medium',
											productStatusClass(product.status),
										)}
									>
										{productStatusLabel(product.status)}
									</span>
								</button>
							);
						})}
					</div>
				)}
			</div>
			{totalPages > 1 ? (
				<nav
					aria-label="Páginas"
					className="flex items-center justify-end gap-2 text-sm text-ink-soft"
				>
					<span className="font-mono text-xs">
						{page} / {totalPages}
					</span>
					<button
						type="button"
						onClick={() => onPage(page - 1)}
						disabled={page <= 1}
						aria-label="Página anterior"
						className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
					>
						<CaretLeftIcon size={14} />
					</button>
					<button
						type="button"
						onClick={() => onPage(page + 1)}
						disabled={page >= totalPages}
						aria-label="Próxima página"
						className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
					>
						<CaretRightIcon size={14} />
					</button>
				</nav>
			) : null}
		</div>
	);
}

export { ProductsList };
