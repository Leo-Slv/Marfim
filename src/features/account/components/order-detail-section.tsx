'use client';

import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { ProductArt } from '@/features/catalog/components/product-art';
import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { slugify } from '@/features/catalog/lib/slugify';
import { maskPostalCode } from '@/features/checkout/lib/format-address';
import { isApiError } from '@/lib/http/api-error';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import {
	useAccountOrder,
	useCancelOrder,
	useOrderHistory,
} from '../hooks/account.queries';
import { formatOrderDate, formatTimelineMoment } from '../lib/account-format';
import {
	canCancelOrder,
	isActiveOrder,
	isInFulfilment,
	orderStatusClass,
	orderStatusLabel,
} from '../lib/order-status';
import { buildTimeline, type TimelineStep } from '../lib/order-timeline';
import { notify } from './account-toast';

/** 23 · Detalhe do pedido. */
function OrderDetailSection({ orderId }: { orderId: string }) {
	const order = useAccountOrder(orderId);
	const live = order.data ? isActiveOrder(order.data.status) : false;
	const history = useOrderHistory(orderId, live);
	const cancel = useCancelOrder(orderId);
	const [confirming, setConfirming] = useState(false);

	const back = (
		<Link
			href={appRoutes.account.orders}
			className="flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-strong"
		>
			<ArrowLeftIcon size={14} />
			Meus pedidos
		</Link>
	);

	if (order.isPending) {
		return (
			<>
				{back}
				<div className="skeleton h-[380px] rounded-[20px]" />
			</>
		);
	}
	if (order.isError) {
		return (
			<>
				{back}
				<p role="alert" className="rounded-2xl bg-clay-soft px-5 py-4 text-sm">
					Não encontramos este pedido na sua conta.
				</p>
			</>
		);
	}

	const data = order.data;
	const units = data.items.reduce((sum, item) => sum + item.quantity, 0);
	const timeline = buildTimeline(
		history.data ?? [],
		data.status,
		data.createdAt,
	);
	const shipped = data.status === 'Shipped' || data.status === 'Delivered';
	const address = data.shippingAddress;

	function handleCancel() {
		cancel.mutate(undefined, {
			onSuccess: () => {
				setConfirming(false);
				notify('Pedido cancelado');
			},
		});
	}

	return (
		<>
			{back}
			<div className="flex flex-wrap items-center gap-3.5">
				<h2 className="font-mono text-[26px] font-medium">
					{data.orderNumber}
				</h2>
				<span
					key={data.status}
					className={cn(
						'inline-flex h-[30px] animate-pop-in items-center rounded-full px-3 text-[13px] font-medium',
						orderStatusClass(data.status),
					)}
				>
					{orderStatusLabel(data.status)}
				</span>
				<span className="grow" />
				{live ? (
					<span className="flex items-center gap-2 text-[13px] text-success">
						<span className="size-[7px] animate-pulse-dot rounded-full bg-success" />
						Ao vivo
					</span>
				) : null}
			</div>
			<div className="text-sm text-muted-foreground">
				Feito em {formatOrderDate(data.createdAt)} · {units}{' '}
				{units === 1 ? 'peça' : 'peças'}
			</div>

			<div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1 rounded-[20px] border bg-card p-6">
					<span className="pb-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
						LINHA DO TEMPO
					</span>
					{history.isPending ? (
						<div
							aria-busy="true"
							aria-label="Carregando a linha do tempo"
							className="flex flex-col gap-4"
						>
							{[0, 1, 2].map((index) => (
								<div key={index} className="skeleton h-10 rounded-lg" />
							))}
						</div>
					) : (
						<ol>
							{timeline.map((step, index) => (
								<TimelineItem
									key={`${step.label}-${index}`}
									step={step}
									isLast={index === timeline.length - 1}
									nextAhead={timeline[index + 1]?.state === 'ahead'}
								/>
							))}
						</ol>
					)}
				</div>

				<div className="flex flex-col gap-4">
					{shipped ? (
						<div className="flex flex-col gap-2.5 rounded-[20px] bg-primary px-6 py-[22px] text-primary-foreground">
							<span className="font-mono text-[11px] tracking-[0.12em] text-primary-soft">
								ENVIO
							</span>
							<div className="flex flex-wrap justify-between gap-3 text-sm">
								<span>{data.shipment?.carrier ?? 'Transportadora'}</span>
								<span className="font-mono">
									{data.shipment?.trackingCode ?? 'Código de rastreio em breve'}
								</span>
							</div>
							{data.shipment?.trackingUrl ? (
								<a
									href={data.shipment.trackingUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex h-10 items-center gap-2 self-start rounded-[10px] bg-white px-4 text-sm font-medium text-primary-strong"
								>
									Rastrear na transportadora
									<ArrowUpRightIcon size={14} />
								</a>
							) : null}
						</div>
					) : null}

					<div className="flex flex-col gap-3 rounded-[20px] border bg-card px-6 py-[22px]">
						<span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
							ITENS
						</span>
						{data.items.map((item) => {
							const visual = getProductVisual(slugify(item.productName));
							return (
								<div key={item.productId} className="flex items-center gap-3">
									<span
										className="flex size-11 shrink-0 items-center justify-center rounded-[10px]"
										style={{ background: visual.tint }}
									>
										<ProductArt kind={visual.kind} size={26} />
									</span>
									<span className="grow text-sm">
										{item.quantity}× {item.productName}
									</span>
									<span className="font-mono text-[13px]">
										{formatCurrencyBrl(item.total)}
									</span>
								</div>
							);
						})}
						<div className="flex justify-between border-t pt-3 text-[15px] font-medium">
							<span>Total</span>
							<span className="font-mono">
								{formatCurrencyBrl(data.totalAmount)}
							</span>
						</div>
						<div className="text-[13px] leading-normal text-muted-foreground">
							{address ? (
								<>
									Entrega: {address.street}, {address.number} · {address.city},{' '}
									{address.state} · {maskPostalCode(address.postalCode)}
									<br />
								</>
							) : null}
							{/* No brand/last4 in OrderCore (account pendency #5). */}
							Pagamento: cartão de crédito
						</div>
					</div>

					{canCancelOrder(data.status) ? (
						confirming ? (
							<div
								role="alertdialog"
								aria-label="Confirmar cancelamento"
								className="flex animate-pop-in flex-col gap-2.5 rounded-2xl bg-clay-soft p-4 text-sm"
							>
								<b className="font-medium">
									Cancelar o pedido {data.orderNumber}?
								</b>
								<span className="text-ink-soft">
									O valor é estornado no cartão e as peças voltam ao estoque.
								</span>
								{cancel.isError ? (
									<span role="alert" className="text-clay">
										{cancelErrorText(cancel.error)}
									</span>
								) : null}
								<div className="flex gap-2">
									<button
										type="button"
										onClick={handleCancel}
										disabled={cancel.isPending}
										className="h-10 rounded-[10px] bg-clay px-4 text-sm font-medium text-white disabled:opacity-55"
									>
										{cancel.isPending ? 'Cancelando…' : 'Sim, cancelar'}
									</button>
									<button
										type="button"
										onClick={() => setConfirming(false)}
										className="h-10 rounded-[10px] border bg-card px-3.5 text-sm"
									>
										Manter pedido
									</button>
								</div>
							</div>
						) : (
							<>
								<button
									type="button"
									onClick={() => setConfirming(true)}
									className="h-11 rounded-xl border bg-card text-sm font-medium text-clay transition-colors hover:bg-surface-2"
								>
									Cancelar pedido
								</button>
								<span className="text-center text-xs text-muted-foreground">
									Dá para cancelar até o ateliê começar o preparo.
								</span>
							</>
						)
					) : isInFulfilment(data.status) ? (
						<div className="rounded-[14px] bg-surface px-4 py-3.5 text-[13px] leading-normal text-ink-soft">
							O ateliê já começou o preparo, então o pedido não pode mais ser
							cancelado por aqui. Depois de receber, você tem 30 dias para
							trocar ou devolver.
						</div>
					) : null}
				</div>
			</div>
		</>
	);
}

function TimelineItem({
	step,
	isLast,
	nextAhead,
}: {
	step: TimelineStep;
	isLast: boolean;
	nextAhead: boolean;
}) {
	const ahead = step.state === 'ahead';
	return (
		<li className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-3.5">
			<div className="flex flex-col items-center">
				<span
					className={cn(
						'mt-[3px] size-3.5 rounded-full border-2',
						ahead && 'border-border bg-card',
						step.state === 'done' && 'border-transparent bg-success',
						step.state === 'current' && 'border-transparent bg-primary',
						step.state === 'stopped' && 'border-transparent bg-clay',
					)}
				/>
				{isLast ? null : (
					<span
						className={cn(
							'my-1 min-h-[30px] w-0.5 grow origin-top animate-[grow_.8s_cubic-bezier(.2,.7,.2,1)_.2s_both]',
							ahead || nextAhead ? 'bg-border' : 'bg-success',
						)}
					/>
				)}
			</div>
			<div className="flex flex-col gap-0.5 pb-4">
				<span
					className={cn(
						'text-[15px]',
						ahead ? 'text-muted-foreground' : 'text-foreground',
						(step.state === 'current' || step.state === 'stopped') &&
							'font-medium',
					)}
				>
					{step.label}
				</span>
				<span className="font-mono text-[11px] text-muted-foreground">
					{step.at
						? formatTimelineMoment(step.at)
						: ahead
							? 'A SEGUIR'
							: 'AGORA'}
				</span>
				{step.note && !ahead ? (
					<span className="text-[13px] text-ink-soft">{step.note}</span>
				) : null}
			</div>
		</li>
	);
}

function cancelErrorText(error: unknown) {
	if (isApiError(error)) {
		if (error.code === 'order_in_fulfilment') {
			return 'O ateliê já começou o preparo; o pedido não pode mais ser cancelado.';
		}
		if (error.code === 'payment_in_progress') {
			return 'O pagamento ainda está sendo confirmado. Tente de novo em instantes.';
		}
	}
	return 'Não foi possível cancelar agora. Tente de novo em instantes.';
}

export { OrderDetailSection };
