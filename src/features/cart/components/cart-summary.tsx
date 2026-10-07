import { ArrowRightIcon, LockSimpleIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import { ComingSoonBadge } from '@/components/coming-soon-badge';
import {
	ActionBarLabel,
	actionBarPrimary,
	MobileActionBar,
} from '@/components/mobile-action-bar';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { formatPieceCount } from '@/features/catalog/lib/format-piece-count';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import type { CartView, CheckoutGate } from '../lib/cart-view';

type CartSummaryProps = {
	view: CartView;
	gate: CheckoutGate;
	onRetry: (() => void) | null;
};

/**
 * "Resumo do pedido" aside; below 980 px a totals card, the EM BREVE note
 * and "Continuar · total" in the action bar (MobileSacola.dc.html).
 */
function CartSummary({ view, gate, onRetry }: CartSummaryProps) {
	const total = formatCurrencyBrlCents(view.total);

	return (
		<>
			<div className="flex flex-col gap-3 min-[980px]:hidden">
				<dl className="flex animate-up flex-col gap-2.5 rounded-2xl border bg-card p-4 text-sm">
					<SummaryRow
						label={`Subtotal · ${formatPieceCount(view.pieceCount)}`}
						value={formatCurrencyBrlCents(view.listSubtotal)}
					/>
					{view.savings > 0 ? (
						<SummaryRow
							label="Promoções"
							value={`− ${formatCurrencyBrlCents(view.savings)}`}
							valueClassName="text-success"
						/>
					) : null}
					<div className="flex items-center justify-between">
						<dt className="text-ink-soft">Frete</dt>
						<dd className="font-mono text-[10px] text-clay">EM BREVE</dd>
					</div>
					<div className="flex items-baseline justify-between border-t pt-2.5">
						<dt className="text-[15px] font-medium">Total</dt>
						<dd
							key={view.total}
							className="animate-fade-in text-[28px] font-light"
						>
							{total}
						</dd>
					</div>
				</dl>
				<div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-dashed px-3.5 py-3 text-[13px] leading-normal text-muted-foreground">
					Frete por CEP, cupom, embrulho para presente e Pix com desconto
					<ComingSoonBadge />
				</div>
			</div>
			<MobileActionBar>
				{!gate.canCheckout && gate.reason ? (
					<span
						role="status"
						className="flex flex-wrap items-center gap-x-2 text-xs text-ink-soft"
					>
						{gate.reason}
						{onRetry ? (
							<button
								type="button"
								onClick={onRetry}
								className="font-medium text-primary underline underline-offset-3"
							>
								Tentar de novo
							</button>
						) : null}
					</span>
				) : null}
				{gate.canCheckout ? (
					<Link href={appRoutes.checkout.delivery} className={actionBarPrimary}>
						<ActionBarLabel label="Continuar" amount={total} />
					</Link>
				) : (
					<button type="button" disabled className={actionBarPrimary}>
						<ActionBarLabel label="Continuar" amount={total} />
					</button>
				)}
			</MobileActionBar>
			<FullSummary view={view} gate={gate} onRetry={onRetry} />
		</>
	);
}

function FullSummary({ view, gate, onRetry }: CartSummaryProps) {
	return (
		<aside className="hidden animate-up flex-col gap-5 rounded-[20px] border bg-card p-6 [animation-delay:.12s] min-[980px]:sticky min-[980px]:top-6 min-[980px]:flex">
			<div className="text-xl font-medium tracking-[-0.01em]">
				Resumo do pedido
			</div>

			<DisabledField
				id="cep"
				label="FRETE POR CEP"
				placeholder="Seu CEP"
				action="Calcular"
			/>
			<DisabledField
				id="cupom"
				label="CUPOM"
				placeholder="Ex.: OUTONO10"
				action="Aplicar"
			/>

			<dl className="flex flex-col gap-2.5 border-t pt-4 text-sm">
				<SummaryRow
					label={`Subtotal · ${formatPieceCount(view.pieceCount)}`}
					value={formatCurrencyBrlCents(view.listSubtotal)}
				/>
				{view.savings > 0 ? (
					<SummaryRow
						label="Promoções"
						value={`− ${formatCurrencyBrlCents(view.savings)}`}
						valueClassName="text-success"
					/>
				) : null}
				<SummaryRow
					label="Frete"
					value="Informe o CEP"
					valueClassName="text-muted-foreground"
				/>
			</dl>

			<div className="flex items-end justify-between border-t pt-4">
				<span className="text-[15px] font-medium">Total</span>
				<div className="flex flex-col items-end gap-0.5">
					<span
						key={view.total}
						className="animate-up text-4xl leading-none font-light tracking-[-0.03em]"
					>
						{formatCurrencyBrlCents(view.total)}
					</span>
					<span className="text-xs text-muted-foreground">
						no cartão de crédito · frete a calcular
					</span>
				</div>
			</div>

			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<ComingSoonBadge />
				Pix com 5% off e parcelamento em 6×. Hoje: cartão de crédito.
			</div>

			{gate.canCheckout ? (
				<Link
					href={appRoutes.checkout.delivery}
					className="shine flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-primary text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
				>
					Continuar para entrega
					<ArrowRightIcon size={16} />
				</Link>
			) : (
				<div className="flex flex-col gap-2">
					<button
						type="button"
						disabled
						aria-describedby="checkout-blocked-reason"
						className="flex h-[52px] cursor-not-allowed items-center justify-center gap-2.5 rounded-xl bg-surface-2 text-base font-medium text-muted-foreground"
					>
						Continuar para entrega
						<ArrowRightIcon size={16} />
					</button>
					{gate.reason ? (
						<p
							id="checkout-blocked-reason"
							role="status"
							className="flex flex-wrap items-center justify-center gap-x-2 text-center text-xs text-ink-soft"
						>
							{gate.reason}
							{onRetry ? (
								<button
									type="button"
									onClick={onRetry}
									className="font-medium text-primary underline underline-offset-3"
								>
									Tentar de novo
								</button>
							) : null}
						</p>
					) : null}
				</div>
			)}

			<div className="flex flex-wrap justify-center gap-4 font-mono text-[10px] tracking-[0.1em] text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<LockSimpleIcon size={12} />
					COMPRA SEGURA
				</span>
				<span>TROCA EM 30 DIAS</span>
			</div>
		</aside>
	);
}

/** CEP and coupon fields: not supported by OrderCore yet (pendencies #3/#4). */
function DisabledField({
	id,
	label,
	placeholder,
	action,
}: {
	id: string;
	label: string;
	placeholder: string;
	action: string;
}) {
	return (
		<div className="flex flex-col gap-2 opacity-55">
			<label
				htmlFor={id}
				className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground"
			>
				{label} <ComingSoonBadge />
			</label>
			<div className="flex gap-2">
				<input
					id={id}
					disabled
					placeholder={placeholder}
					className="h-11 min-w-0 grow rounded-xl border bg-background px-3.5 font-mono text-sm"
				/>
				<button
					type="button"
					disabled
					className="h-11 rounded-xl border bg-card px-4 text-sm font-medium"
				>
					{action}
				</button>
			</div>
		</div>
	);
}

function SummaryRow({
	label,
	value,
	valueClassName,
}: {
	label: string;
	value: string;
	valueClassName?: string;
}) {
	return (
		<div className="flex justify-between gap-3">
			<dt className="text-ink-soft">{label}</dt>
			<dd className={cn('font-mono', valueClassName)}>{value}</dd>
		</div>
	);
}

export { CartSummary };
