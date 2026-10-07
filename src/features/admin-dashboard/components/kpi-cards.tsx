import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { cn } from '@/lib/utils';

import {
	averageTicket,
	countDelta,
	paidOrdersOf,
	percentDelta,
	revenueOf,
	type DeltaTone,
} from '../lib/dashboard-metrics';
import type { Dashboard } from '../schemas/admin-dashboard.schema';
import { Panel, PanelError, Skeleton } from './dashboard-ui';

type ChipTone = DeltaTone | 'alert';

type Kpi = {
	label: string;
	value: string;
	chip: { text: string; tone: ChipTone };
	note: string;
};

const chipClass: Record<ChipTone, string> = {
	up: 'bg-success-soft text-success',
	down: 'bg-surface text-ink-soft',
	flat: 'bg-surface text-ink-soft',
	alert: 'bg-clay-soft text-clay',
};

/** Whole reais: the KPIs round like the mockup ("R$ 17.980"). */
function money(amount: number) {
	return formatCurrencyBrl(Math.round(amount));
}

function KpiCards({
	current,
	previous,
	preparation,
	failed,
	onRetry,
}: {
	current: Dashboard | undefined;
	previous: Dashboard | undefined;
	preparation: { waiting: number; late: number } | undefined;
	failed: boolean;
	onRetry: () => void;
}) {
	if (failed) {
		return (
			<Panel className="px-5">
				<PanelError onRetry={onRetry} />
			</Panel>
		);
	}
	if (!current || !previous || !preparation) {
		return (
			<div className="grid grid-cols-2 gap-2 min-[980px]:gap-4 min-[1180px]:grid-cols-4">
				{[0, 1, 2, 3].map((index) => (
					<Skeleton key={index} className="h-[124px] rounded-2xl" />
				))}
			</div>
		);
	}

	const revenue = revenueOf(current);
	const previousRevenue = revenueOf(previous);
	const paid = paidOrdersOf(current);
	const previousPaid = paidOrdersOf(previous);
	const ticket = averageTicket(revenue, paid);
	const previousTicket = averageTicket(previousRevenue, previousPaid);
	const expiring = current.expiringAuthorizations;

	const kpis: Kpi[] = [
		{
			label: 'Receita no período',
			value: money(revenue),
			chip: percentDelta(revenue, previousRevenue),
			note: 'vs. período anterior',
		},
		{
			label: 'Pedidos pagos',
			value: String(paid),
			chip: countDelta(paid, previousPaid),
			note: 'vs. período anterior',
		},
		{
			label: 'Ticket médio',
			value: money(ticket),
			chip: percentDelta(ticket, previousTicket),
			note: 'vs. período anterior',
		},
		{
			label: 'A preparar agora',
			value: String(preparation.waiting),
			chip:
				preparation.late > 0
					? { text: `${preparation.late} há +24 h`, tone: 'alert' }
					: { text: 'em dia', tone: 'up' },
			note:
				expiring > 0
					? `${expiring} ${expiring === 1 ? 'autorização vence' : 'autorizações vencem'} em breve`
					: 'meta: nenhum atrasado',
		},
	];

	return (
		<div className="grid grid-cols-2 gap-2 min-[980px]:gap-4 min-[1180px]:grid-cols-4">
			{kpis.map((kpi, index) => (
				<Panel
					key={kpi.label}
					className="gap-1.5 px-3 py-3 min-[980px]:gap-2.5 min-[980px]:px-5 min-[980px]:py-[18px]"
					style={{ animationDelay: `${index * 0.05}s` }}
				>
					<span className="text-xs text-ink-soft min-[980px]:text-[13px]">
						{kpi.label}
					</span>
					<span className="text-2xl leading-none font-light tracking-[-0.03em] min-[980px]:text-[34px]">
						{kpi.value}
					</span>
					<span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground max-[979px]:self-start">
						<span
							className={cn(
								'inline-flex h-[22px] items-center rounded-full px-2 font-mono text-[11px]',
								chipClass[kpi.chip.tone],
							)}
						>
							{kpi.chip.text}
						</span>
						<span className="hidden min-[980px]:inline">{kpi.note}</span>
					</span>
				</Panel>
			))}
		</div>
	);
}

export { KpiCards };
