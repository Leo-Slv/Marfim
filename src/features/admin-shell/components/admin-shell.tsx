'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { AdminWordmark } from '@/features/admin-auth/components/admin-brand';
import { signOut } from '@/lib/auth/session-client';
import type { Session } from '@/lib/auth/session-store';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { useAdminCounts } from '../hooks/admin-shell.queries';
import {
	adminInitials,
	adminNavGroups,
	isActiveItem,
	type AdminNavItem,
	type CounterKey,
} from '../lib/admin-nav';

/**
 * The admin frame (AdminNav.dc.html): side menu with live counters, the
 * signed-in admin and Sair; a top bar on narrow screens.
 */
function AdminShell({
	session,
	children,
}: {
	session: Session;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col bg-background min-[980px]:flex-row">
			<aside className="flex flex-col gap-4 border-b px-4 pt-4 pb-3 min-[980px]:sticky min-[980px]:top-0 min-[980px]:h-screen min-[980px]:w-[248px] min-[980px]:shrink-0 min-[980px]:gap-6 min-[980px]:border-r min-[980px]:border-b-0 min-[980px]:py-6">
				<div className="flex items-center gap-2 px-2">
					<Link href={appRoutes.admin.index} className="text-foreground">
						<AdminWordmark tone="light" />
					</Link>
					<div className="grow" />
					<div className="min-[980px]:hidden">
						<SignOutButton />
					</div>
				</div>
				<AdminNav />
				<AdminProfile email={session.email} />
			</aside>
			<main className="flex min-w-0 grow flex-col">{children}</main>
		</div>
	);
}

function AdminNav() {
	const pathname = usePathname();
	const counts = useAdminCounts();

	return (
		<nav
			aria-label="Administração"
			className="-mx-4 flex gap-1 overflow-x-auto px-4 min-[980px]:mx-0 min-[980px]:flex-col min-[980px]:gap-[18px] min-[980px]:overflow-visible min-[980px]:px-0"
		>
			{adminNavGroups.map((group) => (
				<div
					key={group.title}
					className="flex shrink-0 gap-1 min-[980px]:flex-col min-[980px]:gap-0.5"
				>
					<div className="hidden px-2.5 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground min-[980px]:block">
						{group.title}
					</div>
					{group.items.map((item) => (
						<NavItem
							key={item.id}
							item={item}
							active={isActiveItem(item, pathname)}
							count={
								item.counter && counts.data
									? counts.data[item.counter as CounterKey]
									: null
							}
						/>
					))}
				</div>
			))}
		</nav>
	);
}

function NavItem({
	item,
	active,
	count,
}: {
	item: AdminNavItem;
	active: boolean;
	count: number | null;
}) {
	const content = (
		<>
			<svg
				width="17"
				height="17"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
				className="shrink-0"
			>
				<path d={item.icon} />
			</svg>
			<span className="min-w-0 grow truncate">{item.label}</span>
			{item.href ? null : <ComingSoonBadge className="shrink-0" />}
			{count ? (
				<span
					className={cn(
						'flex h-5 min-w-[22px] shrink-0 items-center justify-center rounded-full px-1.5 font-mono text-[11px]',
						item.counterTone === 'alert'
							? 'bg-clay-soft text-clay'
							: 'bg-primary-soft text-primary',
					)}
					aria-label={`${count} pendentes`}
				>
					{count}
				</span>
			) : null}
		</>
	);
	const base =
		'flex h-10 shrink-0 items-center gap-2.5 rounded-[10px] px-2.5 text-sm whitespace-nowrap';

	if (!item.href) {
		return (
			<span
				aria-disabled="true"
				title="Em breve"
				className={cn(base, 'cursor-not-allowed text-muted-foreground')}
			>
				{content}
			</span>
		);
	}
	return (
		<Link
			href={item.href}
			aria-current={active ? 'page' : undefined}
			className={cn(
				base,
				'transition-colors',
				active
					? 'bg-card font-medium text-primary shadow-[0_1px_2px_rgba(24,24,27,.06)]'
					: 'text-foreground hover:bg-card/60',
			)}
		>
			{content}
		</Link>
	);
}

function AdminProfile({ email }: { email: string }) {
	return (
		<div className="mt-auto hidden items-center gap-2.5 border-t px-2.5 pt-3 min-[980px]:flex">
			<span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#E3E1F9] text-[13px] font-medium text-primary">
				{adminInitials(email)}
			</span>
			<span className="flex min-w-0 grow flex-col">
				<span className="truncate text-sm font-medium" title={email}>
					{email}
				</span>
				<span className="text-xs text-muted-foreground">Administrador</span>
			</span>
			<SignOutButton />
		</div>
	);
}

function SignOutButton() {
	const router = useRouter();
	const [signingOut, setSigningOut] = useState(false);

	async function handleSignOut() {
		setSigningOut(true);
		await signOut().catch(() => undefined);
		router.replace(appRoutes.admin.login);
	}

	return (
		<button
			type="button"
			onClick={handleSignOut}
			disabled={signingOut}
			aria-label="Sair do painel"
			title="Sair do painel"
			className="flex size-9 shrink-0 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-55"
		>
			<svg
				width="17"
				height="17"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3" />
			</svg>
		</button>
	);
}

export { AdminShell };
