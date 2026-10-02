'use client';

import { CheckIcon, CreditCardIcon, XIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { formatCurrencyBrl } from '@/features/catalog/lib/format-currency-brl';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { maskPostalCode } from '../lib/format-address';
import { processingStep } from '../lib/order-stage';
import { paymentFailureReason } from '../lib/payment-messages';
import type { Order } from '../model/order';
import { Spinner } from './card-payment-form';

const processingSteps = [
	'Pedido criado',
	'Pagamento enviado ao banco',
	'Aguardando confirmação',
	'Confirmando estoque',
];

/** 17 · Confirmando o pagamento… (the page polls the order meanwhile). */
function PaymentProcessing({ orderNumber }: { orderNumber: string }) {
	const [startedAt] = useState(() => Date.now());
	const [now, setNow] = useState(startedAt);
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);
	const waitingOn = processingStep((now - startedAt) / 1000);

	return (
		<section className="pt-20 pb-24">
			<div className="mx-auto flex max-w-[1280px] flex-col items-center gap-[22px] px-5 text-center sm:px-10">
				<div className="relative size-[120px]">
					<svg
						className="absolute inset-0"
						width="120"
						height="120"
						viewBox="0 0 120 120"
						fill="none"
						aria-hidden="true"
					>
						<circle cx="60" cy="60" r="52" stroke="#ECECFD" strokeWidth="6" />
					</svg>
					<svg
						className="absolute inset-0 animate-orbit"
						width="120"
						height="120"
						viewBox="0 0 120 120"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M60 8a52 52 0 0 1 52 52"
							stroke="#3B3FD9"
							strokeWidth="6"
							strokeLinecap="round"
						/>
						<circle cx="112" cy="60" r="6" fill="#E8793A" />
					</svg>
					<div className="absolute inset-0 flex items-center justify-center">
						<CreditCardIcon size={34} className="text-primary" />
					</div>
				</div>
				<div className="font-mono text-xs tracking-[0.14em] text-muted-foreground">
					PEDIDO {orderNumber}
				</div>
				<h1 className="text-[34px] font-light tracking-[-0.03em] sm:text-[40px]">
					Confirmando o pagamento
					<span className="animate-loading-dot">.</span>
					<span className="animate-loading-dot [animation-delay:.2s]">.</span>
					<span className="animate-loading-dot [animation-delay:.4s]">.</span>
				</h1>
				<p className="max-w-[440px] text-[15px] text-muted-foreground">
					Isso leva alguns segundos. Não feche nem atualize esta página.
				</p>
				<div
					role="status"
					aria-live="polite"
					className="flex min-w-[min(340px,100%)] flex-col gap-3 rounded-2xl border bg-card px-[22px] py-[18px] text-left text-sm"
				>
					{processingSteps.map((label, index) => {
						const done = index < waitingOn;
						const waiting = index === waitingOn;
						return (
							<div
								key={label}
								className={cn(
									'flex animate-fade-in items-center gap-2.5',
									index <= waitingOn
										? 'text-foreground'
										: 'text-muted-foreground',
								)}
							>
								{done ? (
									<CheckIcon size={16} weight="bold" className="text-success" />
								) : waiting ? (
									<span className="text-primary">
										<Spinner />
									</span>
								) : (
									<span className="size-4 rounded-full border-[1.5px] border-border" />
								)}
								{label}
							</div>
						);
					})}
					<div className="flex items-center gap-2 border-t pt-2.5 text-xs text-success">
						<span className="size-[7px] animate-pulse-dot rounded-full bg-success" />
						Ao vivo · atualiza sozinho
					</div>
				</div>
			</div>
		</section>
	);
}

const nextSteps = [
	{ label: 'Confirmado', note: 'Agora', current: true },
	{ label: 'Em preparo', note: 'O ateliê embala a peça', current: false },
	{ label: 'Enviado', note: 'Você recebe o rastreio', current: false },
	{ label: 'Entregue', note: 'Troca em até 30 dias', current: false },
];

const confetti = [
	{ left: '-60px', top: '0', color: '#3B3FD9', delay: '0s' },
	{ left: '120px', top: '-10px', color: '#E8793A', delay: '.1s' },
	{ left: '20px', top: '-20px', color: '#15803D', delay: '.2s' },
	{ left: '80px', top: '6px', color: '#ECECFD', delay: '.05s' },
];

