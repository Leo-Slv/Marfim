'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { cn } from '@/lib/utils';

import { useAdminOrders, useOrderCounts } from '../hooks/admin-orders.queries';
import { parsePage, parseTab } from '../lib/order-tabs';
import { CustomerSearch } from './customer-search';
import { OrderDetailPanel } from './order-detail-panel';
import { OrdersTable, StatusTabs } from './orders-table';

/** Admin · Pedidos (AdminPedidos.dc.html). */
function OrdersPage() {
	return (
		// Tab, customer, page and open order live in the URL (Suspense).
		<Suspense fallback={null}>
			<OrdersContent />
		</Suspense>
	);
}

function OrdersContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tab = parseTab(searchParams.get('status'));
	const page = parsePage(searchParams.get('pagina'));
	const customerId = searchParams.get('cliente');
	const orderId = searchParams.get('pedido');

	const orders = useAdminOrders(tab, customerId, page);
	const counts = useOrderCounts(customerId);

	/** Changes the URL; anything but the open order resets the page. */
	function update(changes: Record<string, string | null>) {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		if (!('pagina' in changes) && !('pedido' in changes)) {
			params.delete('pagina');
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	return (
		<div className="flex min-h-full grow">
			<section
				className={cn(
					'min-w-0 grow flex-col gap-3 px-4 py-3 min-[980px]:gap-4 min-[980px]:py-7 min-[980px]:pr-6 min-[980px]:pl-8',
					orderId ? 'hidden min-[1280px]:flex' : 'flex',
				)}
			>
				<div className="flex flex-wrap items-end gap-4">
					<div className="flex grow flex-col gap-1 max-[979px]:sr-only">
						<Eyebrow className="tracking-[0.16em]">OPERAÇÃO</Eyebrow>
						<h1 className="text-[34px] font-light tracking-[-0.025em]">
							Pedidos
						</h1>
					</div>
					<CustomerSearch
						customerId={customerId}
						onPick={(id) => update({ cliente: id })}
					/>
				</div>
				<StatusTabs
					current={tab}
					counts={counts.data}
					onPick={(picked) =>
						update({ status: picked.id === 'todos' ? null : picked.id })
					}
				/>
				<OrdersTable
					orders={orders.data?.items}
					selectedId={orderId}
					onOpen={(id) => update({ pedido: id })}
					page={page}
					totalPages={orders.data?.totalPages ?? 1}
					onPage={(next) => update({ pagina: next > 1 ? String(next) : null })}
					loading={orders.isPlaceholderData}
					failed={orders.isError && !orders.data}
					onRetry={() => void orders.refetch()}
				/>
			</section>
			{orderId ? (
				<OrderDetailPanel
					key={orderId}
					orderId={orderId}
					onClose={() => update({ pedido: null })}
				/>
			) : (
				<aside className="hidden w-[420px] shrink-0 items-center justify-center border-l bg-card px-10 text-center text-sm text-muted-foreground min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:flex min-[1280px]:h-screen">
					Escolha um pedido na lista para ver os itens, a linha do tempo e a
					próxima ação.
				</aside>
			)}
		</div>
	);
}

export { OrdersPage };
