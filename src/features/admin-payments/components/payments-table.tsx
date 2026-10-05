'use client';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

import { formatOrderMoment } from '@/features/admin-orders/lib/order-format';
import { formatCurrencyBrlCents } from '@/features/catalog/lib/format-currency-brl';
import { cn } from '@/lib/utils';

import { paymentStatusView } from '../lib/payments';
import type { PaymentSummary } from '../schemas/admin-payments.schema';

type PaymentRow = PaymentSummary & { orderNumber: string | null };

const columns =
	'grid grid-cols-[minmax(0,1fr)_138px_100px_92px_120px] items-center gap-3 min-[1440px]:grid-cols-[180px_150px_120px_120px_minmax(0,1fr)]';

function PaymentsTable({
	payments,
	selectedId,
	onOpen,
	page,
	totalPages,
	onPage,
	loading,
	failed,
	onRetry,
}: {
	payments: PaymentRow[] | undefined;
	selectedId: string | null;
	onOpen: (paymentId: string) => void;
	page: number;
	totalPages: number;
	onPage: (page: number) => void;
	loading: boolean;
	failed: boolean;
	onRetry: () => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			<div className="overflow-hidden rounded-2xl border bg-card">
				<div className="overflow-x-auto">
					<div className="min-w-[580px]">
						<div
							className={cn(
								columns,
								'bg-surface px-[18px] py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground',
							)}
						>
							<span>PAGAMENTO</span>
							<span>PEDIDO</span>
							<span>VALOR</span>
							<span>ESTORNADO</span>
							<span>STATUS</span>
						</div>
						{failed ? (
							<div
								role="alert"
								className="flex flex-col items-center gap-2 border-t p-10 text-sm text-ink-soft"
							>
								Não foi possível carregar os pagamentos.
								<button
									type="button"
									onClick={onRetry}
									className="font-medium text-primary hover:text-primary-strong"
								>
									Tentar de novo
								</button>
							</div>
						) : !payments ? (
							<div className="flex flex-col gap-2 border-t p-[18px]">
								{[0, 1, 2, 3, 4].map((index) => (
									<div key={index} className="skeleton h-11 rounded-lg" />
								))}
							</div>
						) : payments.length === 0 ? (
							<p className="border-t p-10 text-center text-sm text-muted-foreground">
								Nenhum pagamento neste filtro.
							</p>
						) : (
							<div className={cn(loading && 'opacity-60 transition-opacity')}>
								{payments.map((payment) => {
									const selected = payment.id === selectedId;
									const status = paymentStatusView(
										payment.status,
										payment.refundedAmount,
									);
									return (
										<button
											key={payment.id}
											type="button"
											onClick={() => onOpen(payment.id)}
											aria-pressed={selected}
											className={cn(
												columns,
												'w-full border-t border-l-[3px] px-[18px] py-3 text-left text-sm transition-colors',
												selected
													? 'border-l-primary bg-primary-soft'
													: 'border-l-transparent hover:bg-[#FAFAF8]',
											)}
										>
											<span className="flex min-w-0 flex-col">
												<span className="text-[13px]">
													{payment.method === 'Pix' ? 'Pix' : 'Cartão'}
												</span>
												<span className="truncate text-xs text-muted-foreground">
													{formatOrderMoment(payment.createdAt)}
												</span>
											</span>
											<span className="truncate font-mono text-xs">
												{payment.orderNumber ?? '—'}
											</span>
											<span className="font-mono text-[13px]">
												{formatCurrencyBrlCents(payment.amount)}
											</span>
											<span className="font-mono text-[13px] text-muted-foreground">
												{payment.refundedAmount > 0
													? formatCurrencyBrlCents(payment.refundedAmount)
													: '—'}
											</span>
											<span>
												<span
													key={status.label}
													className={cn(
														'inline-flex h-[22px] animate-pop-in items-center rounded-full px-[9px] text-xs font-medium whitespace-nowrap',
														status.className,
													)}
												>
													{status.label}
												</span>
											</span>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
			{totalPages > 1 ? (
				<nav
					aria-label="Páginas"
					className="flex items-center justify-end gap-2 text-sm text-ink-soft"
				>
					<span className="font-mono text-xs">
						{page} / {totalPages}
					</span>
					<button
						type="button"
						onClick={() => onPage(page - 1)}
						disabled={page <= 1}
						aria-label="Página anterior"
						className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
					>
						<CaretLeftIcon size={14} />
					</button>
					<button
						type="button"
						onClick={() => onPage(page + 1)}
						disabled={page >= totalPages}
						aria-label="Próxima página"
						className="flex size-9 items-center justify-center rounded-lg border bg-card hover:bg-surface-2 disabled:opacity-40"
					>
						<CaretRightIcon size={14} />
					</button>
				</nav>
			) : null}
		</div>
	);
}

export type { PaymentRow };
export { PaymentsTable };
