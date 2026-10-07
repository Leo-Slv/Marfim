import { ProhibitIcon, XIcon } from '@phosphor-icons/react';

import type { UnavailableLine } from '../lib/cart-view';
import { unavailableCopy } from '../lib/line-issue-copy';

/** A bag line that can't be bought anymore (not found / unavailable). */
function CartGhostLine({
	line,
	onRemove,
}: {
	line: UnavailableLine;
	onRemove: () => void;
}) {
	const copy = unavailableCopy(line.issue);

	return (
		// Below 980 px a dashed card with an × (MobileSacola.dc.html).
		<div className="flex animate-up items-center gap-3 rounded-2xl border border-dashed bg-card p-3 min-[980px]:flex-wrap min-[980px]:gap-5 min-[980px]:rounded-none min-[980px]:border-0 min-[980px]:border-t min-[980px]:border-solid min-[980px]:bg-transparent min-[980px]:px-0 min-[980px]:py-5 min-[980px]:first:border-t-0">
			<div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-surface opacity-45 min-[980px]:size-28">
				<ProhibitIcon
					size={40}
					weight="light"
					className="text-muted-foreground"
				/>
			</div>
			<div className="flex grow flex-col gap-0.5 min-[980px]:basis-48 min-[980px]:gap-1.5">
				<div className="font-mono text-[10px] tracking-[0.12em] text-clay min-[980px]:text-[11px] min-[980px]:text-muted-foreground">
					{copy.code}
				</div>
				<div className="text-[15px] font-medium text-muted-foreground line-through min-[980px]:text-lg">
					{line.name}
				</div>
				<div className="text-xs text-ink-soft min-[980px]:text-[13px]">
					{copy.text}
				</div>
			</div>
			<button
				type="button"
				onClick={onRemove}
				aria-label={`Remover ${line.name} da sacola`}
				className="flex size-11 items-center justify-center rounded-xl border bg-card text-foreground transition-colors hover:bg-surface-2 min-[980px]:h-10 min-[980px]:w-auto min-[980px]:rounded-[10px] min-[980px]:px-3.5 min-[980px]:text-[13px] min-[980px]:font-medium"
			>
				<XIcon size={16} className="min-[980px]:hidden" />
				<span className="hidden min-[980px]:inline">Remover da sacola</span>
			</button>
		</div>
	);
}

export { CartGhostLine };
