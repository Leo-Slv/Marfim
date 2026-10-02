import { cn } from '@/lib/utils';

import { addressLines } from '../lib/format-address';
import type { CustomerAddress } from '../model/address';

/** A selectable saved address (radio card). */
function AddressCard({
	address,
	name,
	selected,
	onSelect,
	compact = false,
}: {
	address: CustomerAddress;
	/** Radio group name. */
	name: string;
	selected: boolean;
	onSelect: () => void;
	/** Billing list: one line, no recipient/badge. */
	compact?: boolean;
}) {
	const { streetLine, placeLine } = addressLines(address);

	return (
		<label
			className={cn(
				'flex cursor-pointer items-start gap-3.5 rounded-[14px] border px-[18px] transition-colors hover:border-primary',
				compact ? 'py-3.5' : 'animate-up py-4',
				selected ? 'border-primary bg-primary-soft' : 'bg-card',
			)}
		>
			<input
				type="radio"
				name={name}
				checked={selected}
				onChange={onSelect}
				className="mt-0.5 size-[18px] shrink-0 accent-primary"
			/>
			<span className="flex grow flex-col gap-1">
				<span className="flex flex-wrap items-center gap-2">
					<b className="text-[15px] font-medium">{address.label}</b>
					{!compact && address.isDefaultShipping ? (
						<span className="inline-flex h-[22px] items-center rounded-full bg-surface px-2 font-mono text-[10px] tracking-[0.08em] text-ink-soft">
							PADRÃO DE ENTREGA
						</span>
					) : null}
				</span>
				{compact ? (
					<span className="text-sm text-ink-soft">
						{streetLine} · {placeLine}
					</span>
				) : (
					<span className="text-sm leading-normal text-ink-soft">
						{address.recipientName} · {streetLine}
						<br />
						{placeLine}
					</span>
				)}
			</span>
		</label>
	);
}

export { AddressCard };