/** 18 · Pedido confirmado. */
function OrderConfirmed({
	order,
	customerName,
	email,
}: {
	order: Order;
	customerName: string | null;
	email: string | null;
}) {
	const firstName = customerName?.split(' ')[0];
	const address = order.shippingAddress;

	return (
		<section className="pt-14 pb-20">
			<div className="mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-5 sm:px-10">
				<div className="relative flex flex-col items-center gap-4 text-center">
					{confetti.map((piece) => (
						<span
							key={piece.left}
							aria-hidden="true"
							className="absolute h-3 w-2 animate-confetti rounded-[2px]"
							style={{
								left: `calc(50% + ${piece.left})`,
								top: piece.top,
								background: piece.color,
								animationDelay: piece.delay,
							}}
						/>
					))}
					<span className="flex size-[88px] animate-pop-in items-center justify-center rounded-full bg-success-soft">
						<svg
							className="check-draw"
							width="42"
							height="42"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#15803D"
							strokeWidth="2.2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="m5 12 5 5 9-10" />
						</svg>
					</span>
					<div className="animate-up font-mono text-xs tracking-[0.14em] text-muted-foreground [animation-delay:.08s]">
						PEDIDO {order.orderNumber}
					</div>
					<h1 className="animate-up text-[38px] font-light tracking-[-0.03em] [animation-delay:.08s] sm:text-5xl">
						Pedido <span className="font-medium text-success">confirmado</span>
					</h1>
					<p className="max-w-[480px] animate-up text-base text-muted-foreground [animation-delay:.16s]">
						Obrigado{firstName ? `, ${firstName}` : ''}.
						{email ? ` Mandamos o resumo para ${email}.` : ''} Os ateliês já
						foram avisados.
					</p>
				</div>

				<ol className="grid w-full max-w-[860px] animate-up grid-cols-2 gap-2 [animation-delay:.16s] sm:grid-cols-4">
					{nextSteps.map((step) => (
						<li key={step.label} className="flex flex-col gap-2">
							<div
								className={cn(
									'h-1 rounded-full',
									step.current ? 'bg-success' : 'bg-border',
								)}
							/>
							<span
								className={cn(
									'text-sm',
									step.current ? 'font-medium text-success' : 'text-ink-soft',
								)}
							>
								{step.label}
							</span>
							<span className="text-xs text-muted-foreground">{step.note}</span>
						</li>
					))}
				</ol>

				<div className="grid w-full max-w-[860px] animate-up grid-cols-1 gap-6 rounded-[20px] border bg-card p-6 [animation-delay:.24s] sm:grid-cols-2">
					<div className="flex flex-col gap-3">
						<span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
							ITENS
						</span>
						{order.items.map((item) => (
							<div
								key={item.productId}
								className="flex justify-between gap-3 text-sm"
							>
								<span>
									{item.quantity}× {item.productName}
								</span>
								<span className="font-mono">
									{formatCurrencyBrl(item.total)}
								</span>
							</div>
						))}
						<div className="flex justify-between border-t pt-2.5 text-[15px] font-medium">
							<span>Total pago</span>
							<span className="font-mono">
								{formatCurrencyBrl(order.totalAmount)}
							</span>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
							ENTREGA EM
						</span>
						{address ? (
							<span className="text-sm leading-relaxed text-ink-soft">
								{customerName ? (
									<>
										{customerName}
										<br />
									</>
								) : null}
								{address.street}, {address.number}
								{address.complement ? ` · ${address.complement}` : ''}
								<br />
								{address.neighborhood} · {address.city}, {address.state} ·{' '}
								{maskPostalCode(address.postalCode)}
							</span>
						) : null}
						<span className="pt-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
							PAGAMENTO
						</span>
						{/* No brand/last4 from OrderCore yet (payment pendency #2). */}
						<span className="text-sm text-ink-soft">Cartão de crédito</span>
					</div>
				</div>

				<div className="flex animate-up flex-wrap justify-center gap-2.5 [animation-delay:.24s]">
					<Link
						href={appRoutes.account.orders}
						className="flex h-[52px] items-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
					>
						Acompanhar pedido
					</Link>
					<Link
						href={appRoutes.system.home}
						className="flex h-[52px] items-center rounded-xl border bg-card px-[22px] text-base font-medium transition-colors hover:bg-surface-2"
					>
						Continuar comprando
					</Link>
				</div>
			</div>
		</section>
	);
}

/** 19 · Pagamento não aprovado. */
function PaymentFailed({
	order,
	onRetry,
}: {
	order: Order;
	onRetry: () => void;
}) {
	return (
		<section className="pt-16 pb-[88px]">
			<div className="mx-auto flex max-w-[1280px] flex-col items-center gap-[18px] px-5 text-center sm:px-10">
				<span className="flex size-[88px] animate-pop-in items-center justify-center rounded-full bg-clay-soft">
					<XIcon size={40} className="text-clay" />
				</span>
				<div className="font-mono text-xs tracking-[0.14em] text-muted-foreground">
					PEDIDO {order.orderNumber}
				</div>
				<h1 className="text-[38px] font-light tracking-[-0.03em] sm:text-5xl">
					Pagamento <span className="font-medium text-clay">não aprovado</span>
				</h1>
				<div className="max-w-[520px] rounded-[14px] border bg-card px-[18px] py-3.5 text-sm leading-normal text-ink-soft">
					<span className="block pb-1 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
						MOTIVO INFORMADO
					</span>
					{order.status === 'Cancelled'
						? 'O pedido foi cancelado. Nenhum valor foi cobrado.'
						: paymentFailureReason(order.payment?.failureReason ?? null)}
				</div>
				<p className="max-w-[480px] text-[15px] text-muted-foreground">
					As peças voltaram ao estoque, mas a sua sacola continua salva. Para
					tentar de novo, um novo pedido é criado.
				</p>
				<div className="flex flex-wrap justify-center gap-2.5 pt-2">
					<button
						type="button"
						onClick={onRetry}
						className="h-[52px] rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
					>
						Tentar de novo
					</button>
					<Link
						href={appRoutes.cart.index}
						className="flex h-[52px] items-center rounded-xl border bg-card px-[22px] text-base font-medium transition-colors hover:bg-surface-2"
					>
						Voltar para a sacola
					</Link>
				</div>
			</div>
		</section>
	);
}

export { OrderConfirmed, PaymentFailed, PaymentProcessing };
