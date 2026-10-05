'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Eyebrow } from '@/components/eyebrow';
import { parsePage } from '@/features/admin-orders/lib/order-tabs';
import { cn } from '@/lib/utils';

import { usePaymentCounts, usePayments } from '../hooks/admin-payments.queries';
import { parsePaymentTab, paymentTabs } from '../lib/payments';
import { PaymentPanel } from './payment-panel';
import { PaymentsTable } from './payments-table';

/** Admin · Pagamentos (AdminPagamentos.dc.html). */
function PaymentsPage() {
	return (
		// Status, page and open payment live in the URL (Suspense).
		<Suspense fallback={null}>
			<PaymentsContent />
		</Suspense>
	);
}

function PaymentsContent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tab = parsePaymentTab(searchParams.get('status'));
	const page = parsePage(searchParams.get('pagina'));
	const paymentId = searchParams.get('pagamento');

	const payments = usePayments(tab, page);
	const counts = usePaymentCounts();

	function update(changes: Record<string, string | null>) {
		const params = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(changes)) {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		}
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	}

	return (
		<div className="flex min-h-full grow">
			<section
				className={cn(
					'min-w-0 grow flex-col gap-4 px-5 py-7 min-[980px]:pr-6 min-[980px]:pl-8',
					paymentId ? 'hidden min-[1280px]:flex' : 'flex',
				)}
			>
				<div className="flex flex-col gap-1">
					<Eyebrow className="tracking-[0.16em]">CLIENTES E FINANÇAS</Eyebrow>
					<h1 className="text-[34px] font-light tracking-[-0.025em]">
						Pagamentos
					</h1>
				</div>
				<div
					role="tablist"
					aria-label="Status"
					className="flex flex-wrap gap-1.5"
				>
					{paymentTabs.map((option) => {
						const selected = option.id === tab.id;
						return (
							<button
								key={option.id}
								type="button"
								role="tab"
								aria-selected={selected}
								onClick={() =>
									update({
										status: option.id === 'todos' ? null : option.id,
										pagina: null,
									})
								}
								className={cn(
									'flex h-9 items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors',
									selected
										? 'bg-foreground text-white'
										: 'bg-card text-ink-soft hover:bg-surface-2',
								)}
							>
								{option.label}
								<span className="font-mono text-[11px] opacity-75">
									{counts.data?.[option.id] ?? '·'}
								</span>
							</button>
						);
					})}
				</div>
				<PaymentsTable
					payments={payments.data?.items}
					selectedId={paymentId}
					onOpen={(id) => update({ pagamento: id })}
					page={page}
					totalPages={payments.data?.totalPages ?? 1}
					onPage={(next) => update({ pagina: next > 1 ? String(next) : null })}
					loading={payments.isPlaceholderData}
					failed={payments.isError && !payments.data}
					onRetry={() => void payments.refetch()}
				/>
			</section>
			{paymentId ? (
				<PaymentPanel
					key={paymentId}
					paymentId={paymentId}
					onClose={() => update({ pagamento: null })}
				/>
			) : (
				<aside className="hidden w-[400px] shrink-0 items-center justify-center border-l bg-card px-10 text-center text-sm text-muted-foreground min-[1280px]:sticky min-[1280px]:top-0 min-[1280px]:flex min-[1280px]:h-screen">
					Escolha um pagamento para ver os eventos, conferir com o Stripe ou
					estornar.
				</aside>
			)}
		</div>
	);
}

export { PaymentsPage };
