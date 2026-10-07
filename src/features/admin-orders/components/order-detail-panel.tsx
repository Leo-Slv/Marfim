'use client';

import { ArrowLeftIcon, WarningIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { BottomSheet } from '@/components/bottom-sheet';
import { notify } from '@/features/account/components/account-toast';
import { formatTimelineMoment } from '@/features/account/lib/account-format';
import {
	orderStatusClass,
	orderStatusLabel,
} from '@/features/account/lib/order-status';
import { ProductArt } from '@/features/catalog/components/product-art';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { slugify } from '@/features/catalog/lib/slugify';
import { maskPostalCode } from '@/features/checkout/lib/format-address';
import { QueryErrorState } from '@/features/errors/components/query-error-state';
import { useSession } from '@/lib/auth/use-session';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { cn } from '@/lib/utils';

import {
	useAdminOrder,
	useOrderActions,
	useOrderTimeline,
} from '../hooks/admin-orders.queries';
import {
	actionErrorCopy,
	canCancel,
	cancelToast,
	nextAction,
	paymentSummary,
	statusNote,
} from '../lib/order-actions';
import { formatOrderMoment } from '../lib/order-format';
import { timelineItems } from '../lib/order-timeline-labels';
import type { AdminOrderDetails } from '../schemas/admin-orders.schema';
import { InternalNotes } from './internal-notes';
import { ShipFormCard } from './ship-form';

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
			{children}
		</span>
	);
}

/** The order's detail (AdminPedidos.dc.html, right panel). */
function OrderDetailPanel({
	orderId,
	onClose,
}: {
	orderId: string;
	onClose: () => void;
}) {
	const details = useAdminOrder(orderId);

	return (
		<aside className="flex w-full shrink-0 animate-slide-in flex-col gap-[18px] bg-card px-4 py-4 min-[980px]:border-l min-[980px]:px-6 min-[980px]:py-7 min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:h-screen min-[1280px]:w-[420px] min-[1280px]:overflow-y-auto">
			<button
				type="button"
				onClick={onClose}
				className="flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-strong min-[1280px]:hidden"
			>
				<ArrowLeftIcon size={14} />
				Pedidos
			</button>
			{details.isPending ? (
				<div className="flex flex-col gap-4">
					<div className="skeleton h-8 w-2/3 rounded-lg" />
					<div className="skeleton h-32 rounded-2xl" />
					<div className="skeleton h-40 rounded-2xl" />
				</div>
			) : details.isError ? (
				<QueryErrorState
					key={details.errorUpdatedAt}
					error={details.error}
					onRetry={() => void details.refetch()}
				/>
			) : (
				<OrderDetail details={details.data} />
			)}
		</aside>
	);
}

