import { cn } from '@/lib/utils';

/** Dashed "EM BREVE" pill the mockups put on features not available yet. */
function ComingSoonBadge({
	tone = 'light',
	className,
}: {
	tone?: 'light' | 'dark';
	className?: string;
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full border border-dashed px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] whitespace-nowrap',
				tone === 'light'
					? 'border-clay text-clay'
					: 'border-[#F0A070] text-[#F0A070]',
				className,
			)}
		>
			EM BREVE
		</span>
	);
}

export { ComingSoonBadge };
