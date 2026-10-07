'use client';

import { ArrowLeftIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useState } from 'react';

import { BottomSheet } from '@/components/bottom-sheet';
import { notify } from '@/features/account/components/account-toast';
import { formatTimelineMoment } from '@/features/account/lib/account-format';
import { formatOrderMoment } from '@/features/admin-orders/lib/order-format';
import { parseMoney } from '@/features/admin-products/lib/product-form';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { QueryErrorState } from '@/features/errors/components/query-error-state';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { usePayment, usePaymentActions } from '../hooks/admin-payments.queries';
import {
	canRefund,
	declineExplanation,
	paymentErrorCopy,
	paymentEvents,
	paymentStatusView,
	reconciliationMessage,
	refundableBalance,
	refundReasons,
	validateRefund,
} from '../lib/payments';
import type { Payment } from '../schemas/admin-payments.schema';

const dotClass = {
	neutral: 'bg-[#C9C7C0]',
	success: 'bg-success',
	alert: 'bg-clay',
	refund: 'bg-primary',
} as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
			{children}
		</span>
	);
}

/** The payment (AdminPagamentos.dc.html, right panel). */
function PaymentPanel({
	paymentId,
	onClose,
}: {
	paymentId: string;
	onClose: () => void;
}) {
	const payment = usePayment(paymentId);

	return (
		<aside className="flex w-full shrink-0 animate-slide-in flex-col gap-[18px] bg-card px-4 py-4 min-[980px]:border-l min-[980px]:px-6 min-[980px]:py-7 min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:h-screen min-[1280px]:w-[400px] min-[1280px]:overflow-y-auto">
			<button
				type="button"
				onClick={onClose}
				className="flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-strong min-[1280px]:hidden"
			>
				<ArrowLeftIcon size={14} />
				Pagamentos
			</button>
			{payment.isPending ? (
				<div className="flex flex-col gap-3">
					<div className="skeleton h-20 rounded-xl" />
					<div className="skeleton h-28 rounded-xl" />
					<div className="skeleton h-32 rounded-xl" />
				</div>
			) : payment.isError ? (
				<QueryErrorState
					key={payment.errorUpdatedAt}
					error={payment.error}
					onRetry={() => void payment.refetch()}
				/>
			) : (
				<PaymentDetail payment={payment.data} />
			)}
		</aside>
	);
}

