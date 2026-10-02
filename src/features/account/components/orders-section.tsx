'use client';

import { CaretRightIcon, HandbagIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ProductArt } from '@/features/catalog/components/product-art';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { slugify } from '@/features/catalog/lib/slugify';
import { parsePage } from '@/features/listing/lib/pagination';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { useMyOrders, useOrdersDetails } from '../hooks/account.queries';
import { formatOrderDate, orderItemsSummary } from '../lib/account-format';
import { orderStatusClass, orderStatusLabel } from '../lib/order-status';
import { ORDERS_PAGE_SIZE } from './account-layout';

/** 22 · Meus pedidos. */
function OrdersSection() {
	const page = parsePage(useSearchParams().get('pagina'));
	const orders = useMyOrders(page, ORDERS_PAGE_SIZE);
	const details = useOrdersDetails(
		orders.data?.items.map((order) => order.id) ?? [],
	);

	return (
		<>
			<h2 className="text-2xl font-medium tracking-[-0.01em]">Meus pedidos</h2>
			{orders.isPending ? (
				<div className="skeleton h-[280px] rounded-[20px]" />
			) : orders.isError ? (
				<p role="alert" className="rounded-2xl bg-clay-soft px-5 py-4 text-sm">
					Não foi possível carregar seus pedidos.{' '}
					<button
						type="button"
						onClick={() => orders.refetch()}
						className="font-medium text-primary"
					>
						Tentar de novo
					</button>
				</p>
			) : orders.data.items.length === 0 ? (
				<div className="flex flex-col items-center gap-3 rounded-[20px] border bg-card px-8 py-12 text-center">
					<div className="flex size-16 animate-floaty items-center justify-center rounded-full bg-surface">
						<HandbagIcon size={28} className="text-muted-foreground" />
					</div>
					<div className="text-[22px] font-light">
						Você ainda não fez pedidos
					</div>
					<p className="max-w-[360px] text-sm text-muted-foreground">
						Quando fizer, você acompanha cada etapa por aqui, do ateliê até a
						entrega.
					</p>
					<Link
						href={appRoutes.system.home}
						className="mt-1.5 flex h-12 items-center rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
					>
						Ver a loja
					</Link>
				</div>
			) : (
				<div className="overflow-hidden rounded-[20px] border bg-card">
					<div className="hidden grid-cols-[140px_110px_minmax(0,1fr)_110px_190px_24px] gap-4 bg-surface px-5 py-3 font-mono text-[10px] tracking-[0.12em] text-muted-foreground min-[980px]:grid">
						<span>PEDIDO</span>
						<span>DATA</span>
						<span>ITENS</span>
						<span>TOTAL</span>
						<span>STATUS</span>
						<span />
					</div>
					<ul>
						{orders.data.items.map((order, index) => {
							const detail = details[index]?.data;
							const names = detail?.items.map((item) => item.productName) ?? [];
							return (
								<li
									key={order.id}
									className="border-t first:border-t-0 min-[980px]:first:border-t"
								>
									<Link
										href={appRoutes.account.order(order.id)}
										className="grid animate-up grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 text-left text-foreground transition-colors hover:bg-[#FAFAF8] min-[980px]:grid-cols-[140px_110px_minmax(0,1fr)_110px_190px_24px]"
										style={{ animationDelay: `${(index * 0.05).toFixed(2)}s` }}
									>
										<span className="font-mono text-[13px] font-medium">
											{order.orderNumber}
										</span>
										<span className="text-sm text-ink-soft max-[979px]:text-right">
											{formatOrderDate(order.createdAt)}
										</span>
										<span className="col-span-2 flex min-w-0 items-center gap-2.5 min-[980px]:col-span-1">
											<span className="flex">
												{detail?.items.slice(0, 2).map((item) => {
													const visual = getProductVisual(
														slugify(item.productName),
													);
													return (
														<span
															key={item.productId}
															className="-mr-2 flex size-9 items-center justify-center rounded-[10px] border-2 border-card"
															style={{ background: visual.tint }}
														>
															<ProductArt kind={visual.kind} size={20} />
														</span>
													);
												}) ?? (
													<span className="skeleton size-9 rounded-[10px]" />
												)}
											</span>
											<span className="truncate pl-2 text-sm">
												{names.length > 0
													? orderItemsSummary(names)
													: `${order.itemCount} ${order.itemCount === 1 ? 'peça' : 'peças'}`}
											</span>
										</span>
										<span className="font-mono text-[13px]">
											{formatCurrencyBrl(order.totalAmount)}
										</span>
										<span className="max-[979px]:text-right">
											<span
												className={cn(
													'inline-flex h-[26px] items-center rounded-full px-2.5 text-xs font-medium',
													orderStatusClass(order.status),
												)}
											>
												{orderStatusLabel(order.status)}
											</span>
										</span>
										<CaretRightIcon
											size={16}
											className="hidden text-muted-foreground min-[980px]:block"
										/>
									</Link>
								</li>
							);
						})}
					</ul>
					<div className="flex items-center justify-between border-t px-5 py-3.5 font-mono text-xs text-muted-foreground">
						<span>
							{(orders.data.page - 1) * orders.data.pageSize + 1}–
							{Math.min(
								orders.data.page * orders.data.pageSize,
								orders.data.totalItems,
							)}{' '}
							DE {orders.data.totalItems}
						</span>
						<span className="flex items-center gap-3">
							{orders.data.page > 1 ? (
								<Link
									href={`${appRoutes.account.orders}?pagina=${orders.data.page - 1}`}
									className="text-primary"
								>
									ANTERIOR
								</Link>
							) : null}
							PÁGINA {orders.data.page} DE {Math.max(1, orders.data.totalPages)}
							{orders.data.page < orders.data.totalPages ? (
								<Link
									href={`${appRoutes.account.orders}?pagina=${orders.data.page + 1}`}
									className="text-primary"
								>
									PRÓXIMA
								</Link>
							) : null}
						</span>
					</div>
				</div>
			)}
		</>
	);
}

export { OrdersSection };
