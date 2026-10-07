import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import Link from 'next/link';

import {
	ActionBarLabel,
	actionBarPrimary,
	MobileActionBar,
} from '@/components/mobile-action-bar';
import type { CartView } from '@/features/cart/lib/cart-view';
import { ProductArt } from '@/features/catalog/components/product-art';
import {
	formatCurrencyBrl,
	formatCurrencyBrlCents,
} from '@/features/catalog/lib/format-currency-brl';
import { formatPieceCount } from '@/features/catalog/lib/format-piece-count';
import { getProductVisual } from '@/features/catalog/lib/product-visuals';
import { appRoutes } from '@/lib/routes/app-routes';

type CheckoutSummaryProps = {
	view: CartView;
	/** Where "Continuar" goes; null shows the blocked button. */
	continueHref: string | null;
	continueLabel: string;
	/** Text of the blocked button / reason under it. */
	blockedLabel: string;
	blockedReason: string | null;
};

/**
 * "Seu pedido" aside of the checkout steps; below 980 px a totals card,
 * with "Continuar" in the action bar (MobileCheckout.dc.html).
 */
function CheckoutSummary({
	view,
	continueHref,
	continueLabel,
	blockedLabel,
	blockedReason,
}: CheckoutSummaryProps) {
	const total = formatCurrencyBrlCents(view.total);

	return (
		<>
			<TotalsCard view={view} />
			<MobileActionBar>
				{/* The bar keeps the short action; what blocks it goes above. */}
				{continueHref ||
				!(blockedReason ?? blockedLabel !== continueLabel) ? null : (
					<span role="status" className="text-xs text-ink-soft">
						{blockedReason ?? blockedLabel}
					</span>
				)}
				{continueHref ? (
					<Link href={continueHref} className={actionBarPrimary}>
						<ActionBarLabel label="Ir para o pagamento" amount={total} />
					</Link>
				) : (
					<button type="button" disabled className={actionBarPrimary}>
						<ActionBarLabel label="Ir para o pagamento" amount={total} />
					</button>
				)}
			</MobileActionBar>
			<FullSummary
				view={view}
				continueHref={continueHref}
				continueLabel={continueLabel}
				blockedLabel={blockedLabel}
				blockedReason={blockedReason}
			/>
		</>
	);
}

/** Below 980 px: "N peças · Frete" (MobileCheckout.dc.html). */
function TotalsCard({ view }: { view: CartView }) {
	return (
		<dl className="flex flex-col gap-2 rounded-2xl border bg-card px-4 py-3.5 text-sm min-[980px]:hidden">
			<div className="flex justify-between">
				<dt className="text-ink-soft">{formatPieceCount(view.pieceCount)}</dt>
				<dd className="font-mono">{formatCurrencyBrlCents(view.total)}</dd>
			</div>
			<div className="flex items-center justify-between">
				<dt className="text-ink-soft">Frete</dt>
				<dd className="font-mono text-[10px] text-clay">EM BREVE</dd>
			</div>
		</dl>
	);
}

function FullSummary({
	view,
	continueHref,
	continueLabel,
	blockedLabel,
	blockedReason,
}: CheckoutSummaryProps) {
	return (
		<aside className="hidden animate-up flex-col gap-[18px] rounded-[20px] border bg-card p-6 [animation-delay:.12s] min-[980px]:sticky min-[980px]:top-6 min-[980px]:flex">
			<div className="flex items-baseline justify-between">
				<span className="text-xl font-medium">Seu pedido</span>
				<Link
					href={appRoutes.cart.index}
					className="text-[13px] font-medium text-primary hover:text-primary-strong"
				>
					Editar
				</Link>
			</div>
			<ul className="flex flex-col gap-3">
				{view.lines.map((line) => {
					const visual = getProductVisual(line.slug);
					return (
						<li key={line.productId} className="flex items-center gap-3">
							<div
								className="relative flex size-[52px] shrink-0 items-center justify-center rounded-[10px]"
								style={{ background: visual.tint }}
							>
								<ProductArt kind={visual.kind} size={30} />
								<span
									aria-label={`${line.quantity} unidade(s)`}
									className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-[5px] font-mono text-[11px] text-background"
								>
									{line.quantity}
								</span>
							</div>
							<span className="grow text-sm">{line.name}</span>
							<span className="font-mono text-[13px]">
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
				<div className="flex items-center justify-between">
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
			{continueHref ? (
				<Link
					href={continueHref}
					className="shine flex h-[52px] items-center justify-center gap-2.5 rounded-xl bg-primary text-base font-medium text-primary-foreground transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-primary-strong"
				>
					{continueLabel}
					<ArrowRightIcon size={16} />
				</Link>
			) : (
				<div className="flex flex-col gap-2">
					<button
						type="button"
						disabled
						aria-describedby={blockedReason ? 'checkout-blocked' : undefined}
						className="h-[52px] cursor-not-allowed rounded-xl bg-border text-base font-medium text-muted-foreground"
					>
						{blockedLabel}
					</button>
					{blockedReason ? (
						<p
							id="checkout-blocked"
							role="status"
							className="text-center text-xs text-ink-soft"
						>
							{blockedReason}
						</p>
					) : null}
				</div>
			)}
			<Link
				href={appRoutes.cart.index}
				className="flex items-center gap-1.5 self-center text-sm font-medium text-primary hover:text-primary-strong"
			>
				<ArrowLeftIcon size={14} />
				Voltar para a sacola
			</Link>
		</aside>
	);
}

export { CheckoutSummary, TotalsCard };
