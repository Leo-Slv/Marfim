'use client';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { ProductArt } from '@/features/catalog/components/product-art';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { cn } from '@/lib/utils';

import { stockLevelView } from '../lib/stock';
import type { StockRow } from '../schemas/admin-inventory.schema';

/** Tighter numbers until there's room for the mockup's widths. */
const columns =
	'grid grid-cols-[minmax(0,1fr)_64px_64px_64px_128px] items-center gap-3 min-[1440px]:grid-cols-[minmax(0,1fr)_86px_86px_86px_170px]';

const stateText = {
	ok: 'text-success',
	low: 'text-clay',
	out: 'text-clay',
} as const;

function StockTable({
	rows,
	selectedId,
	onOpen,
	page,
	totalPages,
	onPage,
	loading,
	failed,
	onRetry,
	emptyText,
}: {
	rows: StockRow[] | undefined;
	selectedId: string | null;
	onOpen: (productId: string) => void;
	page: number;
	totalPages: number;
	onPage: (page: number) => void;
	loading: boolean;
	failed: boolean;
	onRetry: () => void;
	emptyText: string;
}) {
	return (
		<div className="flex flex-col gap-3">
			{/* Below 980 px: one card per product (MobileAdminEstoque.dc.html). */}
			<div className="flex flex-col gap-2 min-[980px]:hidden">
				{failed ? (
					<div
						role="alert"
						className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-8 text-sm text-ink-soft"
					>
						Não foi possível carregar o estoque.
						<button
							type="button"
							onClick={onRetry}
							className="font-medium text-primary"
						>
							Tentar de novo
						</button>
					</div>
				) : !rows ? (
					[0, 1, 2, 3].map((index) => (
						<div key={index} className="skeleton h-[88px] rounded-2xl" />
					))
				) : rows.length === 0 ? (
					<p className="p-8 text-center text-sm text-muted-foreground">
						{emptyText}
					</p>
				) : (
					rows.map((row) => {
						const visual = getProductVisual(row.slug);
						const level = stockLevelView(row.stock);
						return (
							<button
								key={row.id}
								type="button"
								onClick={() => onOpen(row.id)}
								className={cn(
									'flex animate-up flex-col gap-2.5 rounded-2xl border bg-card p-3 text-left',
									loading && 'opacity-60 transition-opacity',
								)}
							>
								<span className="flex w-full items-center gap-3">
									<span
										className="flex size-11 shrink-0 items-center justify-center rounded-xl"
										style={{ background: visual.tint }}
									>
										<ProductArt kind={visual.kind} size={26} />
									</span>
									<span className="flex min-w-0 grow flex-col gap-0.5">
										<span className="truncate text-[15px]">{row.name}</span>
										<span className="font-mono text-[11px] text-muted-foreground">
											{row.sku} · res. {level.reserved} · rep.{' '}
											{level.reorderLevel}
										</span>
									</span>
									<span className="flex flex-col items-end gap-0.5">
										<span
											className={cn(
												'font-mono text-lg',
												level.available === 0 && 'text-clay',
											)}
										>
											{level.available}
										</span>
										<span
											className={cn(
												'text-[11px] font-medium',
												stateText[level.state],
											)}
										>
											{level.label}
										</span>
									</span>
								</span>
								<span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-surface">
									<span
										className={cn(
											'absolute inset-y-0 left-0 origin-left animate-bar rounded-full',
											level.state === 'ok' ? 'bg-primary' : 'bg-warning',
										)}
										style={{ width: `${level.barPercent}%` }}
									/>
									<span
										className="absolute inset-y-0 w-0.5 bg-foreground opacity-35"
										style={{ left: `${level.tickPercent}%` }}
									/>
								</span>
							</button>
						);
					})
				)}
			</div>
			<div className="hidden overflow-hidden rounded-2xl border bg-card min-[980px]:block">
				{' '}
				<div className="overflow-x-auto">
					<div className="min-w-[540px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[18px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>PRODUTO</span>
							<span>DISPONÍVEL</span>
							<span>RESERVADO</span>
							<span>REPOSIÇÃO</span>
							<span>NÍVEL</span>
						</div>
						{failed ? (
							<div
								role="alert"
								className="flex flex-col items-center gap-2 border-t p-10 text-sm text-ink-soft"
							>
								Não foi possível carregar o estoque.
								<button
									type="button"
									onClick={onRetry}
									className="font-medium text-primary hover:text-primary-strong"
								>
									Tentar de novo
								</button>
							</div>
						) : !rows ? (
							<div className="flex flex-col gap-2 border-t p-[18px]">
								{[0, 1, 2, 3, 4, 5].map((index) => (
									<div key={index} className="skeleton h-10 rounded-lg" />
								))}
							</div>
						) : rows.length === 0 ? (
							<p className="border-t p-10 text-center text-sm text-muted-foreground">
								{emptyText}
							</p>
						) : (
							<div className={cn(loading && 'opacity-60 transition-opacity')}>
								{rows.map((row) => {
									const visual = getProductVisual(row.slug);
									const level = stockLevelView(row.stock);
									const selected = row.id === selectedId;
									return (
										<button
											key={row.id}
											type="button"
											onClick={() => onOpen(row.id)}
											aria-pressed={selected}
											className={cn(
												columns,
												'w-full border-t border-l-[3px] px-[18px] py-[11px] text-left text-sm transition-colors',
												selected
													? 'border-l-primary bg-primary-soft'
													: 'border-l-transparent hover:bg-[#FAFAF8]',
											)}
										>
											<span className="flex min-w-0 items-center gap-2.5">
												<span
													className="flex size-8 shrink-0 items-center justify-center rounded-lg"
													style={{ background: visual.tint }}
												>
													<ProductArt kind={visual.kind} size={20} />
												</span>
												<span className="flex min-w-0 flex-col">
													<span className="truncate">{row.name}</span>
													<span className="font-mono text-[11px] text-muted-foreground">
														{row.sku}
													</span>
												</span>
											</span>
											<span
												key={`${row.id}-${level.available}`}
												className={cn(
													'animate-pop-in font-mono',
													level.available === 0 && 'text-clay',
												)}
											>
												{level.available}
											</span>
											<span className="font-mono text-[13px] text-ink-soft">
												{level.reserved}
											</span>
											<span className="font-mono text-[13px] text-ink-soft">
												{level.reorderLevel}
											</span>
											<span className="flex items-center gap-2">
												<span className="relative h-1.5 grow overflow-hidden rounded-full bg-surface">
													<span
														className={cn(
															'absolute inset-y-0 left-0 origin-left animate-bar rounded-full',
															level.state === 'ok'
																? 'bg-primary'
																: 'bg-warning',
														)}
														style={{ width: `${level.barPercent}%` }}
													/>
													<span
														className="absolute -inset-y-0.5 w-0.5 bg-foreground opacity-35"
														style={{ left: `${level.tickPercent}%` }}
													/>
												</span>
												<span
													className={cn(
														'w-11 text-[11px] font-medium',
														stateText[level.state],
													)}
												>
													{level.label}
												</span>
											</span>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="flex flex-wrap items-center gap-3">
				<span className="flex grow items-center gap-2 text-xs text-muted-foreground">
					<span className="h-2.5 w-0.5 bg-foreground opacity-35" />
					Traço = ponto de reposição. Barra laranja = abaixo do ponto.
				</span>
				{totalPages > 1 ? (
					<nav
						aria-label="Páginas"
						className="flex items-center gap-2 text-sm text-ink-soft"
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
		</div>
	);
}

export { StockTable };
