import { ChatCircleIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

/** Eyebrow + h1 of every page; `accent` is the indigo part of the title. */
function PageHeading({
	eyebrow,
	title,
	accent,
	after = '',
	large = false,
}: {
	eyebrow: string;
	title: string;
	accent?: string;
	after?: string;
	/** The editorial pages (model A) use a bigger title. */
	large?: boolean;
}) {
	return (
		<>
			<div className="animate-up font-mono text-[10px] tracking-[0.16em] text-muted-foreground min-[980px]:text-[11px] min-[980px]:tracking-[0.18em]">
				{eyebrow}
			</div>
			<h1
				className={cn(
					'mt-3.5 max-w-[760px] animate-up text-[34px] leading-[1.06] font-light tracking-[-0.03em] [animation-delay:.06s]',
					large
						? 'min-[980px]:text-[56px] min-[980px]:leading-[1.02] min-[980px]:tracking-[-0.035em]'
						: 'min-[980px]:text-5xl min-[980px]:leading-[1.04]',
				)}
			>
				{title}
				{accent ? (
					<>
						{' '}
						<span className="font-medium text-primary">{accent}</span>
					</>
				) : null}
				{after}
			</h1>
		</>
	);
}

function Lead({ children }: { children: React.ReactNode }) {
	return (
		<p className="mt-4 max-w-[640px] animate-up text-[15px] leading-[1.6] text-ink-soft [animation-delay:.12s] min-[980px]:mt-5 min-[980px]:text-lg">
			{children}
		</p>
	);
}

/** Orange "EM BREVE" note. */
function SoonNote({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'flex max-w-[680px] items-start gap-2.5 rounded-xl bg-clay-soft px-4 py-3.5 text-sm leading-[1.55] text-foreground',
				className,
			)}
		>
			<ComingSoonBadge className="mt-0.5" />
			<span>{children}</span>
		</div>
	);
}

/** "Ainda precisa de ajuda?" at the end of every page. */
function HelpCard() {
	return (
		<div className="mt-10 flex flex-col gap-4 rounded-2xl bg-surface-2 p-4 min-[980px]:mt-12 min-[980px]:flex-row min-[980px]:flex-wrap min-[980px]:items-center min-[980px]:gap-5 min-[980px]:rounded-[20px] min-[980px]:border min-[980px]:bg-card min-[980px]:px-7 min-[980px]:py-6">
			<span className="hidden size-12 items-center justify-center rounded-[14px] bg-primary-soft text-primary min-[980px]:flex">
				<ChatCircleIcon size={22} />
			</span>
			<div className="flex grow flex-col gap-1">
				<b className="text-[17px] font-medium">Ainda precisa de ajuda?</b>
				<span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					Atendimento por WhatsApp e e-mail
					<ComingSoonBadge />
				</span>
			</div>
			<Link
				href={appRoutes.account.orders}
				className="flex h-12 items-center justify-center rounded-xl border bg-card px-[18px] text-[15px] font-medium text-foreground transition-colors hover:bg-surface-2 min-[980px]:h-11 min-[980px]:text-sm"
			>
				Ver meus pedidos
			</Link>
		</div>
	);
}

export { HelpCard, Lead, PageHeading, SoonNote };