function OrderDetail({ details }: { details: AdminOrderDetails }) {
	const { order, payment, customer } = details;
	const session = useSession();
	const timeline = useOrderTimeline(order.id);
	const actions = useOrderActions(order.id);
	const [asking, setAsking] = useState(false);
	// Below 980 px the cancel confirm is a bottom sheet (MobileAdminPedidos).
	const mobile = useMediaQuery('(max-width: 979px)') === true;
	const [error, setError] = useState<string | null>(null);
	const action = nextAction(order.status);
	const busy =
		actions.start.isPending ||
		actions.ship.isPending ||
		actions.deliver.isPending ||
		actions.cancel.isPending;

	const onError = (failure: unknown) => setError(actionErrorCopy(failure));
	function run(mutate: () => void) {
		setError(null);
		mutate();
	}

	const address = order.shippingAddress;
	const shipment = order.shipment;

	return (
		<>
			<div className="flex items-center gap-2.5">
				<h2 className="grow font-mono text-xl font-medium">
					{order.orderNumber}
				</h2>
				<span
					key={order.status}
					className={cn(
						'inline-flex h-7 animate-pop-in items-center rounded-full px-3 text-[13px] font-medium',
						orderStatusClass(order.status),
					)}
				>
					{orderStatusLabel(order.status)}
				</span>
			</div>
			<p className="-mt-2 text-[13px] text-muted-foreground">
				{customer?.name ?? 'Cliente'} · {formatOrderMoment(order.createdAt)} ·{' '}
				{paymentSummary(payment)}
			</p>
			{payment?.authorizationExpiringSoon && payment.authorizationExpiresAt ? (
				<p className="flex items-start gap-2 rounded-xl bg-clay-soft px-3 py-2.5 text-[13px]">
					<WarningIcon size={16} className="mt-px shrink-0 text-clay" />
					<span>
						A autorização do cartão vence em{' '}
						{formatTimelineMoment(payment.authorizationExpiresAt)}. Envie antes
						para conseguir capturar o pagamento.
					</span>
				</p>
			) : null}

			<div className="flex flex-col gap-3 rounded-[14px] bg-background p-4">
				<SectionLabel>PRÓXIMA AÇÃO</SectionLabel>
				{action === 'start' ? (
					<>
						<button
							type="button"
							disabled={busy}
							onClick={() =>
								run(() =>
									actions.start.mutate(undefined, {
										onSuccess: () => notify('Preparo iniciado'),
										onError,
									}),
								)
							}
							className="h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55"
						>
							{actions.start.isPending ? 'Iniciando…' : 'Iniciar preparo'}
						</button>
						<span className="text-xs text-muted-foreground">
							Depois disso o cliente não consegue mais cancelar sozinho.
						</span>
					</>
				) : action === 'ship' ? (
					<ShipFormCard
						pending={actions.ship.isPending}
						onShip={(values) =>
							run(() =>
								actions.ship.mutate(
									{
										carrier: values.carrier,
										trackingCode: values.trackingCode,
										trackingUrl: values.trackingUrl || null,
									},
									{
										onSuccess: () =>
											notify(
												'Marcado como enviado. O cliente recebe o e-mail.',
											),
										onError,
									},
								),
							)
						}
					/>
				) : action === 'deliver' ? (
					<>
						<div className="text-[13px] text-ink-soft">
							{[shipment?.carrier, shipment?.trackingCode]
								.filter(Boolean)
								.join(' · ') || 'Enviado sem dados de rastreio'}
							{shipment?.trackingUrl ? (
								<>
									{' · '}
									<a
										href={shipment.trackingUrl}
										target="_blank"
										rel="noreferrer"
										className="font-medium"
									>
										Rastrear
									</a>
								</>
							) : null}
						</div>
						<button
							type="button"
							disabled={busy}
							onClick={() =>
								run(() =>
									actions.deliver.mutate(undefined, {
										onSuccess: () => notify('Pedido entregue'),
										onError,
									}),
								)
							}
							className="h-11 rounded-xl bg-success text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-55"
						>
							{actions.deliver.isPending
								? 'Registrando…'
								: 'Marcar como entregue'}
						</button>
					</>
				) : (
					<span className="text-sm text-ink-soft">
						{statusNote(order.status, payment?.status ?? null)}
					</span>
				)}

				{canCancel(order.status) ? (
					asking && !mobile ? (
						<div className="flex animate-pop-in flex-col gap-2 rounded-[10px] bg-clay-soft p-3 text-[13px]">
							Cancelar e estornar o pagamento? O estoque reservado é liberado.
							<div className="flex gap-2">
								<button
									type="button"
									disabled={busy}
									onClick={() =>
										run(() =>
											actions.cancel.mutate(undefined, {
												onSuccess: (result) => {
													setAsking(false);
													notify(cancelToast(result.paymentSettlement));
												},
												onError,
											}),
										)
									}
									className="h-9 rounded-[9px] bg-clay px-3 text-[13px] font-medium text-white disabled:opacity-55"
								>
									{actions.cancel.isPending ? 'Cancelando…' : 'Cancelar pedido'}
								</button>
								<button
									type="button"
									onClick={() => setAsking(false)}
									className="h-9 rounded-[9px] border bg-card px-3 text-[13px]"
								>
									Voltar
								</button>
							</div>
						</div>
					) : (
						<button
							type="button"
							onClick={() => setAsking(true)}
							className="min-h-8 self-start text-[13px] font-medium text-clay hover:underline"
						>
							Cancelar pedido
						</button>
					)
				) : null}

				{error ? (
					<p role="alert" className="text-[13px] text-clay">
						{error}
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-2.5">
				<SectionLabel>ITENS</SectionLabel>
				{order.items.map((item) => {
					const visual = getProductVisual(slugify(item.productName));
					return (
						<div
							key={item.productId}
							className="flex items-center gap-2.5 text-sm"
						>
							<span
								className="flex size-9 shrink-0 items-center justify-center rounded-[9px]"
								style={{ background: visual.tint }}
							>
								<ProductArt kind={visual.kind} size={22} />
							</span>
							<span className="min-w-0 grow">
								{item.quantity}× {item.productName}
							</span>
							<span className="font-mono text-[13px]">
								{formatCurrencyBrlCents(item.total)}
							</span>
						</div>
					);
				})}
				<div className="flex justify-between border-t pt-2 text-sm font-medium">
					<span>Total</span>
					<span className="font-mono">
						{formatCurrencyBrlCents(order.totalAmount)}
					</span>
				</div>
			</div>

			{address ? (
				<div className="flex flex-col gap-1.5">
					<SectionLabel>ENTREGA</SectionLabel>
					<p className="text-[13px] leading-normal text-ink-soft">
						{address.street}, {address.number}
						{address.complement ? ` · ${address.complement}` : ''}
						<br />
						{address.neighborhood} · {address.city}/{address.state} · CEP{' '}
						{maskPostalCode(address.postalCode)}
					</p>
				</div>
			) : null}

			<div className="flex flex-col gap-2">
				<SectionLabel>LINHA DO TEMPO</SectionLabel>
				{timeline.isPending ? (
					<div className="skeleton h-24 rounded-lg" />
				) : timeline.isError ? (
					<button
						type="button"
						onClick={() => void timeline.refetch()}
						className="self-start text-[13px] font-medium text-primary"
					>
						Não carregou · Tentar de novo
					</button>
				) : (
					timelineItems(timeline.data, shipment?.carrier ?? null).map(
						(item, index, items) => (
							<div
								key={item.key}
								className="flex animate-up gap-2.5 text-[13px]"
							>
								<span
									className={cn(
										'mt-[5px] size-2 shrink-0 rounded-full',
										index === items.length - 1
											? 'bg-primary'
											: item.tone === 'alert'
												? 'bg-clay'
												: item.tone === 'success'
													? 'bg-success'
													: 'bg-[#C9C7C0]',
									)}
								/>
								<span className="grow">{item.label}</span>
								<span className="shrink-0 font-mono text-[11px] text-muted-foreground">
									{formatTimelineMoment(item.at)}
								</span>
							</div>
						),
					)
				)}
			</div>

			<InternalNotes
				notes={details.internalNotes}
				author={session?.email ?? 'admin'}
				pending={actions.addNote.isPending}
				onAdd={(note, callbacks) =>
					actions.addNote.mutate(
						{ note, author: session?.email ?? 'admin' },
						callbacks,
					)
				}
			/>
			<BottomSheet
				open={asking && mobile}
				onOpenChange={setAsking}
				title={`Cancelar ${order.orderNumber}?`}
				description="Os itens voltam ao estoque e o pagamento é estornado. O cliente recebe um e-mail."
			>
				<button
					type="button"
					disabled={busy}
					onClick={() =>
						run(() =>
							actions.cancel.mutate(undefined, {
								onSuccess: (result) => {
									setAsking(false);
									notify(cancelToast(result.paymentSettlement));
								},
								onError,
							}),
						)
					}
					className="h-[50px] rounded-xl bg-clay text-[15px] font-medium text-white disabled:opacity-55"
				>
					{actions.cancel.isPending ? 'Cancelando…' : 'Sim, cancelar'}
				</button>
				<button
					type="button"
					onClick={() => setAsking(false)}
					className="h-12 rounded-xl border bg-card text-[15px] font-medium"
				>
					Manter pedido
				</button>
			</BottomSheet>
		</>
	);
}

export { OrderDetailPanel };