function PaymentDetail({
	payment,
}: {
	payment: Payment & { orderNumber: string | null };
}) {
	const actions = usePaymentActions(payment.id);
	const balance = refundableBalance(payment);
	const refunded = Math.max(0, payment.amount - balance);
	const status = paymentStatusView(payment.status, refunded);
	const [amount, setAmount] = useState('');
	const [reason, setReason] = useState<string>(refundReasons[0]);
	const [refundError, setRefundError] = useState<string | null>(null);
	const [confirming, setConfirming] = useState(false);
	// Below 980 px the refund confirm is a bottom sheet (MobileAdminPagamentos.dc.html).
	const mobile = useMediaQuery('(max-width: 979px)') === true;
	const check = actions.reconcile.data
		? reconciliationMessage(actions.reconcile.data)
		: null;

	function handleRefund(event: React.FormEvent) {
		event.preventDefault();
		const invalid = validateRefund(amount, balance);
		if (invalid) {
			setRefundError(invalid);
			return;
		}
		setRefundError(null);
		setConfirming(true);
	}

	function sendRefund() {
		actions.refund.mutate(
			{ amount: parseMoney(amount) ?? 0, reason },
			{
				onSuccess: () => {
					setAmount('');
					setConfirming(false);
					notify('Estorno enviado ao Stripe');
				},
				onError: (failure) => {
					setConfirming(false);
					setRefundError(paymentErrorCopy(failure));
				},
			},
		);
	}

	return (
		<>
			<div className="flex flex-col gap-1.5">
				<span className="truncate font-mono text-[13px]">
					{payment.providerReference ?? payment.id}
				</span>
				<div className="flex flex-wrap items-baseline gap-3">
					<span className="text-[34px] font-light tracking-[-0.03em]">
						{formatCurrencyBrlCents(payment.amount)}
					</span>
					<span
						key={status.label}
						className={cn(
							'inline-flex h-6 animate-pop-in items-center rounded-full px-2.5 text-xs font-medium',
							status.className,
						)}
					>
						{status.label}
					</span>
				</div>
				<span className="text-[13px] text-muted-foreground">
					Pedido{' '}
					<Link
						href={appRoutes.admin.order(payment.orderId)}
						className="font-mono text-primary hover:text-primary-strong"
					>
						{payment.orderNumber ?? 'abrir'}
					</Link>{' '}
					· {payment.method === 'Pix' ? 'Pix' : 'Cartão'} ·{' '}
					{formatOrderMoment(payment.createdAt)}
				</span>
			</div>

			{payment.lastDeclineReason ? (
				<div className="rounded-xl bg-clay-soft px-3.5 py-3 text-[13px]">
					<span className="block pb-0.5 font-mono text-[10px] tracking-[0.12em] text-clay">
						MOTIVO DA RECUSA
					</span>
					<span className="font-mono">{payment.lastDeclineReason}</span> ·{' '}
					{declineExplanation(payment.lastDeclineReason)}
				</div>
			) : null}

			<div className="flex flex-col gap-2.5 rounded-[14px] bg-background p-4">
				<SectionLabel>CONFERIR COM O STRIPE</SectionLabel>
				{actions.reconcile.isPending ? (
					<span className="flex items-center gap-2 text-[13px] text-primary">
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.4"
							strokeLinecap="round"
							aria-hidden="true"
							className="animate-spin-fast"
						>
							<path d="M21 12a9 9 0 1 1-6.2-8.6" />
						</svg>
						Consultando o Stripe…
					</span>
				) : check ? (
					<span
						role="status"
						className={cn(
							'animate-pop-in text-[13px]',
							check.tone === 'same' ? 'text-success' : 'text-primary',
						)}
					>
						{check.text}
					</span>
				) : actions.reconcile.isError ? (
					<span role="alert" className="text-[13px] text-clay">
						{paymentErrorCopy(actions.reconcile.error)}
					</span>
				) : null}
				<button
					type="button"
					disabled={actions.reconcile.isPending}
					onClick={() => actions.reconcile.mutate()}
					className="h-[38px] self-start rounded-[10px] border bg-card px-3.5 text-[13px] font-medium transition-colors hover:bg-surface-2 disabled:opacity-55"
				>
					Conferir agora
				</button>
			</div>

			{canRefund(payment) ? (
				<form
					onSubmit={handleRefund}
					noValidate
					className="flex flex-col gap-2.5 rounded-[14px] border p-4"
				>
					<SectionLabel>
						ESTORNO · ATÉ {formatCurrencyBrlCents(balance)}
					</SectionLabel>
					<div className="flex gap-2">
						<input
							aria-label="Valor do estorno"
							inputMode="decimal"
							placeholder="0,00"
							value={amount}
							aria-invalid={refundError ? true : undefined}
							onChange={(event) => {
								setAmount(event.target.value.replace(/[^\d.,]/g, ''));
								setRefundError(null);
								setConfirming(false);
							}}
							className="h-[42px] min-w-0 grow rounded-[10px] border bg-card px-3 font-mono text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-clay"
						/>
						<button
							type="button"
							onClick={() => {
								setAmount(balance.toFixed(2).replace('.', ','));
								setRefundError(null);
							}}
							className="h-[42px] rounded-[10px] border bg-card px-3 text-[13px] hover:bg-surface-2"
						>
							Total
						</button>
					</div>
					<select
						aria-label="Motivo do estorno"
						value={reason}
						onChange={(event) => setReason(event.target.value)}
						className="h-[42px] rounded-[10px] border bg-card px-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
					>
						{refundReasons.map((option) => (
							<option key={option}>{option}</option>
						))}
					</select>
					{refundError ? (
						<span role="alert" className="text-xs text-clay">
							{refundError}
						</span>
					) : null}
					{confirming && !mobile ? (
						<div className="flex animate-pop-in flex-col gap-2 rounded-[10px] bg-clay-soft p-3 text-[13px]">
							Estornar {formatCurrencyBrlCents(parseMoney(amount) ?? 0)} no
							cartão do cliente? Não dá para desfazer.
							<div className="flex gap-2">
								<button
									type="button"
									disabled={actions.refund.isPending}
									onClick={sendRefund}
									className="h-9 rounded-[9px] bg-clay px-3 text-[13px] font-medium text-white disabled:opacity-55"
								>
									{actions.refund.isPending ? 'Enviando…' : 'Sim, estornar'}
								</button>
								<button
									type="button"
									onClick={() => setConfirming(false)}
									className="h-9 rounded-[9px] border bg-card px-3 text-[13px]"
								>
									Voltar
								</button>
							</div>
						</div>
					) : (
						<button
							type="submit"
							className="h-[42px] rounded-[10px] bg-clay text-sm font-medium text-white transition-opacity hover:opacity-90"
						>
							Estornar
						</button>
					)}
					<BottomSheet
						open={confirming && mobile}
						onOpenChange={setConfirming}
						title={
							'Estornar ' +
							formatCurrencyBrlCents(parseMoney(amount) ?? 0) +
							'?'
						}
						description="O valor volta para o cartão do cliente. Não dá para desfazer."
					>
						<button
							type="button"
							disabled={actions.refund.isPending}
							onClick={sendRefund}
							className="h-[50px] rounded-xl bg-clay text-[15px] font-medium text-white disabled:opacity-55"
						>
							{actions.refund.isPending ? 'Enviando…' : 'Sim, estornar'}
						</button>
						<button
							type="button"
							onClick={() => setConfirming(false)}
							className="h-12 rounded-xl border bg-card text-[15px] font-medium"
						>
							Voltar
						</button>
					</BottomSheet>
				</form>
			) : null}

			<div className="flex flex-col gap-2">
				<SectionLabel>EVENTOS</SectionLabel>
				{paymentEvents(payment).map((event, index, events) => (
					<div
						key={event.key}
						className="flex animate-pop-in gap-2.5 text-[13px]"
					>
						<span
							className={cn(
								'mt-[5px] size-2 shrink-0 rounded-full',
								index === events.length - 1
									? 'bg-primary'
									: dotClass[event.tone],
							)}
						/>
						<span className="grow">{event.label}</span>
						<span className="shrink-0 font-mono text-[11px] text-muted-foreground">
							{formatTimelineMoment(event.at)}
						</span>
					</div>
				))}
			</div>
		</>
	);
}

export { PaymentPanel };
