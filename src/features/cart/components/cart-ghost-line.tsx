import { ProhibitIcon } from '@phosphor-icons/react';

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
		<div className="flex animate-up flex-wrap items-center gap-5 border-t py-5 first:border-t-0 sm:flex-nowrap">
			<div className="flex size-28 shrink-0 items-center justify-center rounded-xl bg-surface opacity-45">
				<ProhibitIcon
					size={40}
					weight="light"
					className="text-muted-foreground"
				/>
			</div>
			<div className="flex grow basis-48 flex-col gap-1.5">
				<div className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
					{copy.code}
				</div>
				<div className="text-lg font-medium text-muted-foreground line-through">
					{line.name}
				</div>
				<div className="text-[13px] text-ink-soft">{copy.text}</div>
			</div>
			<button
				type="button"
				onClick={onRemove}
				className="h-10 rounded-[10px] border bg-card px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-2"
			>
				Remover da sacola
			</button>
		</div>
	);
}

export { CartGhostLine };
