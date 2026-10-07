import { TruckIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import { appRoutes } from '@/lib/routes/app-routes';

import { PageHeading } from '../content-ui';

/**
 * 35 · Rastrear pedido. OrderCore has no lookup by order number + e-mail
 * (content pendency #1), so tracking without signing in is EM BREVE.
 */
function TrackingPage() {
	return (
		<>
			<PageHeading
				eyebrow="RASTREAR PEDIDO"
				title="Onde está meu"
				accent="pedido?"
			/>
			<div className="mt-5 grid animate-up grid-cols-1 gap-4 [animation-delay:.12s] min-[980px]:mt-7 min-[980px]:grid-cols-2">
				<div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 min-[980px]:rounded-[20px] min-[980px]:p-7">
					<span className="hidden size-12 items-center justify-center rounded-[14px] bg-primary-soft text-primary min-[980px]:flex">
						<TruckIcon size={22} />
					</span>
					<b className="text-[17px] font-medium min-[980px]:text-xl">
						Entre na sua conta
					</b>
					<span className="text-sm leading-normal text-ink-soft min-[980px]:text-[15px]">
						Em Meus pedidos você vê a linha do tempo, a transportadora e o
						código de rastreio, atualizados a cada etapa.
					</span>
					<div className="flex flex-col gap-2.5 pt-1.5 min-[980px]:flex-row">
						<Link
							href={appRoutes.auth.loginThen(appRoutes.account.orders)}
							className="flex h-12 items-center justify-center rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary-strong"
						>
							Entrar
						</Link>
						<Link
							href={appRoutes.account.orders}
							className="flex h-12 items-center justify-center rounded-xl border bg-card px-[18px] text-[15px] font-medium text-foreground transition-colors hover:bg-surface-2"
						>
							Já entrei: Meus pedidos
						</Link>
					</div>
				</div>
				<div className="flex flex-col gap-3 rounded-2xl border border-dashed p-4 opacity-80 min-[980px]:rounded-[20px] min-[980px]:bg-card min-[980px]:p-7 min-[980px]:opacity-70">
					<div className="flex items-center gap-2.5">
						<b className="grow text-base font-medium min-[980px]:text-xl">
							Rastrear sem login
						</b>
						<ComingSoonBadge />
					</div>
					<label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
						Número do pedido
						<input
							disabled
							placeholder="ORD-2026-000000"
							className="h-12 rounded-xl border bg-card px-3 font-mono text-sm min-[980px]:h-11"
						/>
					</label>
					<label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
						E-mail da compra
						<input
							type="email"
							disabled
							placeholder="voce@email.com"
							className="h-12 rounded-xl border bg-card px-3 text-sm min-[980px]:h-11"
						/>
					</label>
				</div>
			</div>
		</>
	);
}

export { TrackingPage };
