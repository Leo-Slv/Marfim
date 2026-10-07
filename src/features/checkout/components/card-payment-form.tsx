'use client';

import { LockSimpleIcon } from '@phosphor-icons/react';
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';

import { stripeAppearance, stripeFonts } from '../lib/stripe-appearance';

const stripePromises = new Map<string, Promise<Stripe | null>>();

/** One Stripe.js instance per publishable key (Stripe's recommendation). */
function getStripe(publishableKey: string) {
	let promise = stripePromises.get(publishableKey);
	if (!promise) {
		promise = loadStripe(publishableKey);
		stripePromises.set(publishableKey, promise);
	}
	return promise;
}

type CardPaymentFormProps = {
	publishableKey: string;
	/** From checkout's `payment.nextAction` (`confirm_card`). */
	clientSecret: string;
	total: number;
	/** Where Stripe returns after an off-site confirmation, if one is needed. */
	returnUrl: string;
	onConfirmed: () => void;
	onBack: () => void;
};

/**
 * 16 · Dados do cartão. The fields are Stripe's Payment Element, so card
 * data goes straight to Stripe — never through Marfim or OrderCore
 * (OrderCore's stripe-provider spec, decision 1). 3-D Secure runs in place.
 */
function CardPaymentForm(props: CardPaymentFormProps) {
	return (
		<Elements
			stripe={getStripe(props.publishableKey)}
			options={{
				clientSecret: props.clientSecret,
				appearance: stripeAppearance,
				fonts: stripeFonts,
				locale: 'pt-BR',
			}}
		>
			<CardForm {...props} />
		</Elements>
	);
}

/** PaymentIntent states in which the card was already confirmed. */
const CONFIRMED_INTENT_STATUSES = new Set([
	'processing',
	'requires_capture',
	'succeeded',
]);

function CardForm({
	clientSecret,
	total,
	returnUrl,
	onConfirmed,
	onBack,
}: CardPaymentFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [submitting, setSubmitting] = useState(false);
	const [declineCount, setDeclineCount] = useState(0);
	const [declineMessage, setDeclineMessage] = useState<string | null>(null);
	const [ready, setReady] = useState(false);

	// After a reload the page can't tell whether the card was already sent;
	// Stripe can: skip the form when the intent is past confirmation.
	useEffect(() => {
		if (!stripe) {
			return;
		}
		let active = true;
		void stripe
			.retrievePaymentIntent(clientSecret)
			.then(({ paymentIntent }) => {
				if (
					active &&
					paymentIntent &&
					CONFIRMED_INTENT_STATUSES.has(paymentIntent.status)
				) {
					onConfirmed();
				}
			});
		return () => {
			active = false;
		};
	}, [stripe, clientSecret, onConfirmed]);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!stripe || !elements) {
			return;
		}
		setSubmitting(true);
		setDeclineMessage(null);

		const { error } = await stripe.confirmPayment({
			elements,
			redirect: 'if_required',
			confirmParams: { return_url: returnUrl },
		});

		setSubmitting(false);
		if (!error) {
			onConfirmed();
			return;
		}
		// Field problems are shown by the Payment Element itself.
		if (error.type !== 'validation_error') {
			setDeclineCount((count) => count + 1);
			setDeclineMessage(
				error.type === 'card_error'
					? 'O banco recusou este cartão. Confira os dados ou use outro cartão. Nenhum valor foi cobrado.'
					: 'Não foi possível confirmar o pagamento agora. Tente de novo; nenhum valor foi cobrado.',
			);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex animate-up flex-col gap-4 rounded-[20px] border bg-card p-6 [animation-duration:.6s]"
		>
			<div className="flex items-center gap-3">
				<h2 className="grow text-xl font-medium">Dados do cartão</h2>
				<span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
					<LockSimpleIcon size={12} />
					PROCESSADO PELO STRIPE
				</span>
			</div>
			{declineMessage ? (
				<div
					key={declineCount}
					role="alert"
					className="animate-shake rounded-xl bg-clay-soft px-4 py-3 text-sm leading-normal"
				>
					{declineMessage}
				</div>
			) : null}
			<div className="min-h-[180px]">
				{ready ? null : (
					<div
						aria-busy="true"
						aria-label="Carregando o formulário do cartão"
						className="skeleton h-[180px] rounded-[14px]"
					/>
				)}
				<PaymentElement
					onReady={() => setReady(true)}
					options={{
						layout: 'tabs',
						wallets: { applePay: 'never', googlePay: 'never' },
					}}
				/>
			</div>
			{/* Below 980 px the submit row is the fixed action bar
			    (MobileCheckout.dc.html); the spacer lets the page scroll past it. */}
			<div aria-hidden="true" className="h-[60px] min-[980px]:hidden" />
			<div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-4 pt-2.5 pb-[max(14px,env(safe-area-inset-bottom))] min-[980px]:static min-[980px]:z-auto min-[980px]:flex min-[980px]:flex-wrap min-[980px]:items-center min-[980px]:gap-2.5 min-[980px]:border-0 min-[980px]:bg-transparent min-[980px]:p-0">
				<button
					type="submit"
					disabled={!stripe || !elements || !ready || submitting}
					className="flex h-[52px] w-full items-center justify-between gap-2.5 rounded-xl bg-primary px-[18px] text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-55 min-[980px]:w-auto min-[980px]:justify-center min-[980px]:px-6"
				>
					<span className="flex items-center gap-2.5">
						{submitting ? <Spinner /> : null}
						{submitting ? 'Confirmando…' : 'Pagar'}
					</span>
					{submitting ? null : (
						<span className="font-mono text-[15px] min-[980px]:font-sans min-[980px]:text-base">
							{formatCurrencyBrlCents(total)}
						</span>
					)}
				</button>
				<BackButton onBack={onBack} disabled={submitting} desktop />
			</div>
			<BackButton onBack={onBack} disabled={submitting} />
			<p className="text-xs leading-normal text-muted-foreground">
				Os dados do cartão vão direto para o processador de pagamento. A Marfim
				não armazena o número do cartão.
			</p>
		</form>
	);
}

/** "Voltar" next to Pagar on desktop, under the card form on mobile. */
function BackButton({
	onBack,
	disabled,
	desktop = false,
}: {
	onBack: () => void;
	disabled: boolean;
	desktop?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onBack}
			disabled={disabled}
			className={`min-h-8 self-start text-sm font-medium text-primary hover:text-primary-strong disabled:opacity-55 ${desktop ? 'hidden min-[980px]:block' : 'min-[980px]:hidden'}`}
		>
			Voltar
		</button>
	);
}

function Spinner() {
	return (
		<svg
			className="animate-spin-fast"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			aria-hidden="true"
		>
			<path d="M21 12a9 9 0 1 1-6.2-8.6" />
		</svg>
	);
}

export { CardPaymentForm, Spinner };
