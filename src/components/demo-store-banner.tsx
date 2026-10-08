'use client';

import { XIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import {
	dismissDemoBanner,
	isDemoBannerDismissed,
	subscribeDemoBanner,
} from '@/lib/demo/demo-banner-store';
import { env } from '@/lib/env';
import { appRoutes } from '@/lib/routes/app-routes';

/**
 * Band above the storefront header: Marfim is a demonstration store with
 * Stripe in test mode. Closable for the session; off with
 * NEXT_PUBLIC_DEMO_STORE=false.
 */
function DemoStoreBanner() {
	// Server and hydration render count as closed so nothing flashes.
	const dismissed = useSyncExternalStore(
		subscribeDemoBanner,
		isDemoBannerDismissed,
		() => true,
	);

	if (!env.demoStore || dismissed) {
		return null;
	}

	return (
		<div
			role="note"
			className="flex items-center gap-2 border-b bg-surface px-4 py-2 text-xs text-ink-soft min-[980px]:justify-center min-[980px]:px-10 min-[980px]:text-[13px]"
		>
			<span className="grow min-[980px]:grow-0">
				<b className="font-medium text-foreground">Loja de demonstração.</b> Os
				pagamentos usam o modo de teste do Stripe e nada é cobrado.{' '}
				<Link
					href={appRoutes.content.page('perguntas-frequentes')}
					className="font-medium text-primary hover:text-primary-strong"
				>
					Saiba mais
				</Link>
			</span>
			<button
				type="button"
				onClick={dismissDemoBanner}
				aria-label="Fechar aviso"
				className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2"
			>
				<XIcon size={14} />
			</button>
		</div>
	);
}

export { DemoStoreBanner };
