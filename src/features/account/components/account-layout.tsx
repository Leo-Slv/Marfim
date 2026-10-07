'use client';

import {
	CheckIcon,
	HandbagIcon,
	LockSimpleIcon,
	MapPinIcon,
	SignOutIcon,
	UserIcon,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import { signOut } from '@/lib/auth/session-client';
import { ErrorState } from '@/features/errors/components/error-state';
import { useRequireSession } from '@/lib/auth/use-require-session';
import type { Session } from '@/lib/auth/session-store';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { useMyOrders, useProfile } from '../hooks/account.queries';
import { splitName } from '../lib/account-format';

const menu = [
	{
		href: appRoutes.account.orders,
		label: 'Meus pedidos',
		Icon: HandbagIcon,
		counts: true,
	},
	{
		href: appRoutes.account.profile,
		label: 'Meus dados',
		Icon: UserIcon,
		counts: false,
	},
	{
		href: appRoutes.account.addresses,
		label: 'Endereços',
		Icon: MapPinIcon,
		counts: false,
	},
	{
		href: appRoutes.account.password,
		label: 'Trocar senha',
		Icon: LockSimpleIcon,
		counts: false,
	},
] as const;

/** Minha conta frame (Conta.dc.html): greeting, side menu, Sair. */
function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main className="flex grow flex-col">
				{/* The gate reads the URL (?next=), so it sits inside Suspense. */}
				<Suspense fallback={<AccountSkeleton />}>
					<AccountGate>{children}</AccountGate>
				</Suspense>
			</main>
			<StoreFooter />
		</div>
	);
}

function AccountGate({ children }: { children: React.ReactNode }) {
	const { session, expired } = useRequireSession();
	if (expired) {
		return <ErrorState kind="session-expired" />;
	}
	return session ? (
		<AccountFrame session={session}>{children}</AccountFrame>
	) : (
		<AccountSkeleton />
	);
}

