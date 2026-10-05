import Link from 'next/link';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { cn } from '@/lib/utils';

/** White panel of the admin screens. */
function Panel({
	className,
	children,
	style,
}: {
	className?: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<section
			className={cn(
				'flex animate-up flex-col rounded-2xl border bg-card [animation-duration:.55s]',
				className,
			)}
			style={style}
		>
			{children}
		</section>
	);
}

function PanelTitle({ children }: { children: React.ReactNode }) {
	return <h2 className="grow text-base font-medium">{children}</h2>;
}

/** Inline failure of one block, with its own retry. */
function PanelError({ onRetry }: { onRetry: () => void }) {
	return (
		<div
			role="alert"
			className="flex grow flex-col items-start justify-center gap-2 py-6 text-sm text-ink-soft"
		>
			Não foi possível carregar agora.
			<button
				type="button"
				onClick={onRetry}
				className="font-medium text-primary hover:text-primary-strong"
			>
				Tentar de novo
			</button>
		</div>
	);
}

function Skeleton({ className }: { className?: string }) {
	return <div className={cn('skeleton rounded-lg', className)} />;
}

/** A link to an admin screen that isn't built yet: muted + EM BREVE. */
function SoonLink({ children }: { children: React.ReactNode }) {
	return (
		<span
			aria-disabled="true"
			title="Em breve"
			className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground"
		>
			{children}
			<ComingSoonBadge />
		</span>
	);
}

/** A link from a dashboard block to its admin screen. */
function PanelLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="text-[13px] font-medium text-primary hover:text-primary-strong"
		>
			{children}
		</Link>
	);
}

export { Panel, PanelError, PanelLink, PanelTitle, Skeleton, SoonLink };
