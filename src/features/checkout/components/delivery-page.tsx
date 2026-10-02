'use client';

import { MapPinIcon } from '@phosphor-icons/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { CheckoutSteps } from '@/components/checkout-steps';
import { StoreFooter } from '@/components/store-footer';
import { StoreHeader } from '@/components/store-header';
import { useCartQuote } from '@/features/cart/hooks/cart.queries';
import { useCart } from '@/features/cart/hooks/use-cart';
import { buildCartView, checkoutGate } from '@/features/cart/lib/cart-view';
import {
	useCategories,
	useProducts,
} from '@/features/catalog/hooks/catalog.queries';
import { ErrorState } from '@/features/errors/components/error-state';
import { useRequireSession } from '@/lib/auth/use-require-session';
import { useIsHydrated } from '@/lib/hooks/use-is-hydrated';
import { appRoutes } from '@/lib/routes/app-routes';

import { useAddAddress, useAddresses } from '../hooks/checkout.queries';
import { initialAddressId } from '../lib/checkout-url';
import type { CustomerAddress } from '../model/address';
import type { AddressForm } from '../schemas/address-form.schema';
import { AddressCard } from './address-card';
import { AddressFormCard } from './address-form';
import { CheckoutSection, ShippingComingSoon } from './checkout-section';
import { CheckoutSummary } from './checkout-summary';

/** OrderCore's maximum page size — the catalog joined with the quote. */
const CATALOG_PAGE_SIZE = 100;

/** Checkout · Entrega (Docs/specs/checkout/delivery.md). */
function DeliveryPage() {
	return (
		<div className="flex min-h-screen min-w-[360px] flex-col overflow-hidden bg-background">
			<StoreHeader />
			<main className="flex grow flex-col">
				<section className="pt-8 pb-2">
					<div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-5 sm:px-10">
						<CheckoutSteps current="delivery" />
						<h1 className="animate-up text-[36px] leading-none font-light tracking-[-0.03em] [animation-duration:.6s] sm:text-[44px]">
							Para onde{' '}
							<span className="font-medium text-primary">vamos enviar?</span>
						</h1>
					</div>
				</section>
				{/* Reads ?entrega=/&cobranca= and gates on the session. */}
				<Suspense fallback={<DeliverySkeleton />}>
					<DeliveryContent />
				</Suspense>
			</main>
			<StoreFooter />
		</div>
	);
}

function DeliveryContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { session, expired } = useRequireSession();
	const hydrated = useIsHydrated();
	const { lines } = useCart();
	const addresses = useAddresses();
	const addAddress = useAddAddress();

	const urlShipping = searchParams.get('entrega');
	const urlBilling = searchParams.get('cobranca');
	const [pickedShipping, setPickedShipping] = useState<string | null>(null);
	const [pickedBilling, setPickedBilling] = useState<string | null>(null);
	const [sameBilling, setSameBilling] = useState(
		() => !urlBilling || urlBilling === urlShipping,
	);
	const [formRequested, setFormRequested] = useState(false);

	// Nothing to deliver: back to the bag.
	useEffect(() => {
		if (hydrated && session && lines.length === 0) {
			router.replace(appRoutes.cart.index);
		}
	}, [hydrated, session, lines.length, router]);

	const quote = useCartQuote(lines);
	const catalog = useProducts({ page: 1, pageSize: CATALOG_PAGE_SIZE });
	const categories = useCategories();
	const view = buildCartView({
		lines,
		quote: quote.data,
		products: catalog.data?.items ?? [],
		categories: categories.data ?? [],
	});

	if (expired) {
		return <ErrorState kind="session-expired" />;
	}
	if (!session || addresses.isPending || lines.length === 0) {
		return <DeliverySkeleton />;
	}

	const saved: CustomerAddress[] = addresses.data ?? [];
	const shippingId = selectedId(saved, pickedShipping, urlShipping, 'shipping');
	const billingId = sameBilling
		? shippingId
		: selectedId(saved, pickedBilling, urlBilling, 'billing');
	const formOpen = saved.length === 0 || formRequested;

	const gate = checkoutGate({
		hasLines: lines.length > 0,
		quoteStatus: quote.isError
			? 'error'
			: quote.isOutdated || !quote.data
				? 'checking'
				: 'ready',
		quoteIsValid: quote.data?.isValid ?? false,
	});
	const continueHref =
		shippingId && billingId && gate.canCheckout
			? appRoutes.checkout.paymentWith(shippingId, billingId)
			: null;

	function saveAddress(form: AddressForm) {
		addAddress.mutate(
			{ form, existing: saved },
			{
				onSuccess: (created) => {
					setPickedShipping(created.id);
					setFormRequested(false);
				},
			},
		);
	}

	return (
		<section className="pt-6 pb-16">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-x-6 gap-y-7 px-5 min-[980px]:grid-cols-12 sm:px-10">
				<div className="flex flex-col gap-4 min-[980px]:col-span-8">
					<CheckoutSection
						letter="A"
						title="Endereço de entrega"
						action={
							saved.length > 0 && !formOpen ? (
								<button
									type="button"
									onClick={() => setFormRequested(true)}
									className="min-h-8 text-sm font-medium text-primary hover:text-primary-strong"
								>
									+ Novo endereço
								</button>
							) : null
						}
					>
						{addresses.isError ? (
							<div
								role="alert"
								className="flex flex-wrap items-center gap-3 rounded-xl bg-clay-soft px-4 py-3.5 text-sm"
							>
								<span className="grow">
									Não foi possível carregar seus endereços.
								</span>
								<button
									type="button"
									onClick={() => addresses.refetch()}
									className="font-medium text-primary"
								>
									Tentar de novo
								</button>
							</div>
						) : saved.length === 0 ? (
							<div className="flex items-center gap-2.5 rounded-xl bg-surface px-4 py-3.5 text-sm text-ink-soft">
								<MapPinIcon
									size={18}
									className="shrink-0 text-muted-foreground"
								/>
								Você ainda não tem endereços salvos. Cadastre o primeiro abaixo;
								ele vira o seu padrão.
							</div>
						) : (
							<div
								role="radiogroup"
								aria-label="Endereço de entrega"
								className="flex flex-col gap-2.5"
							>
								{saved.map((address) => (
									<AddressCard
										key={address.id}
										address={address}
										name="shipping-address"
										selected={address.id === shippingId}
										onSelect={() => setPickedShipping(address.id)}
									/>
								))}
							</div>
						)}
						{formOpen ? (
							<AddressFormCard
								isFirst={saved.length === 0}
								saving={addAddress.isPending}
								saveError={addAddress.error}
								onSave={saveAddress}
								onCancel={
									saved.length > 0 ? () => setFormRequested(false) : null
								}
							/>
						) : null}
					</CheckoutSection>

					<CheckoutSection
						letter="B"
						title="Endereço de cobrança"
						className="[animation-delay:.06s]"
					>
						<label className="flex cursor-pointer items-center gap-3 text-[15px]">
							<input
								type="checkbox"
								checked={sameBilling}
								onChange={(event) => setSameBilling(event.target.checked)}
								className="size-[18px] accent-primary"
							/>
							Igual ao endereço de entrega
						</label>
						{!sameBilling && saved.length > 0 ? (
							<div
								role="radiogroup"
								aria-label="Endereço de cobrança"
								className="flex animate-up flex-col gap-2.5"
							>
								{saved.map((address) => (
									<AddressCard
										key={address.id}
										address={address}
										name="billing-address"
										selected={address.id === billingId}
										onSelect={() => setPickedBilling(address.id)}
										compact
									/>
								))}
							</div>
						) : null}
					</CheckoutSection>

					<ShippingComingSoon />
				</div>

				<div className="min-[980px]:col-span-4 min-[980px]:col-start-9">
					<CheckoutSummary
						view={view}
						continueHref={continueHref}
						continueLabel="Continuar para pagamento"
						blockedLabel={
							saved.length === 0
								? 'Cadastre um endereço para continuar'
								: 'Continuar para pagamento'
						}
						blockedReason={saved.length === 0 ? null : gate.reason}
					/>
				</div>
			</div>
		</section>
	);
}

/** The shopper's pick if it still exists, else URL → default → first. */
function selectedId(
	addresses: readonly CustomerAddress[],
	picked: string | null,
	fromUrl: string | null,
	kind: 'shipping' | 'billing',
) {
	if (picked && addresses.some((address) => address.id === picked)) {
		return picked;
	}
	return initialAddressId(addresses, fromUrl, kind);
}

function DeliverySkeleton() {
	return (
		<section className="pt-6 pb-16" aria-busy="true" aria-label="Carregando">
			<div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-5 min-[980px]:grid-cols-12 sm:px-10">
				<div className="flex flex-col gap-4 min-[980px]:col-span-8">
					<div className="skeleton h-[220px] rounded-[20px]" />
					<div className="skeleton h-[110px] rounded-[20px]" />
				</div>
				<div className="skeleton h-[420px] rounded-[20px] min-[980px]:col-span-4 min-[980px]:col-start-9" />
			</div>
		</section>
	);
}

export { DeliveryPage };
