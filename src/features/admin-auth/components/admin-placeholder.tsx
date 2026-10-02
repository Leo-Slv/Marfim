'use client';

import { SignOutIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { Eyebrow } from '@/components/eyebrow';
import { signOut } from '@/lib/auth/session-client';
import type { Session } from '@/lib/auth/session-store';
import { appRoutes } from '@/lib/routes/app-routes';

import { AdminWordmark } from './admin-brand';

/**
 * `/admin` until the AdminDashboard screen exists
 * (Docs/specs/admin/admin-login.md): proves the gate and lets the admin
 * sign out.
 */
function AdminPlaceholder({ session }: { session: Session }) {
	const router = useRouter();
	const [signingOut, setSigningOut] = useState(false);

	async function handleSignOut() {
		setSigningOut(true);
		await signOut().catch(() => undefined);
		router.replace(appRoutes.admin.login);
	}

	return (
		<div className="flex min-h-screen min-w-[360px] flex-col bg-background">
			<header className="border-b">
				<div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-4 px-5 sm:px-10">
					<AdminWordmark tone="light" />
					<div className="grow" />
					<span className="hidden text-sm text-muted-foreground sm:inline">
						{session.email}
					</span>
					<button
						type="button"
						onClick={handleSignOut}
						disabled={signingOut}
						className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3.5 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-55"
					>
						<SignOutIcon size={16} />
						Sair
					</button>
				</div>
			</header>
			<main className="mx-auto flex w-full max-w-[1280px] grow flex-col items-start gap-4 px-5 py-16 sm:px-10">
				<div className="flex animate-up items-center gap-2.5">
					<Eyebrow>DASHBOARD</Eyebrow>
					<ComingSoonBadge />
				</div>
				<h1 className="animate-up text-4xl font-light tracking-[-0.03em] [animation-delay:.08s]">
					O painel está chegando
				</h1>
				<p className="max-w-[520px] animate-up text-[15px] leading-[1.6] text-ink-soft [animation-delay:.16s]">
					Você entrou como administrador. Pedidos, produtos, estoque e
					pagamentos vão aparecer aqui nas próximas telas.
				</p>
				<Link
					href={appRoutes.system.home}
					className="animate-up text-sm font-medium text-primary [animation-delay:.24s] hover:text-primary-strong"
				>
					Ir para a loja
				</Link>
			</main>
		</div>
	);
}

export { AdminPlaceholder };
