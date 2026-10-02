import type { AdminProductSummary } from '../schemas/admin-dashboard.schema';
import {
	Panel,
	PanelError,
	PanelTitle,
	Skeleton,
	SoonLink,
} from './dashboard-ui';

/** "Abaixo do ponto de reposição": out of stock first, then low. */
function LowStockCard({
	data,
	failed,
	onRetry,
}: {
	data: { total: number; items: AdminProductSummary[] } | undefined;
	failed: boolean;
	onRetry: () => void;
}) {
	return (
		<Panel className="gap-1 px-[22px] py-4 [animation-delay:.2s] min-[1180px]:col-span-4">
			<div className="flex items-center gap-3 pb-2">
				<PanelTitle>Abaixo do ponto de reposição</PanelTitle>
				{data ? (
					<span
						className={
							data.total > 0
								? 'inline-flex h-[22px] items-center rounded-full bg-clay-soft px-2 font-mono text-[11px] text-clay'
								: 'inline-flex h-[22px] items-center rounded-full bg-success-soft px-2 font-mono text-[11px] text-success'
						}
					>
						{data.total}
					</span>
				) : null}
			</div>
			{failed ? (
				<PanelError onRetry={onRetry} />
			) : !data ? (
				<Skeleton className="h-[150px]" />
			) : data.items.length === 0 ? (
				<p className="border-t py-4 text-sm text-muted-foreground">
					Tudo acima do ponto de reposição.
				</p>
			) : (
				data.items.map((product) => (
					<div
						key={product.id}
						className="flex items-center gap-3 border-t py-2.5"
					>
						<span className="flex min-w-0 grow flex-col">
							<span className="truncate text-sm">{product.name}</span>
							<span className="text-xs text-muted-foreground">
								{product.sku}
							</span>
						</span>
						<StockLevel stock={product.stock} />
					</div>
				))
			)}
			<div className="mt-1.5">
				<SoonLink>Registrar recebimento →</SoonLink>
			</div>
		</Panel>
	);
}

/** "available / reorder level"; "esgotado" when there is no reorder level. */
function StockLevel({ stock }: { stock: AdminProductSummary['stock'] }) {
	const available = stock?.quantityAvailable ?? 0;
	const reorderLevel = stock?.reorderLevel ?? 0;
	if (reorderLevel === 0) {
		return (
			<span className="font-mono text-[13px] text-clay">
				{available === 0 ? 'esgotado' : available}
			</span>
		);
	}
	return (
		<span
			className="font-mono text-[13px] text-clay"
			title="Disponível / ponto de reposição"
		>
			{available} / {reorderLevel}
		</span>
	);
}

export { LowStockCard };
