'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { parsePage } from '@/features/admin-orders/lib/order-tabs';
import { cn } from '@/lib/utils';

import {
	useStockList,
	useStockSummary,
} from '../hooks/admin-inventory.queries';
import { parseFilter, stockFilters, stockSummary } from '../lib/stock';
import { StockPanel } from './stock-panel';
import { StockTable } from './stock-table';

/** Admin · Estoque (AdminEstoque.dc.html). */
function InventoryPage() {
	return (
		// Filter, page and open product live in the URL (Suspense).
		<Suspense fallback={null}>
			<InventoryContent />
		</Suspense>
	);
}

function InventoryContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const filter = parseFilter(searchParams.get('nivel'));
	const page = parsePage(searchParams.get('pagina'));
	const productId = searchParams.get('produto');

	const list = useStockList(filter, page);
	const summary = useStockSummary();
	const totals = summary.data
		? stockSummary(summary.data.items.map((row) => row.stock))
		: null;
	const counts: Record<string, number | undefined> = {
		todos: summary.data?.totalItems,
		abaixo: totals?.low,
		esgotados: totals?.out,
	};
	const openRow =
		list.data?.items.find((row) => row.id === productId) ??
		summary.data?.items.find((row) => row.id === productId);

	function update(changes: Record<string, string | null>) {
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
	}

	const tiles = [
		{ label: 'Unidades disponíveis', value: totals?.units, alert: false },
		{
			label: 'Abaixo do ponto de reposição',
			value: totals?.low,
			alert: (totals?.low ?? 0) > 0,
		},
		{ label: 'Esgotados', value: totals?.out, alert: (totals?.out ?? 0) > 0 },
	];

	return (
		<div className="flex min-h-full grow">
			<section
				className={cn(
					'min-w-0 grow flex-col gap-4 px-5 py-7 min-[980px]:pr-6 min-[980px]:pl-8',
					productId ? 'hidden min-[1280px]:flex' : 'flex',
				)}
			>
				<div className="flex flex-wrap items-end gap-4">
					<div className="flex grow flex-col gap-1">
						<Eyebrow className="tracking-[0.16em]">OPERAÇÃO</Eyebrow>
						<h1 className="text-[34px] font-light tracking-[-0.025em]">
							Estoque
						</h1>
					</div>
					<div
						role="tablist"
						aria-label="Filtro"
						className="flex flex-wrap gap-1.5"
					>
						{stockFilters.map((option) => {
							const selected = option.id === filter.id;
							return (
								<button
									key={option.id}
									type="button"
									role="tab"
									aria-selected={selected}
									onClick={() =>
										update({
											nivel: option.id === 'todos' ? null : option.id,
											pagina: null,
										})
									}
									className={cn(
										'flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors',
										selected
											? 'bg-foreground text-white'
											: 'bg-card text-ink-soft hover:bg-surface-2',
									)}
								>
									{option.label}
									<span className="font-mono text-[11px] opacity-75">
										{counts[option.id] ?? '·'}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-3">
					{tiles.map((tile) => (
						<div
							key={tile.label}
							className="flex flex-col gap-1.5 rounded-[14px] border bg-card px-[18px] py-3.5"
						>
							<span className="text-[13px] text-ink-soft">{tile.label}</span>
							{tile.value === undefined ? (
								<span className="skeleton h-[30px] w-12 rounded" />
							) : (
								<span
									key={tile.value}
									className={cn(
										'animate-pop-in text-[30px] leading-none font-light tracking-[-0.03em]',
										tile.label === 'Unidades disponíveis'
											? 'text-foreground'
											: tile.alert
												? 'text-clay'
												: 'text-success',
									)}
								>
									{tile.value}
								</span>
							)}
						</div>
					))}
				</div>

				<StockTable
					rows={list.data?.items}
					selectedId={productId}
					onOpen={(id) => update({ produto: id })}
					page={page}
					totalPages={list.data?.totalPages ?? 1}
					onPage={(next) => update({ pagina: next > 1 ? String(next) : null })}
					loading={list.isPlaceholderData}
					failed={list.isError && !list.data}
					onRetry={() => void list.refetch()}
					emptyText={
						filter.id === 'esgotados'
							? 'Nenhum produto esgotado.'
							: filter.id === 'abaixo'
								? 'Tudo acima do ponto de reposição.'
								: 'Nenhum produto cadastrado.'
					}
				/>
			</section>
			{productId ? (
				<StockPanel
					key={productId}
					productId={productId}
					row={openRow}
					onClose={() => update({ produto: null })}
				/>
			) : (
				<aside className="hidden w-[400px] shrink-0 items-center justify-center border-l bg-card px-10 text-center text-sm text-muted-foreground min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:flex min-[1280px]:h-screen">
					Escolha um produto para registrar recebimentos, ajustes e o ponto de
					reposição.
				</aside>
			)}
		</div>
	);
}

export { InventoryPage };
