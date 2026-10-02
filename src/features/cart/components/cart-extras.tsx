import { TruckIcon } from '@phosphor-icons/react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { cn } from '@/lib/utils';

import { freeShippingProgress } from '../lib/free-shipping';

/**
 * Free-shipping progress — muted with EM BREVE: OrderCore has no shipping
 * rules yet (cart pendency #3).
 */
function FreeShippingCard({ subtotal }: { subtotal: number }) {
	const { percent, label } = freeShippingProgress(subtotal);
	const reached = percent >= 100;

	// The fade-up runs on the wrapper: its `opacity: 1` end state would
	// otherwise override the card's muted opacity.
	return (
		<div className="animate-up [animation-delay:.06s]">
			<div className="flex items-center gap-4 rounded-2xl border border-dashed bg-card px-5 py-4 opacity-60">
				<span
					className={cn(
						'flex size-9 shrink-0 items-center justify-center rounded-[10px]',
						reached ? 'bg-success-soft text-success' : 'bg-clay-soft text-clay',
					)}
				>
					<TruckIcon size={18} />
				</span>
				<div className="flex grow flex-col gap-2">
					<div className="flex justify-between gap-3 text-sm">
						<span className="font-medium">{label}</span>
						<ComingSoonBadge />
					</div>
					<div className="h-1.5 overflow-hidden rounded-full bg-surface">
						<div
							className={cn(
								'h-1.5 rounded-full transition-[width,background-color] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]',
								reached ? 'bg-success' : 'bg-warning',
							)}
							style={{ width: `${percent.toFixed(1)}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

/** Gift wrap — disabled with EM BREVE (cart pendency #4). */
function GiftWrapOption() {
	return (
		<div className="animate-up [animation-delay:.18s]">
			<label className="flex items-start gap-3.5 rounded-2xl border border-dashed bg-card px-5 py-[18px] opacity-60">
				<input
					type="checkbox"
					disabled
					className="mt-[3px] size-[18px] accent-primary"
				/>
				<span className="flex grow flex-col gap-0.5">
					<span className="flex items-center gap-2 text-[15px] font-medium">
						É para presente <ComingSoonBadge />
					</span>
					<span className="text-[13px] leading-normal text-muted-foreground">
						Embrulho em tecido do Tear Alto, reutilizável, e cartão escrito à
						mão. O valor não aparece na nota enviada junto.
					</span>
				</span>
				<span className="font-mono text-[13px] text-ink-soft">+ R$ 25</span>
			</label>
		</div>
	);
}

export { FreeShippingCard, GiftWrapOption };
