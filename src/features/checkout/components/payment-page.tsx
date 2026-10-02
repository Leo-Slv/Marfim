'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

import { CheckoutSteps } from '@/components/checkout-steps';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import { useRequestEmailConfirmation } from '@/features/auth/hooks/auth.queries';
import { useCountdown } from '@/features/auth/hooks/use-countdown';
import { useCartQuote } from '@/features/cart/hooks/cart.queries';
import { useCart } from '@/features/cart/hooks/use-cart';
import { cartSubtotal } from '@/features/cart/lib/cart-lines';
import { buildCartView } from '@/features/cart/lib/cart-view';
import {
	useCategories,
	useProducts,
} from '@/features/catalog/hooks/catalog.queries';
import {
	formatCurrencyBrl,
	formatCurrencyBrlCents,
} from '@/features/catalog/lib/format-currency-brl';
import { useRequireSession } from '@/lib/auth/use-require-session';
import { queryKeys } from '@/lib/constants/query-keys';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { useAddresses } from '../hooks/checkout.queries';
import {
	useCustomerProfile,
	useOrder,
	usePaymentMethods,
	usePlaceOrder,
} from '../hooks/payment.queries';
import {
	attemptSignature,
	checkoutAttemptFor,
	clearAttempt,
	existingAttemptFor,
	hasAttempt,
} from '../lib/checkout-attempt';
import { paymentStage } from '../lib/order-stage';
import { checkoutAlert, type CheckoutAlert } from '../lib/payment-messages';
import type { CheckoutRequest, Order } from '../model/order';
import { CardPaymentForm } from './card-payment-form';
import {
	OrderConfirmed,
	PaymentFailed,
	PaymentProcessing,
} from './payment-outcome';
import {
	OrderReviewAside,
	PaymentAlert,
	PaymentReview,
	PlaceOrderButton,
} from './payment-review';

/** OrderCore's maximum page size — the catalog joined with the quote. */
const CATALOG_PAGE_SIZE = 100;

/** Checkout · Pagamento (Docs/specs/checkout/payment.md). */
function PaymentPage() {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main className="flex grow flex-col">
				<Suspense fallback={<PaymentSkeleton />}>
					<PaymentContent />
				</Suspense>
			</main>
			<StoreFooter />
		</div>
	);
}

function PaymentContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const session = useRequireSession();
	const hydrated = useIsHydrated();
	const { lines, repriceItem, clear } = useCart();

	const shippingId = searchParams.get('entrega');
	const billingId = searchParams.get('cobranca');
	const orderId = searchParams.get('pedido');
	// Stripe appends these when it had to send the shopper off-site (3DS).
	const returnedFromStripe = searchParams.has('payment_intent');

	const addresses = useAddresses();
	const methods = usePaymentMethods();
	const profile = useCustomerProfile();
	const placeOrder = usePlaceOrder();
	const resend = useRequestEmailConfirmation();
	const countdown = useCountdown();

	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [cardSent, setCardSent] = useState(false);
	// Stable: the card form re-checks Stripe whenever this changes.
	const markCardSent = useCallback(() => setCardSent(true), []);
	const [alertState, setAlertState] = useState<{
		alert: CheckoutAlert;
		count: number;
	} | null>(null);

	// With Stripe the payment is `Processing` from checkout on (the intent
	// exists, waiting for the card), so its status can't tell whether the
	// card was sent; this tab knows, and after a reload the card form asks
	// Stripe (see CardPaymentForm).
	const paymentSent = cardSent || returnedFromStripe;
	const orderQuery = useOrder(orderId, paymentSent);
	const order: Order | undefined = orderQuery.data;

	const quote = useCartQuote(lines);
	const catalog = useProducts({ page: 1, pageSize: CATALOG_PAGE_SIZE });
	const categories = useCategories();
	const view = buildCartView({
		lines,
		quote: quote.data,
		products: catalog.data?.items ?? [],
		categories: categories.data ?? [],
	});
	const changedLines = view.lines.filter(
		(line) => line.issue === 'PriceChanged',
	);

	const stage = paymentStage(order?.status ?? null, paymentSent);
	const seenTotal = cartSubtotal(lines);
	const signature =
		shippingId && billingId
			? `${attemptSignature(lines, shippingId, billingId)}|${seenTotal}`
			: null;

	const urlWith = (changes: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		return `${pathname}?${params}`;
	};

	/** The checkout body for the bag + addresses as they are now. */
	const checkoutRequest = (): CheckoutRequest => ({
		items: lines.map((line) => ({
			productId: line.productId,
			quantity: line.quantity,
		})),
		shippingAddressId: shippingId as string,
		billingAddressId: billingId as string,
		paymentMethod: 'Card',
		// What the shopper saw: a moved price answers 409 price_changed.
		expectedTotal: seenTotal,
	});

	// Missing context: back to the step that provides it.
	useEffect(() => {
		if (!hydrated || !session || orderId) {
			return;
		}
		if (lines.length === 0) {
			router.replace(appRoutes.cart.index);
		} else if (!shippingId || !billingId) {
			router.replace(appRoutes.checkout.delivery);
		}
	}, [hydrated, session, orderId, lines.length, shippingId, billingId, router]);

	// After a reload on the card step the client secret is gone: replay the
	// same checkout (same idempotency key → same order, never a new one).
	const needsSecret =
		stage === 'card' && clientSecret === null && signature !== null;
	useEffect(() => {
		if (!needsSecret || placeOrder.isPending || !signature) {
			return;
		}
		const attempt = existingAttemptFor(signature);
		if (!attempt) {
			// The bag or the addresses changed since: review again.
			router.replace(urlWith({ pedido: null }));
			return;
		}
		placeOrder.mutate(
			{ request: checkoutRequest(), idempotencyKey: attempt.key },
			{
				onSuccess: (placed) =>
					setClientSecret(placed.payment?.nextAction?.clientSecret ?? null),
			},
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- once per need
	}, [needsSecret]);

	// Paid: empty the bag this tab checked out (never a later, new bag).
	useEffect(() => {
		if (stage === 'confirmed' && hasAttempt()) {
			clear();
			clearAttempt();
		}
	}, [stage, clear]);

	function handlePlaceOrder() {
		if (!signature) {
			return;
		}
		const attempt = checkoutAttemptFor(signature);
		setAlertState(null);
		placeOrder.mutate(
			{ request: checkoutRequest(), idempotencyKey: attempt.key },
			{
				onSuccess: (placed) => {
					queryClient.setQueryData(queryKeys.checkout.order(placed.id), placed);
					setClientSecret(placed.payment?.nextAction?.clientSecret ?? null);
					setCardSent(false);
					router.replace(urlWith({ pedido: placed.id }), { scroll: false });
				},
				onError: (failure) => {
					const alert = checkoutAlert(failure);
					setAlertState((current) => ({
						alert,
						count: (current?.count ?? 0) + 1,
					}));
					if (alert.lockSeconds) {
						countdown.start(alert.lockSeconds);
					}
				},
			},
		);
	}

	function acceptNewPrices() {
		for (const line of changedLines) {
			repriceItem(line.productId, line.unitPrice);
		}
		setAlertState(null);
	}

	function retryAfterFailure() {
		clearAttempt();
		setClientSecret(null);
		setCardSent(false);
		setAlertState(null);
		router.replace(
			urlWith({
				pedido: null,
				payment_intent: null,
				payment_intent_client_secret: null,
				redirect_status: null,
			}),
		);
	}

	if (!session || (orderId && orderQuery.isPending)) {
		return <PaymentSkeleton />;
	}

	if (orderId && orderQuery.isError) {
		return (
			<section className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-5 py-24 text-center">
				<h1 className="text-[34px] font-light tracking-[-0.03em]">
					Não encontramos este pedido
				</h1>
				<p className="text-[15px] text-muted-foreground">
					Ele pode ser de outra conta ou o link está incompleto.
				</p>
				<Link
					href={appRoutes.cart.index}
					className="flex h-12 items-center rounded-xl bg-primary px-[22px] text-[15px] font-medium text-primary-foreground"
				>
					Voltar para a sacola
				</Link>
			</section>
		);
	}

	if (order && stage === 'processing') {
		return <PaymentProcessing orderNumber={order.orderNumber} />;
	}
	if (order && stage === 'confirmed') {
		return (
			<OrderConfirmed
				order={order}
				customerName={profile.data?.name ?? null}
				email={session.email}
			/>
		);
	}
	if (order && stage === 'failed') {
		return <PaymentFailed order={order} onRetry={retryAfterFailure} />;
	}

	const saved = addresses.data ?? [];
	const shipping = saved.find((address) => address.id === shippingId) ?? null;
	const billing = saved.find((address) => address.id === billingId) ?? null;
	const deliveryHref =
		shippingId && billingId
			? appRoutes.checkout.deliveryWith(shippingId, billingId)
			: appRoutes.checkout.delivery;
	const pixAvailable = methods.data?.methods.includes('Pix') ?? false;

	return (
		<>
			<section className="pt-8 pb-2">
				<div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 sm:px-10">
					<CheckoutSteps current="payment" hrefs={{ delivery: deliveryHref }} />
					<h1
						key={stage}
						className="animate-up text-[36px] leading-none font-light tracking-[-0.03em] [animation-duration:.6s] sm:text-[44px]"
					>
						{stage === 'card' ? 'Dados do cartão' : 'Revise e pague'}
					</h1>
				</div>
			</section>
			<section className="pt-6 pb-16">
				<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-6 gap-y-7 px-5 min-[980px]:grid-cols-12 sm:px-10">
					<div className="flex flex-col gap-4 min-[980px]:col-span-8">
						{stage === 'review' && alertState ? (
							<PaymentAlert
								alert={alertState.alert}
								alertKey={alertState.count}
								text={alertText(alertState.alert)}
								actions={alertActions(alertState.alert)}
							/>
						) : null}
						{stage === 'card' ? (
							order && clientSecret && methods.data?.publishableKey ? (
								<CardPaymentForm
									publishableKey={methods.data.publishableKey}
									clientSecret={clientSecret}
									total={order.totalAmount}
									returnUrl={
										typeof window === 'undefined' ? '' : window.location.href
									}
									onConfirmed={markCardSent}
									onBack={() =>
										router.replace(urlWith({ pedido: null }), { scroll: false })
									}
								/>
							) : methods.isError ||
							  (methods.data && !methods.data.publishableKey) ? (
								<div
									role="alert"
									className="rounded-2xl bg-clay-soft px-5 py-4 text-sm"
								>
									O pagamento com cartão está indisponível no momento. Tente de
									novo em instantes; nada foi cobrado.
								</div>
							) : (
								<div className="skeleton h-[360px] rounded-[20px]" />
							)
						) : (
							<PaymentReview
								pixAvailable={pixAvailable}
								shipping={shipping}
								billing={billing}
								deliveryHref={deliveryHref}
							/>
						)}
					</div>
					<div className="min-[980px]:col-span-4 min-[980px]:col-start-9">
						<OrderReviewAside
							view={view}
							changedIds={new Set(changedLines.map((line) => line.productId))}
						>
							{stage === 'review' ? (
								<PlaceOrderButton
									onClick={handlePlaceOrder}
									placing={placeOrder.isPending}
									lockSeconds={countdown.secondsLeft}
									disabled={
										lines.length === 0 ||
										!shipping ||
										!billing ||
										quote.isOutdated
									}
								/>
							) : null}
						</OrderReviewAside>
					</div>
				</div>
			</section>
		</>
	);

	function alertText(alert: CheckoutAlert) {
		if (alert.kind === 'price' && changedLines.length > 0) {
			const changes = changedLines
				.map((line) =>
					line.previousUnitPrice === null
						? `O preço de ${line.name} mudou`
						: `${line.name} passou de ${formatCurrencyBrl(line.previousUnitPrice)} para ${formatCurrencyBrl(line.unitPrice)}`,
				)
				.join('; ');
			return `${changes} desde que você abriu a sacola. O novo total é ${formatCurrencyBrlCents(view.total)}. Nada foi cobrado.`;
		}
		if (alert.kind === 'rate' && countdown.locked) {
			return `Aguarde ${countdown.secondsLeft} segundos para tentar de novo. Sua sacola continua salva.`;
		}
		if (alert.kind === 'email' && session) {
			return `Por segurança, só finalizamos compras de contas com e-mail confirmado. O link foi enviado para ${session.email} e vale 24 horas.`;
		}
		return alert.text;
	}

	function alertActions(alert: CheckoutAlert) {
		const primary =
			'flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-55';
		switch (alert.kind) {
			case 'price':
				return (
					<button type="button" onClick={acceptNewPrices} className={primary}>
						Aceitar novo total
					</button>
				);
			case 'stock':
				return (
					<Link href={appRoutes.cart.index} className={primary}>
						Ajustar a sacola
					</Link>
				);
			case 'email':
				return resend.isSuccess ? (
					<span className="self-center text-sm text-success">
						Link reenviado para {session?.email}.
					</span>
				) : (
					<button
						type="button"
						onClick={() => resend.mutate()}
						disabled={resend.isPending}
						className={primary}
					>
						Reenviar link de confirmação
					</button>
				);
			default:
				return null;
		}
	}
}

function PaymentSkeleton() {
	return (
		<section className="pt-8 pb-16" aria-busy="true" aria-label="Carregando">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-5 min-[980px]:grid-cols-12 sm:px-10">
				<div className="flex flex-col gap-4 min-[980px]:col-span-8">
					<div className="skeleton h-10 w-64 rounded-xl" />
					<div className="skeleton h-[200px] rounded-[20px]" />
					<div className="skeleton h-[140px] rounded-[20px]" />
				</div>
				<div className="skeleton h-[420px] rounded-[20px] min-[980px]:col-span-4 min-[980px]:col-start-9" />
			</div>
		</section>
	);
}

export { PaymentPage };
