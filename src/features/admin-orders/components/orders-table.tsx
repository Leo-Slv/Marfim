'use client';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import type { AdminOrderSummary } from '@/features/admin-dashboard/schemas/admin-dashboard.schema';
import {
	orderStatusClass,
	orderStatusLabel,
} from '@/features/account/lib/order-status';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { cn } from '@/lib/utils';

import { formatOrderMoment } from '../lib/order-format';
import { orderTabs, type OrderTab } from '../lib/order-tabs';

/** Compact (no ITENS) until there's room for the mockup's five columns. */
const columns =
	'grid grid-cols-[132px_minmax(0,1fr)_96px_150px] gap-3 min-[1440px]:grid-cols-[132px_minmax(0,1fr)_70px_100px_160px]';

/** Status tabs with live counts. */
function StatusTabs({
	current,
	counts,
	onPick,
}: {
	current: OrderTab;
	counts: Record<string, number> | undefined;
	onPick: (tab: OrderTab) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="Filtrar por status"
			className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 min-[980px]:mx-0 min-[980px]:flex-wrap min-[980px]:overflow-visible min-[980px]:px-0 [&::-webkit-scrollbar]:hidden"
		>
			{orderTabs.map((tab) => {
				const selected = tab.id === current.id;
				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={selected}
						onClick={() => onPick(tab)}
						className={cn(
							'flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-[13px] font-medium whitespace-nowrap transition-colors',
							selected
								? 'bg-foreground text-white'
								: 'bg-card text-ink-soft hover:bg-surface-2',
						)}
					>
						{tab.label}
						<span className="font-mono text-[11px] opacity-75">
							{counts?.[tab.id] ?? '·'}
						</span>
					</button>
				);
			})}
		</div>
	);
}

function OrdersTable({
	orders,
	selectedId,
	onOpen,
	page,
	totalPages,
	onPage,
	loading,
	failed,
	onRetry,
}: {
	orders: AdminOrderSummary[] | undefined;
	selectedId: string | null;
	onOpen: (orderId: string) => void;
	page: number;
	totalPages: number;
	onPage: (page: number) => void;
	loading: boolean;
	failed: boolean;
	onRetry: () => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			{/* Below 980 px: one card per order (MobileAdminPedidos.dc.html). */}
			<div className="flex flex-col gap-2 min-[980px]:hidden">
				{failed ? (
					<div
						role="alert"
						className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-8 text-sm text-ink-soft"
					>
						Não foi possível carregar os pedidos.
						<button
							type="button"
							onClick={onRetry}
							className="font-medium text-primary"
						>
							Tentar de novo
						</button>
					</div>
				) : !orders ? (
					[0, 1, 2, 3].map((index) => (
						<div key={index} className="skeleton h-[76px] rounded-2xl" />
					))
				) : orders.length === 0 ? (
					<p className="p-8 text-center text-sm text-muted-foreground">
						Nenhum pedido neste filtro.
					</p>
				) : (
					orders.map((order) => (
						<button
							key={order.id}
							type="button"
							onClick={() => onOpen(order.id)}
							className={cn(
								'flex animate-up flex-col gap-2 rounded-2xl border bg-card px-3.5 py-3 text-left',
								loading && 'opacity-60 transition-opacity',
							)}
						>
							<span className="flex w-full items-center justify-between">
								<span className="font-mono text-[13px]">
									{order.orderNumber}
								</span>
								<span
									className={cn(
										'inline-flex h-6 items-center rounded-full px-[9px] text-[11px] font-medium whitespace-nowrap',
										orderStatusClass(order.status),
									)}
								>
									{orderStatusLabel(order.status)}
								</span>
							</span>
							<span className="flex w-full items-center justify-between gap-3 text-sm">
								<span className="flex min-w-0 flex-col gap-0.5">
									<span className="truncate">
										{order.customer?.name ?? '—'}
									</span>
									<span className="text-xs text-muted-foreground">
										{formatOrderMoment(order.createdAt)} · {order.itemCount} un.
									</span>
								</span>
								<span className="font-mono text-[13px] whitespace-nowrap">
									{formatCurrencyBrlCents(order.totalAmount)} ›
								</span>
							</span>
						</button>
					))
				)}
			</div>
			<div className="hidden overflow-hidden rounded-2xl border bg-card min-[980px]:block">
				<div className="overflow-x-auto">
					<div className="min-w-[480px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[18px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>PEDIDO</span>
							<span>CLIENTE</span>
							<span className="hidden min-[1440px]:block">ITENS</span>
							<span>TOTAL</span>
							<span>STATUS</span>
						</div>
						{failed ? (
							<div
								role="alert"
								className="flex flex-col items-center gap-2 border-t p-10 text-sm text-ink-soft"
							>
								Não foi possível carregar os pedidos.
								<button
									type="button"
									onClick={onRetry}
									className="font-medium text-primary hover:text-primary-strong"
								>
									Tentar de novo
								</button>
							</div>
						) : !orders ? (
							<div className="flex flex-col gap-2 border-t p-[18px]">
								{[0, 1, 2, 3, 4].map((index) => (
									<div key={index} className="skeleton h-11 rounded-lg" />
								))}
							</div>
						) : orders.length === 0 ? (
							<p className="border-t p-10 text-center text-sm text-muted-foreground">
								Nenhum pedido neste filtro.
							</p>
						) : (
							<div className={cn(loading && 'opacity-60 transition-opacity')}>
								{orders.map((order) => {
									const selected = order.id === selectedId;
									return (
										<button
											key={order.id}
											type="button"
											onClick={() => onOpen(order.id)}
											aria-pressed={selected}
											className={cn(
												columns,
												'w-full items-center border-t border-l-[3px] px-[18px] py-[13px] text-left text-sm transition-colors',
												selected
													? 'border-l-primary bg-primary-soft'
													: 'border-l-transparent hover:bg-[#FAFAF8]',
											)}
										>
											<span className="truncate font-mono text-[13px]">
												{order.orderNumber}
											</span>
											<span className="flex min-w-0 flex-col">
												<span className="truncate">
													{order.customer?.name ?? '—'}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatOrderMoment(order.createdAt)}
												</span>
											</span>
											<span className="hidden font-mono text-[13px] text-ink-soft min-[1440px]:block">
												{order.itemCount} un.
											</span>
											<span className="font-mono text-[13px]">
												{formatCurrencyBrlCents(order.totalAmount)}
											</span>
											<span>
												<span
													key={order.status}
													className={cn(
														'inline-flex h-6 animate-pop-in items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
														orderStatusClass(order.status),
													)}
												>
													{orderStatusLabel(order.status)}
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

export { OrdersTable, StatusTabs };
