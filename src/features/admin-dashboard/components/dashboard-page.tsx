'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { cn } from '@/lib/utils';

import {
	useDashboard,
	useLowStock,
	usePreparationQueue,
	useRevenueOrders,
} from '../hooks/admin-dashboard.queries';
import { funnelStages, revenueByDay } from '../lib/dashboard-metrics';
import {
	parsePeriod,
	periodRange,
	type DashboardPeriod,
} from '../lib/dashboard-period';
import { KpiCards } from './kpi-cards';
import { LowStockCard } from './low-stock-card';
import { OrdersFunnel } from './orders-funnel';
import { RecentOrders } from './recent-orders';
import { RevenueChart } from './revenue-chart';

const periods: { value: DashboardPeriod; label: string }[] = [
	{ value: 7, label: '7 dias' },
	{ value: 30, label: '30 dias' },
];

/** Admin · Dashboard (AdminDashboard.dc.html). */
function DashboardPage() {
	return (
		// The period lives in the URL (?periodo=), read inside Suspense.
		<Suspense fallback={null}>
			<DashboardContent />
		</Suspense>
	);
}

function DashboardContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const period = parsePeriod(searchParams.get('periodo'));
	// Store days are fixed when the screen opens; the data still refreshes.
	const [openedAt] = useState(() => new Date());
	const range = periodRange(period, openedAt);

	const dashboard = useDashboard(range);
	const revenueOrders = useRevenueOrders(range);
	const preparation = usePreparationQueue();
	const lowStock = useLowStock();

	const current = dashboard.current.data;
	const dashboardFailed =
		(dashboard.current.isError && !current) ||
		(dashboard.previous.isError && !dashboard.previous.data);
	const retryDashboard = () => {
		void dashboard.current.refetch();
		void dashboard.previous.refetch();
	};

	function choosePeriod(value: DashboardPeriod) {
		const params = new URLSearchParams(searchParams);
		if (value === 30) {
			params.delete('periodo');
		} else {
			params.set('periodo', String(value));
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	return (
		<div className="flex flex-col gap-5 px-5 py-7 min-[980px]:px-8">
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex grow flex-col gap-1">
					<Eyebrow className="tracking-[0.16em]">VISÃO GERAL</Eyebrow>
					<h1 className="text-[34px] font-light tracking-[-0.025em]">
						Dashboard
					</h1>
				</div>
				<span className="flex items-center gap-2 text-[13px] text-success">
					<span className="size-[7px] animate-pulse-dot rounded-full bg-success" />
					Ao vivo
				</span>
				<div
					role="radiogroup"
					aria-label="Período"
					className="flex gap-1 rounded-xl border bg-card p-1"
				>
					{periods.map((option) => (
						<button
							key={option.value}
							type="button"
							role="radio"
							aria-checked={period === option.value}
							onClick={() => choosePeriod(option.value)}
							className={cn(
								'h-9 rounded-[9px] px-3.5 text-[13px] font-medium transition-colors',
								period === option.value
									? 'bg-foreground text-white'
									: 'text-ink-soft hover:bg-surface',
							)}
						>
							{option.label}
						</button>
					))}
				</div>
			</div>

			<KpiCards
				// Replays the entrance when the period changes.
				key={period}
				current={current}
				previous={dashboard.previous.data}
				preparation={preparation.data}
				failed={dashboardFailed || (preparation.isError && !preparation.data)}
				onRetry={() => {
					retryDashboard();
					void preparation.refetch();
				}}
			/>

			<div className="grid grid-cols-1 gap-4 min-[1180px]:grid-cols-12">
				<RevenueChart
					days={range.days}
					values={
						revenueOrders.data
							? revenueByDay(revenueOrders.data, range.days)
							: undefined
					}
					failed={revenueOrders.isError && !revenueOrders.data}
					onRetry={() => void revenueOrders.refetch()}
				/>
				<OrdersFunnel
					key={`funnel-${period}`}
					stages={current ? funnelStages(current.ordersByStatus) : undefined}
					waiting={preparation.data?.waiting}
					failed={dashboard.current.isError && !current}
					onRetry={retryDashboard}
				/>
				<RecentOrders
					orders={current?.recentOrders}
					updatedAt={dashboard.current.dataUpdatedAt}
					failed={dashboard.current.isError && !current}
					onRetry={retryDashboard}
				/>
				<LowStockCard
					data={lowStock.data}
					failed={lowStock.isError && !lowStock.data}
					onRetry={() => void lowStock.refetch()}
				/>
			</div>
		</div>
	);
}

export { DashboardPage };
