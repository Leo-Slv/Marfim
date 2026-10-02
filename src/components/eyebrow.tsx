import { cn } from '@/lib/utils';

/** Small monospaced, tracked-out label above a heading. */
function Eyebrow({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'font-mono text-[11px] tracking-[0.18em] text-muted-foreground',
				className,
			)}
		>
			{children}
		</div>
	);
}

export { Eyebrow };
