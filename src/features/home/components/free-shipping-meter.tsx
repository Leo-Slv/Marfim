'use client';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { useCart } from '@/features/cart/hooks/use-cart';
import { freeShippingProgress } from '@/features/cart/lib/free-shipping';

/** Muted preview of the free-shipping goal (EM BREVE in the mockup). */
function FreeShippingMeter() {
	const { subtotal } = useCart();
	const { percent, label } = freeShippingProgress(subtotal);

	return (
		<div className="flex w-full flex-col gap-2 rounded-[14px] border border-dashed bg-card px-4 py-3 opacity-65 sm:w-80">
			<div className="flex items-center justify-between gap-2 text-[13px]">
				<span className="text-ink-soft">{label}</span>
				<ComingSoonBadge />
			</div>
			<div
				role="progressbar"
				aria-label="Progresso para frete grátis"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={Math.round(percent)}
				className="h-1.5 overflow-hidden rounded-full bg-surface"
			>
				<div
					className="h-1.5 rounded-full bg-warning transition-[width] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
					style={{ width: `${percent.toFixed(1)}%` }}
				/>
			</div>
		</div>
	);
}

export { FreeShippingMeter };
