'use client';

import { XIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { useState } from 'react';

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
	type CounterKey,
} from '../lib/admin-nav';

const iconButton =
	'relative flex size-11 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-card';

/** The screen's name for the bar: the active menu item's label. */
function currentTitle(pathname: string) {
	const item = adminNavGroups
		.flatMap((group) => group.items)
		.find((candidate) => isActiveItem(candidate, pathname));
	return item?.label ?? 'Painel';
}

/**
 * Below 980 px the admin's top bar and menu (MobileAdminTopo.dc.html): the
 * menu button (a dot when stock or the message queue need attention), the
 * screen's title, a bell with the orders to prepare and the admin's
 * initials.
 */
function AdminMobileBar({ session }: { session: Session }) {
	const pathname = usePathname();
	const counts = useAdminCounts();
	const [menuOpen, setMenuOpen] = useState(false);
	const toPrepare = counts.data?.toPrepare ?? 0;
	const attention =
		(counts.data?.stockAlerts ?? 0) + (counts.data?.failedMessages ?? 0) > 0;

	return (
		<header className="sticky top-0 z-20 flex h-[60px] items-center gap-1.5 border-b bg-background px-2 min-[980px]:hidden">
			<button
				type="button"
				onClick={() => setMenuOpen(true)}
				aria-label="Abrir menu do painel"
				aria-expanded={menuOpen}
				className={iconButton}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					aria-hidden="true"
				>
					<path d="M4 7h16M4 12h16M4 17h10" />
				</svg>
				{attention ? (
					<span
						aria-hidden="true"
						className="absolute top-[9px] right-2 size-2 rounded-full bg-warning"
					/>
				) : null}
			</button>
			<span className="flex min-w-0 grow flex-col leading-[1.15]">
				<span className="font-mono text-[9px] tracking-[0.16em] text-muted-foreground">
					MARFIM · ADMIN
				</span>
				<span className="truncate text-lg font-medium tracking-[-0.01em]">
					{currentTitle(pathname)}
				</span>
			</span>
			<Link
				href={appRoutes.admin.ordersWithStatus('a-preparar')}
				aria-label={`Pedidos a preparar${toPrepare ? `: ${toPrepare}` : ''}`}
				className={iconButton}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" />
				</svg>
				{toPrepare > 0 ? (
					<span className="absolute top-[5px] right-[3px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-[5px] font-mono text-[10px] text-primary-foreground">
						{toPrepare}
					</span>
				) : null}
			</Link>
			<span
				aria-hidden="true"
				className="mr-1 flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#E3E1F9] text-[11px] font-medium text-primary"
			>
				{adminInitials(session.email)}
			</span>
			<AdminMobileMenu
				open={menuOpen}
				onOpenChange={setMenuOpen}
				session={session}
			/>
		</header>
	);
}

function AdminMobileMenu({
	open,
	onOpenChange,
	session,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	session: Session;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const counts = useAdminCounts();
	const [signingOut, setSigningOut] = useState(false);

	async function handleSignOut() {
		setSigningOut(true);
		await signOut().catch(() => undefined);
		router.replace(appRoutes.admin.login);
	}

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-fade-in bg-foreground/35" />
				<DialogPrimitive.Content
					aria-describedby={undefined}
					className="fixed inset-y-0 left-0 z-51 flex w-[300px] max-w-[85vw] animate-slide-in-left flex-col gap-[18px] overflow-y-auto bg-background px-3.5 py-[18px] shadow-[20px_0_40px_-20px_rgba(24,24,27,.3)] outline-none"
				>
					<div className="flex items-center gap-2 px-1.5">
						<DialogPrimitive.Title asChild>
							<div className="grow">
								<AdminWordmark tone="light" />
								<span className="sr-only">Administração</span>
							</div>
						</DialogPrimitive.Title>
						<DialogPrimitive.Close
							aria-label="Fechar menu"
							className="flex size-11 items-center justify-center rounded-xl text-ink-soft hover:bg-card"
						>
							<XIcon size={20} />
						</DialogPrimitive.Close>
					</div>
					<nav aria-label="Administração" className="flex flex-col gap-[18px]">
						{adminNavGroups.map((group) => (
							<div key={group.title} className="flex flex-col gap-0.5">
								<div className="px-2.5 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
									{group.title}
								</div>
								{group.items.map((item) => {
									const active = isActiveItem(item, pathname);
									const count =
										item.counter && counts.data
											? counts.data[item.counter as CounterKey]
											: null;
									return (
										<Link
											key={item.id}
											href={item.href ?? '#'}
											onClick={() => onOpenChange(false)}
											aria-current={active ? 'page' : undefined}
											className={cn(
												'flex h-12 items-center gap-3 rounded-xl px-2.5 text-base',
												active
													? 'bg-card font-medium text-primary shadow-[0_1px_2px_rgba(24,24,27,.06)]'
													: 'text-foreground',
											)}
										>
											<svg
												width="19"
												height="19"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.6"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d={item.icon} />
											</svg>
											<span className="grow">{item.label}</span>
											{count ? (
												<span
													className={cn(
														'flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 font-mono text-[11px]',
														item.counterTone === 'alert'
															? 'bg-clay-soft text-clay'
															: 'bg-primary-soft text-primary',
													)}
													aria-label={`${count} pendentes`}
												>
													{count}
												</span>
											) : null}
										</Link>
									);
								})}
							</div>
						))}
					</nav>
					<div className="mt-auto flex items-center gap-2.5 border-t px-2 pt-3">
						<span
							aria-hidden="true"
							className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#E3E1F9] text-xs font-medium text-primary"
						>
							{adminInitials(session.email)}
						</span>
						<span className="flex min-w-0 grow flex-col">
							<span
								className="truncate text-sm font-medium"
								title={session.email}
							>
								{session.email}
							</span>
							<span className="text-xs text-muted-foreground">
								Administrador
							</span>
						</span>
						<button
							type="button"
							onClick={handleSignOut}
							disabled={signingOut}
							className="flex h-10 items-center rounded-[10px] border px-3 text-[13px] text-ink-soft disabled:opacity-55"
						>
							{signingOut ? 'Saindo…' : 'Sair'}
						</button>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export { AdminMobileBar };
