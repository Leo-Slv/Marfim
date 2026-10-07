import { cn } from '@/lib/utils';

/**
 * The screen's main action fixed at the bottom below 980 px (MobileProduto,
 * MobileSacola, MobileCheckout), plus a spacer so the page scrolls past it.
 */
function MobileActionBar({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<>
			<div aria-hidden="true" className="h-[92px] min-[980px]:hidden" />
			<div
				className={cn(
					'fixed inset-x-0 bottom-0 z-30 flex flex-col gap-1.5 border-t bg-card px-4 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom))] min-[980px]:hidden',
					className,
				)}
			>
				{children}
			</div>
		</>
	);
}

/** "Label ……… R$ 0,00" — the bar's primary button content. */
function ActionBarLabel({
	label,
	amount,
}: {
	label: React.ReactNode;
	amount?: string | null;
}) {
	return (
		<>
			<span className="flex items-center gap-2">{label}</span>
			{amount ? <span className="font-mono text-[15px]">{amount}</span> : null}
		</>
	);
}

/** Classes of the bar's primary action (link or button). */
const actionBarPrimary =
	'flex h-[52px] w-full items-center justify-between rounded-xl bg-primary px-[18px] text-base font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55';

export { ActionBarLabel, actionBarPrimary, MobileActionBar };