function AccountFrame({
	session,
	children,
}: {
	session: Session;
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const profile = useProfile();
	const orders = useMyOrders(1, ORDERS_PAGE_SIZE);
	const [signingOut, setSigningOut] = useState(false);
	const firstName = profile.data ? splitName(profile.data.name).first : null;

	async function handleSignOut() {
		setSigningOut(true);
		await signOut().catch(() => undefined);
		router.replace(appRoutes.auth.login);
	}

	return (
		<>
			<AccountMobileHeader
				firstName={firstName}
				name={profile.data?.name ?? null}
				email={session.email}
				signingOut={signingOut}
				onSignOut={handleSignOut}
			/>
			<section className="hidden pt-9 pb-2 min-[980px]:block">
				<div className="mx-auto flex max-w-[1280px] flex-wrap items-end gap-4 px-5 sm:px-10">
					<div className="flex grow flex-col gap-2">
						<Eyebrow>MINHA CONTA</Eyebrow>
						<h1 className="animate-up text-[38px] leading-none font-light tracking-[-0.03em] sm:text-[44px]">
							Olá
							{firstName ? (
								<>
									,{' '}
									<span className="font-medium text-primary">{firstName}</span>
								</>
							) : null}
						</h1>
					</div>
					{session.emailConfirmed ? (
						<span className="flex h-8 items-center gap-2 rounded-full bg-success-soft px-3 text-[13px] text-success">
							<CheckIcon size={14} weight="bold" />
							E-mail confirmado
						</span>
					) : (
						<Link
							href={appRoutes.auth.confirmEmail}
							className="flex h-8 items-center rounded-full bg-clay-soft px-3 text-[13px] text-clay"
						>
							E-mail não confirmado
						</Link>
					)}
				</div>
			</section>
			<section className="pt-0 pb-10 min-[980px]:pt-6 min-[980px]:pb-[72px]">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-6 gap-y-3 px-4 min-[980px]:grid-cols-12 min-[980px]:gap-y-6 sm:px-10">
					<nav
						aria-label="Seções da conta"
						className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 py-2.5 min-[980px]:sticky min-[980px]:top-6 min-[980px]:col-span-3 min-[980px]:mx-0 min-[980px]:flex-col min-[980px]:gap-1 min-[980px]:overflow-visible min-[980px]:px-0 min-[980px]:py-0 [&::-webkit-scrollbar]:hidden"
					>
						{menu.map(({ href, label, Icon, counts }) => {
							const current =
								pathname === href ||
								(href === appRoutes.account.orders &&
									pathname.startsWith(`${href}/`));
							return (
								<Link
									key={href}
									href={href}
									aria-current={current ? 'page' : undefined}
									className={cn(
										// Chips below 980 px (MobileConta), the side menu above.
										'flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors hover:bg-surface-2 min-[980px]:h-12 min-[980px]:gap-3 min-[980px]:rounded-xl min-[980px]:border-0 min-[980px]:text-[15px]',
										current
											? 'border-primary bg-primary font-medium text-primary-foreground min-[980px]:bg-card min-[980px]:text-primary'
											: 'bg-card text-foreground min-[980px]:bg-transparent',
									)}
								>
									<Icon size={18} className="hidden min-[980px]:block" />
									<span className="min-[980px]:grow">{label}</span>
									{counts && orders.data ? (
										<span className="font-mono text-[11px] opacity-70 min-[980px]:text-xs min-[980px]:text-muted-foreground min-[980px]:opacity-100">
											{orders.data.totalItems}
										</span>
									) : null}
								</Link>
							);
						})}
						<button
							type="button"
							onClick={handleSignOut}
							disabled={signingOut}
							className="mt-2 hidden h-12 items-center gap-3 border-t px-3.5 text-[15px] text-muted-foreground transition-colors hover:bg-surface-2 disabled:opacity-55 min-[980px]:flex"
						>
							<SignOutIcon size={18} />
							{signingOut ? 'Saindo…' : 'Sair'}
						</button>
					</nav>
					<div
						key={pathname}
						className="flex animate-up flex-col gap-4 [animation-duration:.55s] min-[980px]:col-span-9 min-[980px]:col-start-4"
					>
						{children}
					</div>
				</div>
			</section>
		</>
	);
}

/** Below 980 px: avatar, greeting, e-mail and Sair (MobileConta.dc.html). */
function AccountMobileHeader({
	firstName,
	name,
	email,
	signingOut,
	onSignOut,
}: {
	firstName: string | null;
	name: string | null;
	email: string;
	signingOut: boolean;
	onSignOut: () => void;
}) {
	const { first, last } = splitName(name ?? '');
	const initials =
		`${first.charAt(0)}${last.charAt(0)}`.toUpperCase() ||
		email.charAt(0).toUpperCase();

	return (
		<section className="flex items-center gap-3 px-4 pt-[18px] pb-1.5 min-[980px]:hidden">
			<span
				aria-hidden="true"
				className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#E3E1F9] text-[17px] font-medium text-primary-strong"
			>
				{initials}
			</span>
			<div className="flex min-w-0 grow flex-col">
				<h1 className="animate-up text-[22px] font-light tracking-[-0.02em]">
					Olá{firstName ? `, ${firstName}` : ''}
				</h1>
				<span className="truncate text-[13px] text-muted-foreground">
					{email}
				</span>
			</div>
			<button
				type="button"
				onClick={onSignOut}
				disabled={signingOut}
				className="flex min-h-11 items-center text-sm text-ink-soft disabled:opacity-55"
			>
				{signingOut ? 'Saindo…' : 'Sair'}
			</button>
		</section>
	);
}

/** Orders per page in Meus pedidos (also the menu count's request). */
const ORDERS_PAGE_SIZE = 10;

function AccountSkeleton() {
	return (
		<section className="pt-9 pb-16" aria-busy="true" aria-label="Carregando">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-5 min-[980px]:grid-cols-12 sm:px-10">
				<div className="skeleton h-10 w-56 rounded-xl min-[980px]:col-span-12" />
				<div className="skeleton h-[220px] rounded-[20px] min-[980px]:col-span-3" />
				<div className="skeleton h-[360px] rounded-[20px] min-[980px]:col-span-9" />
			</div>
		</section>
	);
}

export { AccountLayout, ORDERS_PAGE_SIZE };
