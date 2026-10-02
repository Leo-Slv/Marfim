'use client';

import { CreditCardIcon, WarningCircleIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import type { CartView } from '@/features/cart/lib/cart-view';
import { ProductArt } from '@/features/catalog/components/product-art';
import {
	formatCurrencyBrl,
	formatCurrencyBrlCents,
} from '@/features/catalog/lib/format-currency-brl';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { addressLines } from '../lib/format-address';
import type { CheckoutAlert } from '../lib/payment-messages';
import type { CustomerAddress } from '../model/address';
import { Spinner } from './card-payment-form';

/** 15 · Forma de pagamento + Entrega/Cobrança summary. */
function PaymentReview({
	pixAvailable,
	shipping,
	billing,
	deliveryHref,
}: {
	pixAvailable: boolean;
	shipping: CustomerAddress | null;
	billing: CustomerAddress | null;
	deliveryHref: string;
}) {
	const sameAddress = shipping !== null && shipping.id === billing?.id;

	return (
		<>
			<section className="flex animate-up flex-col gap-3.5 rounded-[20px] border bg-card p-6 [animation-delay:.08s]">
				<h2 className="text-xl font-medium">Forma de pagamento</h2>
				<label className="flex cursor-pointer items-center gap-3.5 rounded-[14px] border border-primary bg-primary-soft px-[18px] py-4">
					<input
						type="radio"
						name="payment-method"
						checked
						readOnly
						className="size-[18px] shrink-0 accent-primary"
					/>
					<span className="flex grow flex-col gap-0.5">
						<b className="text-[15px] font-medium">Cartão de crédito</b>
						<span className="text-[13px] text-ink-soft">
							Você digita os dados do cartão no próximo passo.
						</span>
					</span>
					<CreditCardIcon size={26} className="text-primary" />
				</label>
				{/* Pix exists only on OrderCore's fake provider (payment pendency #1). */}
				{pixAvailable ? null : (
					<div className="flex items-center gap-3.5 rounded-[14px] border border-dashed px-[18px] py-4 text-muted-foreground">
						<input
							type="radio"
							name="payment-method"
							disabled
							aria-label="Pix, em breve"
							className="size-[18px] shrink-0"
						/>
						<span className="flex grow flex-col gap-0.5">
							<b className="text-[15px] font-medium">Pix com 5% off</b>
							<span className="text-[13px]">QR code e desconto à vista.</span>
						</span>
						<ComingSoonBadge />
					</div>
				)}
			</section>

			<section className="grid animate-up grid-cols-1 gap-6 rounded-[20px] border bg-card p-6 [animation-delay:.16s] sm:grid-cols-2">
				<AddressSummary
					title="ENTREGA"
					href={deliveryHref}
					address={shipping}
					showRecipient
				/>
				{sameAddress ? (
					<div className="flex flex-col gap-2">
						<SummaryHeading title="COBRANÇA" href={deliveryHref} />
						<div className="text-[15px] font-medium">Igual à entrega</div>
					</div>
				) : (
					<AddressSummary
						title="COBRANÇA"
						href={deliveryHref}
						address={billing}
					/>
				)}
			</section>
		</>
	);
}

function SummaryHeading({ title, href }: { title: string; href: string }) {
	return (
		<div className="flex items-baseline justify-between">
			<span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
				{title}
			</span>
			<Link
				href={href}
				className="text-[13px] font-medium text-primary hover:text-primary-strong"
			>
				Alterar
			</Link>
		</div>
	);
}

function AddressSummary({
	title,
	href,
	address,
	showRecipient = false,
}: {
	title: string;
	href: string;
	address: CustomerAddress | null;
	showRecipient?: boolean;
}) {
	if (!address) {
		return (
			<div className="flex flex-col gap-2">
				<SummaryHeading title={title} href={href} />
				<div className="skeleton h-14 rounded-lg" />
			</div>
		);
	}
	const { streetLine, placeLine } = addressLines(address);
	return (
		<div className="flex flex-col gap-2">
			<SummaryHeading title={title} href={href} />
			<div className="text-[15px] font-medium">
				{address.label}
				{showRecipient ? ` · ${address.recipientName}` : ''}
			</div>
			<div className="text-sm leading-normal text-ink-soft">
				{streetLine}
				<br />
				{placeLine}
			</div>
		</div>
	);
}

/** Checkout notice (price changed, out of stock, e-mail, too many tries). */
function PaymentAlert({
	alert,
	alertKey,
	text,
	actions,
}: {
	alert: CheckoutAlert;
	alertKey: number;
	text: string;
	actions: React.ReactNode;
}) {
	const informative = alert.kind === 'email';
	return (
		<div
			key={alertKey}
			role="alert"
			className={cn(
				'flex animate-shake items-start gap-3.5 rounded-2xl px-5 py-[18px]',
				informative ? 'bg-primary-soft' : 'bg-clay-soft',
			)}
		>
			<WarningCircleIcon
				size={20}
				className={cn(
					'mt-0.5 shrink-0',
					informative ? 'text-primary' : 'text-clay',
				)}
			/>
			<div className="flex grow flex-col gap-1.5">
				<b className="text-[15px] font-medium">{alert.title}</b>
				<span className="text-sm leading-[1.55] text-ink-soft">{text}</span>
				{actions ? (
					<div className="flex flex-wrap gap-3 pt-1">{actions}</div>
				) : null}
			</div>
		</div>
	);
}

/** "Revisão do pedido" aside with the order button. */
function OrderReviewAside({
	view,
	changedIds,
	children,
}: {
	view: CartView;
	/** Lines whose price moved since the shopper added them. */
	changedIds: ReadonlySet<string>;
	children: React.ReactNode;
}) {
	return (
		<aside className="flex animate-up flex-col gap-[18px] rounded-[20px] border bg-card p-6 [animation-delay:.16s] min-[980px]:sticky min-[980px]:top-6">
			<span className="text-xl font-medium">Revisão do pedido</span>
			<ul className="flex flex-col gap-3">
				{view.lines.map((line) => {
					const visual = getProductVisual(line.slug);
					const changed = changedIds.has(line.productId);
					return (
						<li key={line.productId} className="flex items-center gap-3">
							<div
								className="relative flex size-[52px] shrink-0 items-center justify-center rounded-[10px]"
								style={{ background: visual.tint }}
							>
								<ProductArt kind={visual.kind} size={30} />
								<span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-[5px] font-mono text-[11px] text-background">
									{line.quantity}
								</span>
							</div>
							<span className="flex grow flex-col gap-0.5 text-sm">
								{line.name}
								{changed ? (
									<span className="text-xs text-clay">Preço atualizado</span>
								) : null}
							</span>
							<span
								className={cn('font-mono text-[13px]', changed && 'text-clay')}
							>
								{formatCurrencyBrl(line.lineTotal)}
							</span>
						</li>
					);
				})}
			</ul>
			<dl className="flex flex-col gap-2.5 border-t pt-4 text-sm">
				<div className="flex justify-between">
					<dt className="text-ink-soft">Subtotal</dt>
					<dd className="font-mono">{formatCurrencyBrlCents(view.total)}</dd>
				</div>
				<div className="flex justify-between">
					<dt className="text-ink-soft">Frete</dt>
					<dd className="font-mono text-[11px] text-clay">EM BREVE</dd>
				</div>
			</dl>
			<div className="flex items-end justify-between border-t pt-4">
				<span className="text-[15px] font-medium">Total</span>
				<span
					key={view.total}
					className="animate-up text-[34px] leading-none font-light tracking-[-0.03em]"
				>
					{formatCurrencyBrlCents(view.total)}
				</span>
			</div>
			{children}
		</aside>
	);
}

/** "Ir para o pagamento" with its spinner/lock states. */
function PlaceOrderButton({
	onClick,
	placing,
	lockSeconds,
	disabled,
}: {
	onClick: () => void;
	placing: boolean;
	lockSeconds: number;
	disabled: boolean;
}) {
	return (
		<>
			<button
				type="button"
				onClick={onClick}
				disabled={disabled || placing || lockSeconds > 0}
				className="flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-primary text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 enabled:hover:-translate-y-px enabled:hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-55"
			>
				{placing ? <Spinner /> : null}
				{lockSeconds > 0
					? `Aguarde ${lockSeconds}s`
					: placing
						? 'Criando pedido…'
						: 'Ir para o pagamento'}
			</button>
			<p className="text-center text-xs leading-normal text-muted-foreground">
				Ao continuar, você concorda com os{' '}
				<Link
					href={appRoutes.content.page('termos')}
					className="text-primary hover:text-primary-strong"
				>
					termos de uso
				</Link>
				. O total é conferido de novo antes da cobrança.
			</p>
		</>
	);
}

export { OrderReviewAside, PaymentAlert, PaymentReview, PlaceOrderButton };
