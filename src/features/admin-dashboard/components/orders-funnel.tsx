import { cn } from '@/lib/utils';

import type { FunnelStage } from '../lib/dashboard-metrics';
import {
	Panel,
	PanelError,
	PanelTitle,
	Skeleton,
	SoonLink,
} from './dashboard-ui';

/** "Pedidos por etapa": orders created in the period, by stage. */
function OrdersFunnel({
	stages,
	waiting,
	failed,
	onRetry,
}: {
	stages: FunnelStage[] | undefined;
	waiting: number | undefined;
	failed: boolean;
	onRetry: () => void;
}) {
	const max = Math.max(1, ...(stages ?? []).map((stage) => stage.count));

	return (
		<Panel className="gap-3.5 px-[22px] py-5 [animation-delay:.15s] min-[1180px]:col-span-4">
			<PanelTitle>Pedidos por etapa</PanelTitle>
			{failed ? (
				<PanelError onRetry={onRetry} />
			) : stages ? (
				stages.map((stage, index) => (
					<div key={stage.label} className="flex flex-col gap-1.5">
						<div className="flex justify-between text-[13px]">
							<span className="text-ink-soft">{stage.label}</span>
							<span className="font-mono">{stage.count}</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-surface">
							<div
								className={cn(
									'h-2 origin-left animate-bar rounded-full',
									stage.done ? 'bg-success' : 'bg-primary',
								)}
								style={{
									width: `${(stage.count / max) * 100}%`,
									opacity: stage.done ? 1 : 1 - index * 0.15,
									animationDelay: `${index * 0.08}s`,
								}}
							/>
						</div>
					</div>
				))
			) : (
				<Skeleton className="h-[220px]" />
			)}
			{waiting !== undefined ? (
				<div className="mt-auto pt-1">
					<SoonLink>
						{waiting === 1
							? '1 pedido espera preparo'
							: `${waiting} pedidos esperam preparo`}{' '}
						→
					</SoonLink>
				</div>
			) : null}
		</Panel>
	);
}

export { OrdersFunnel };
