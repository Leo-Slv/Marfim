import Link from 'next/link';

import {
	orderStatusClass,
	orderStatusLabel,
} from '@/features/account/lib/order-status';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { timeAgo } from '../lib/dashboard-metrics';
import type { AdminOrderSummary } from '../schemas/admin-dashboard.schema';
import {
	Panel,
	PanelError,
	PanelLink,
	PanelTitle,
	Skeleton,
} from './dashboard-ui';

const SHOWN = 5;
const columns =
	'grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_56px] gap-3 min-[720px]:grid-cols-[150px_minmax(0,1fr)_110px_180px_70px]';

/** "Últimos pedidos": the dashboard's most recent orders. */
function RecentOrders({
	orders,
	updatedAt,
	failed,
	onRetry,
}: {
	orders: AdminOrderSummary[] | undefined;
	/** When the list was fetched — "HÁ" is relative to it. */
	updatedAt: number;
	failed: boolean;
	onRetry: () => void;
}) {
	return (
		<Panel className="overflow-hidden [animation-delay:.15s] min-[1180px]:col-span-8">
			<div className="flex items-center gap-3 px-[22px] py-4">
				<PanelTitle>Últimos pedidos</PanelTitle>
				<PanelLink href={appRoutes.admin.orders}>Ver todos</PanelLink>
			</div>
			{failed ? (
				<div className="px-[22px]">
					<PanelError onRetry={onRetry} />
				</div>
			) : !orders ? (
				<div className="flex flex-col gap-2 px-[22px] pb-5">
					<Skeleton className="h-10" />
					<Skeleton className="h-10" />
					<Skeleton className="h-10" />
				</div>
			) : orders.length === 0 ? (
				<p className="border-t px-[22px] py-6 text-sm text-muted-foreground">
					Nenhum pedido ainda.
				</p>
			) : (
				<div className="overflow-x-auto">
					<div className="min-w-[560px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[22px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>PEDIDO</span>
							<span>CLIENTE</span>
							<span>TOTAL</span>
							<span>STATUS</span>
							<span>HÁ</span>
						</div>
						{orders.slice(0, SHOWN).map((order) => (
							<Link
								key={order.id}
								href={appRoutes.admin.order(order.id)}
								className={cn(
									columns,
									'items-center border-t px-[22px] py-3 text-sm text-foreground transition-colors hover:bg-[#FAFAF8]',
								)}
							>
								<span className="truncate font-mono text-[13px]">
									{order.orderNumber}
								</span>
								<span className="truncate" title={order.customer?.email}>
									{order.customer?.name ?? '—'}
								</span>
								<span className="font-mono text-[13px]">
									{formatCurrencyBrl(order.totalAmount)}
								</span>
								<span>
									<span
										className={cn(
											'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
											orderStatusClass(order.status),
										)}
									>
										{orderStatusLabel(order.status)}
									</span>
								</span>
								<span className="font-mono text-xs text-muted-foreground">
									{timeAgo(order.createdAt, new Date(updatedAt))}
								</span>
							</Link>
						))}
					</div>
				</div>
			)}
		</Panel>
	);
}

export { RecentOrders };
