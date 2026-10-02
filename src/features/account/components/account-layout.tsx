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
	const session = useRequireSession();
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
			<section className="pt-9 pb-2">
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
			<section className="pt-6 pb-[72px]">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-6 gap-y-6 px-5 min-[980px]:grid-cols-12 sm:px-10">
					<nav
						aria-label="Seções da conta"
						className="flex flex-col gap-1 min-[980px]:sticky min-[980px]:top-6 min-[980px]:col-span-3"
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
										'flex h-12 items-center gap-3 rounded-xl px-3.5 text-[15px] transition-colors hover:bg-surface-2',
										current
											? 'bg-card font-medium text-primary'
											: 'text-foreground',
									)}
								>
									<Icon size={18} />
									<span className="grow">{label}</span>
									{counts && orders.data ? (
										<span className="font-mono text-xs text-muted-foreground">
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
							className="mt-2 flex h-12 items-center gap-3 border-t px-3.5 text-[15px] text-muted-foreground transition-colors hover:bg-surface-2 disabled:opacity-55"
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
